# Ревью существующего кода

## Исходный материал для ревью

```js
const express = require('express');
const fs = require('fs');
const app = express();

app.use(express.json());

let links = JSON.parse(fs.readFileSync('links.json'));

app.post('/links', async (req, res) => {
 const { url } = req.body;
 const html = await fetch(url).then(r => r.text());
 const title = html.match(/<title>(.*)<\/title>/)[1];
 const link = { id: Date.now(), url, title, savedAt: new Date() };
 links.push(link);
 fs.writeFileSync('links.json', JSON.stringify(links));
 res.json(link);
});

app.delete('/links/:id', (req, res) => {
 links = links.filter(l => l.id === req.params.id);
 fs.writeFileSync('links.json', JSON.stringify(links));
 res.sendStatus(200);
});

app.listen(3000);
```

## Краткий вывод

В коде есть один подтверждённый риск потери данных, несколько сценариев аварийного запуска и маршрут удаления, который не удаляет записи, созданные этим приложением. В первую очередь требуются атомарное сохранение, явная обработка ошибок хранилища, безопасная работа с URL и заголовками, а также стабильные строковые идентификаторы.

## Найденные проблемы

| Приоритет | Проблема | Что ломается и при каком состоянии | Исправление |
| --- | --- | --- | --- |
| P1 — высокий | `writeFileSync('links.json', ...)` перезаписывает единственный файл данных напрямую. | Аварийное завершение процесса, нехватка места на диске или прерывание записи могут оставить усечённый или некорректный файл. При следующем запуске `JSON.parse` завершит приложение с ошибкой, а сохранённые ссылки могут быть потеряны. | Записывать во временный файл в той же директории, затем переименовывать его поверх основного. Ошибки каждого шага явно возвращать как ошибку хранилища. |
| P1 — высокий | ID — число, а `req.params.id` всегда строка. | У созданной записи `id: 123`, но `123 === '123'` равно `false`; поэтому `DELETE /links/123` не удаляет её. При этом маршрут отвечает 200, хотя ничего не удалено. | Использовать строковые ID через `randomUUID()` либо явно разбирать и проверять параметр. При отсутствии записи возвращать 404. |
| P1 — высокий | При старте выполняются непроверенные синхронные чтение и разбор относительного пути. | Первый запуск без `links.json`, некорректный JSON, другой текущий каталог или отсутствие прав на чтение завершают процесс до старта сервера. | Разрешать путь относительно приложения, создавать директорию и файл `[]`, если он отсутствует, а для повреждённых или недоступных данных возвращать ясную ошибку хранилища. |
| P1 — высокий | У удалённого запроса нет тайм-аута и обработки ошибок. | Медленный или недоступный хост может держать запрос открытым бесконечно; ошибки DNS, TLS или `fetch` отклоняют async-обработчик. | Сначала валидировать URL, использовать `AbortController` с ограниченным временем и возвращать ожидаемые ошибки получения страницы со статусом 422. |
| P1 — высокий | `html.match(/<title>(.*)<\/title>/)[1]` предполагает единственный однострочный title. | Для страниц без title, с переносом строки внутри title, тегами в другом регистре или невалидным HTML `match(...)` возвращает `null`, а обращение `[1]` выбрасывает исключение. Выражение также жадное. | Проверять успешность и HTML-тип ответа, затем разбирать документ HTML-парсером. Ошибкой считать только отсутствие пригодного заголовка после разбора. |
| P2 — средний | Тело запроса напрямую используется как цель `fetch` без валидации. | Пустой, нестроковый, некорректный или неподдерживаемый URL вызывает ошибку. Кроме того, серверные запросы способны достигать адресов, недоступных из браузера, поэтому утверждать полную защиту от SSRF нельзя. | Требовать непустую строку, разбирать через `URL` и принимать только `http:` или `https:`. Ограничения полной SSRF-защиты задокументировать. |
| P2 — средний | Игнорируются статус HTTP и тип содержимого. | HTML-страница ошибки 404/500 может быть сохранена как заголовок; JSON, скачиваемый файл или другой не-HTML ответ разбирается как страница. | До чтения тела требовать `response.ok` и HTML `content-type`. |
| P2 — средний | Операционные исключения уходят в стандартную обработку Express. | Ошибки сети, разбора или диска дают непоследовательные ответы и в зависимости от конфигурации могут раскрыть детали реализации. | Использовать центральный обработчик ошибок с явными типами ошибок валидации, получения страницы, отсутствующей записи и хранилища. |
| P2 — средний | Код безопасен только для одного процесса и не сериализует обновления. | Второй экземпляр сервера, работающий с тем же файлом, может перезаписать изменения первого. | Для JSON-хранилища явно зафиксировать ограничение одним процессом; при нескольких процессах использовать БД или блокировки. |
| P3 — низкий | Семантика API неполная и неоднозначная. | Нет маршрута списка, создание отвечает 200 вместо 201, а удаление неизвестного ID сообщает об успехе. | Добавить `GET /api/links`, возвращать 201 при создании, 204 при успешном удалении и 404 для неизвестного ID. |

