# 📰 News Fetching API

A simple, fast API to retrieve news articles, bulletins, or CVEs based on technology, vendor, or product search terms. Deployed via Vercel.

---

## 📍 Deployment

**Base URL:**  
`https://XXXXX/api`

---

## 🚀 Endpoint

### `GET /news`

Fetch news articles based on your specified search criteria.

#### 🔸 Query Parameters

| Name    | Type    | Required | Description                                                                 |
|---------|---------|----------|-----------------------------------------------------------------------------|
| `terms` | string  | ✅ yes   | Comma-separated list of terms (e.g., `Microsoft Windows, IBM Websphere`).   |
| `last`  | string  | ❌ no    | Return items published in the last **N** hours (default: `24`).             |
| `count` | integer | ❌ no    | Max number of articles to retrieve (default: `50`).                         |

#### 🛡️ Authentication

Use an API key via the header:

```http
X-API-KEY: your_api_key_here
```

## 🧾 Responses

### ✅ `200 OK`

Returns an array of articles:

```json
[
  {
    "title": "Example title",
    "url": "https://example.com/article",
    "crawled": "2025-07-21T12:00:00Z",
    "published": "2025-07-21T10:30:00Z",
    "content_txt": "Full article text or summary..."
  }
]
```
### ⚠️ Errors

| Code | Meaning                         | Response Format                        |
|------|----------------------------------|----------------------------------------|
| 400  | Missing `terms` or API key       | `{ "error": "error message" }`         |
| 401  | Invalid API key                  | `{ "error": "Unauthorized" }`          |
| 405  | Method not allowed               | `{ "error": "Method not allowed" }`    |
| 500  | Internal server/backend error    | `{ "error": "Something went wrong" }`  |

---

## 📦 Components

### `Article` Schema

- `title` (string)
- `url` (string, URI)
- `crawled` (string, date-time)
- `published` (string, date-time)
- `content_txt` (string)

### `Error` Schema

- `error` (string)

---

## 🛠️ Example Request

```bash
curl -X GET "https://XXXXX/api/news?terms=Microsoft,Windows&last=12&count=10" \
  -H "X-API-KEY: YOUR_API_KEY"

