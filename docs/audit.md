# Initial Audit — Getting Started Todo App

## Overview

This document provides a detailed analysis of the original [docker/getting-started-todo-app](https://github.com/docker/getting-started-todo-app) codebase. It identifies strengths, weaknesses and areas of risk **before any refactoring is applied**.

---

## 1. Repository Structure

```
getting-started-todo-app/
├── backend/
│   ├── package.json              # Express 5, mysql2, sqlite3, uuid, wait-port
│   ├── package-lock.json
│   ├── spec/
│   │   ├── persistence/
│   │   │   └── sqlite.spec.js    # 5 tests: init, store/retrieve, update, remove, getItem
│   │   └── routes/
│   │       ├── addItem.spec.js   # 1 test (mocked)
│   │       ├── deleteItem.spec.js
│   │       ├── getItems.spec.js
│   │       └── updateItem.spec.js
│   └── src/
│       ├── index.js              # Express entry point, listens on port 3000
│       ├── persistence/
│       │   ├── index.js          # Implicit SQLite/MySQL switch via env var
│       │   ├── sqlite.js
│       │   └── mysql.js
│       ├── routes/
│       │   ├── addItem.js        # POST   /api/items
│       │   ├── deleteItem.js     # DELETE /api/items/:id
│       │   ├── getGreeting.js    # GET    /api/greeting
│       │   ├── getItems.js       # GET    /api/items
│       │   └── updateItem.js     # PUT    /api/items/:id
│       └── static/               # Static assets (favicon, etc.)
├── client/
│   ├── package.json              # React 19, Bootstrap, Sass, FontAwesome, Vite
│   ├── package-lock.json
│   ├── index.html
│   ├── vite.config.js
│   └── src/
│       ├── App.jsx
│       ├── main.jsx
│       ├── index.scss
│       └── components/
│           ├── AddNewItemForm.jsx
│           ├── Greeting.jsx
│           ├── ItemDisplay.jsx
│           ├── ItemDisplay.scss
│           └── TodoListCard.jsx
├── Dockerfile                    # Multi-stage: client-dev, client-build, backend-dev, test, final
├── compose.yaml                  # 5 services: proxy (Traefik), backend, client, mysql, phpmyadmin
├── .dockerignore
├── .gitignore
├── LICENSE
└── README.md
```

---

## 2. Issues Identified

### 2.1. Mixed Responsibilities

- **Routes directly import the persistence layer.** Every route handler (`addItem.js`, `getItems.js`, etc.) does `require('../persistence')`, creating tight coupling between the API layer and data access.

  ```javascript
  // backend/src/routes/addItem.js
  const db = require('../persistence');
  ```

- **Implicit database switch without a contract.** `persistence/index.js` chooses between SQLite and MySQL based on the presence of `MYSQL_HOST` in environment variables. There is no interface, no dependency injection and no explicit contract.

  ```javascript
  // backend/src/persistence/index.js
  if (process.env.MYSQL_HOST) module.exports = require('./mysql');
  else module.exports = require('./sqlite');
  ```

- **Frontend fetches directly inside components.** `TodoListCard.jsx` calls `fetch('/api/items')` in a `useEffect` hook with no service layer or abstraction.

  ```javascript
  // client/src/components/TodoListCard.jsx
  useEffect(() => {
      fetch('/api/items')
          .then((r) => r.json())
          .then(setItems);
  }, []);
  ```

### 2.2. Strong Dependencies

| Dependency | Problem |
|------------|---------|
| `sqlite3` | Listed as a runtime dependency even though it is only a dev/fallback database |
| `mysql2` | Both database drivers bundled in production regardless of which is used |
| `wait-port` | Runtime dependency but only useful during Docker-based development |
| `prop-types` (client) | Used for runtime prop checking instead of TypeScript static types |

### 2.3. Risk Areas

- **Hardcoded SQLite path.** `sqlite.js` defaults to `/etc/todos/todo.db`, an absolute path that only works inside the Docker container.

  ```javascript
  const location = process.env.SQLITE_DB_LOCATION || '/etc/todos/todo.db';
  ```

- **SQLite tests depend on the real filesystem.** `sqlite.spec.js` creates an actual database file on disk, making tests slow, non-isolated and environment-dependent.

- **No input validation.** None of the route handlers validate `req.body` or `req.params`. A `POST /api/items` with an empty body will insert a todo with `name: undefined`.

  ```javascript
  // backend/src/routes/addItem.js — no validation
  const item = {
      id: uuid(),
      name: req.body.name, // could be undefined
      completed: false,
  };
  ```

- **No centralized error handling.** There is no Express error middleware. If a database call throws, the response hangs or crashes.

- **No authentication or user management.** All todos are global; there is no concept of user ownership.

- **No E2E tests.** The frontend has zero test coverage — no Playwright, no Cypress, nothing.

- **Missing test for `getGreeting`.** The greeting route has no corresponding test file.

- **`console.log` in production.** Both `sqlite.js` and `mysql.js` log to stdout unconditionally (only SQLite has a partial `NODE_ENV` guard).

---

## 3. What Already Works Well

| Aspect | Detail |
|--------|--------|
| **Folder separation** | Backend and client are already in separate directories |
| **Existing tests** | Route tests use Jest mocks correctly; SQLite persistence has 5 integration tests |
| **Lock files** | Both `package-lock.json` files are present and committed |
| **Dockerfile** | Multi-stage build is well-structured (dev, test, prod stages) |
| **compose.yaml** | Detailed and documented with 5 services and compose watch support |
| **Express version** | Already on Express 5 (latest) |
| **Node version** | Dockerfile uses `node:22-alpine` (current LTS) |
| **SQL queries** | All queries use parameterized placeholders (`?`), preventing SQL injection |

---

## 4. Detailed Source Analysis

### 4.1. `backend/src/persistence/index.js` — The Central Problem

This 2-line file is the root of the coupling issue:

```javascript
if (process.env.MYSQL_HOST) module.exports = require('./mysql');
else module.exports = require('./sqlite');
```

Both `sqlite.js` and `mysql.js` export the same set of functions (`init`, `teardown`, `getItems`, `getItem`, `storeItem`, `updateItem`, `removeItem`) but there is **no formal interface** enforcing this contract. Nothing prevents one implementation from drifting out of sync with the other.

### 4.2. `backend/src/routes/addItem.js` — Coupling Example

```javascript
const db = require('../persistence');
const { v4: uuid } = require('uuid');

module.exports = async (req, res) => {
    const item = {
        id: uuid(),
        name: req.body.name,
        completed: false,
    };
    await db.storeItem(item);
    res.send(item);
};
```

Problems:
1. Direct `require` of persistence — the route is bound to a specific module path
2. No validation of `req.body.name`
3. ID generation is embedded in the route instead of the domain layer

### 4.3. `backend/src/index.js` — Composition Root (Implicit)

```javascript
const db = require('./persistence');
// ...
db.init().then(() => {
    app.listen(3000, () => console.log('Listening on port 3000'));
});
```

The entry point initializes the database and sets up routes, but dependency injection is missing. The `db` module is resolved at import time by Node's `require`, not passed as a parameter.

### 4.4. `client/src/components/TodoListCard.jsx` — Frontend Coupling

The component directly calls `fetch('/api/items')` and manages state locally. There is no API service layer, no error handling on the fetch, and no loading/error states beyond a simple `'Loading...'` string.

---

## 5. Summary of Required Changes

Based on this audit, the following refactoring priorities are identified:

1. **Secure with tests** before any code change (backend missing tests + frontend E2E)
2. **Migrate to TypeScript** (both backend and frontend)
3. **Decouple via Ports/Adapters** (define `TodoRepository` interface, inject implementations)
4. **Add input validation** and centralized error handling
5. **Add authentication** and user-scoped todos
6. **Separate Dockerfiles** for backend and frontend
7. **Document decisions** via ADR (Architecture Decision Records)