## Исправленный код

Исправленная реализация разделяет хранилище, получение URL и заголовка, бизнес-логику и HTTP-маршруты. Фрагменты ниже показывают изменения, устраняющие описанные сбои.

### Безопасное хранилище

```js
const { randomUUID } = require('node:crypto');
const fs = require('node:fs/promises');
const path = require('node:path');

class JsonLinkStore {
  constructor({ filePath }) {
    this.filePath = path.resolve(filePath);
  }

  async initialise() {
    await fs.mkdir(path.dirname(this.filePath), { recursive: true });
    try {
      await fs.access(this.filePath);
    } catch (error) {
      if (error.code !== 'ENOENT') throw new Error('Saved links could not be accessed.');
      await this.#write([]);
    }
    await this.#read();
  }

  async #read() {
    const contents = await fs.readFile(this.filePath, 'utf8');
    const links = JSON.parse(contents);
    if (!Array.isArray(links)) throw new Error('Saved links must be an array.');
    return links;
  }

  async #write(links) {
    const temporaryPath = `${this.filePath}.${randomUUID()}.tmp`;
    await fs.writeFile(temporaryPath, `${JSON.stringify(links, null, 2)}\n`, 'utf8');
    await fs.rename(temporaryPath, this.filePath);
  }
}
```

### Валидация URL и надёжное получение заголовка

```js
function normaliseUrl(value) {
  if (typeof value !== 'string' || value.trim() === '') throw new Error('Enter a URL to save.');
  const url = new URL(value.trim());
  if (!['http:', 'https:'].includes(url.protocol)) throw new Error('Only HTTP and HTTPS URLs can be saved.');
  return url.toString();
}

async function fetchPageTitle(url, { fetchImpl = fetch, timeoutMs = 5000 } = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetchImpl(url, { signal: controller.signal, headers: { accept: 'text/html,application/xhtml+xml' } });
    if (!response.ok) throw new Error('The page could not be retrieved.');
    if (!response.headers.get('content-type')?.toLowerCase().includes('html')) throw new Error('The URL does not point to an HTML page.');
    const title = extractTitleWithHtmlParser(await response.text());
    if (!title) throw new Error('The page does not have a usable title.');
    return title;
  } finally {
    clearTimeout(timeout);
  }
}
```

### Корректное удаление

```js
async function deleteLink(store, id) {
  const deletedLink = await store.delete(id);
  if (!deletedLink) throw new Error('The saved link was not found.');
}

router.delete('/:id', async (request, response, next) => {
  try {
    await deleteLink(store, request.params.id);
    response.status(204).end();
  } catch (error) {
    next(error);
  }
});
```

В текущем репозитории эти идеи реализованы в `src/backend/storage/json-link-store.js`, `src/backend/lib/url.js`, `src/backend/lib/title-fetcher.js`, `src/backend/services/link-service.js` и `src/backend/routes/link-routes.js`.

## Подтверждение регрессии

Регрессия удаления покрыта тестами: они создают две ссылки, удаляют одну по стабильному строковому ID и проверяют, что исчезает только выбранная ссылка. Это подтверждает, что исходная ошибка сравнения числа со строкой не может повториться в исправленном поведении.
