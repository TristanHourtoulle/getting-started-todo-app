# Todo List — Clean Code Refactoring

Application Todo List refondue selon les principes du clean code : TypeScript strict, architecture hexagonale (Ports/Adapters), authentification JWT et conformité RGPD.

## Architecture

```
┌─────────────┐     ┌──────────────┐     ┌───────────┐
│   React     │────▶│   Express    │────▶│  MySQL /  │
│   (Vite)    │◀────│   (API)      │◀────│  SQLite   │
│   :5173     │     │   :3000      │     │           │
└─────────────┘     └──────────────┘     └───────────┘
       │                    │
       └────────┬───────────┘
                │
         ┌──────┴──────┐
         │   Traefik   │
         │   (proxy)   │
         │    :80      │
         └─────────────┘
```

- **Frontend** (`client/`) : React 18, Vite, TypeScript, React Bootstrap
- **Backend** (`backend/`) : Node.js 22, Express, TypeScript
- **Base de données** : MySQL 9 (production) / SQLite (développement local)
- **Proxy** : Traefik v3 (routage frontend/backend/phpMyAdmin)

### Pattern Ports/Adapters

Le backend suit une architecture hexagonale :

- **Domaine** (`src/domain/`) : interfaces `TodoRepository` et `UserRepository`
- **Infrastructure** (`src/infrastructure/`) : implémentations concrètes (InMemory, SQLite, MySQL)
- **Routes** (`src/routes/`) : factory functions recevant les repositories par injection de dépendances

## Prérequis

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (inclut Docker Compose)

## Lancement

```bash
git clone https://github.com/TristanHourtoulle/getting-started-todo-app
cd getting-started-todo-app
docker compose up --watch
```

L'application est accessible à :

| Service      | URL                                          |
| ------------ | -------------------------------------------- |
| Application  | [http://localhost](http://localhost)          |
| phpMyAdmin   | [http://db.localhost](http://db.localhost)    |

Le mode `--watch` synchronise automatiquement les fichiers sources avec les conteneurs (hot reload).

### Arrêt

```bash
docker compose down
```

## Tests

### Backend (unitaires + intégration)

```bash
cd backend
npm install
npm test
```

Les tests utilisent `InMemoryRepository` — aucune base de données nécessaire.

### Frontend (E2E)

```bash
cd client
npm install
npx playwright install
npm run test:e2e
```

## Structure du projet

```
/
├── backend/
│   ├── src/
│   │   ├── domain/              # Couche métier (interfaces)
│   │   │   ├── todo.ts          # TodoItem + TodoRepository
│   │   │   └── user.ts          # User + UserRepository
│   │   ├── infrastructure/      # Implémentations concrètes
│   │   │   ├── InMemory*.ts     # Adapters pour les tests
│   │   │   ├── Sqlite*.ts       # Adapters SQLite
│   │   │   └── Mysql*.ts        # Adapters MySQL
│   │   ├── routes/
│   │   │   ├── items.ts         # Routes CRUD todos
│   │   │   └── auth.ts          # Routes authentification + RGPD
│   │   └── index.ts             # Point d'entrée, DI, configuration
│   ├── tests/                   # Tests unitaires et intégration
│   └── package.json
├── client/
│   ├── src/
│   │   ├── components/          # Composants React
│   │   ├── contexts/            # AuthContext (état d'authentification)
│   │   ├── services/            # Client API (fetch + token JWT)
│   │   └── types/               # Types partagés
│   └── package.json
├── docs/
│   └── adr/                     # Architecture Decision Records
├── compose.yaml                 # Orchestration Docker
├── Dockerfile                   # Build multi-étapes (frontend + backend)
└── README.md
```

## Authentification

- **Inscription** : `POST /api/auth/register` (email + mot de passe)
- **Connexion** : `POST /api/auth/login` (retourne un JWT)
- **Profil** : `GET /api/auth/profile` (données utilisateur)

Le token JWT est envoyé via le header `Authorization: Bearer <token>`.

## RGPD

- **Export des données** : `GET /api/auth/export` — téléchargement JSON de toutes les données personnelles
- **Suppression du compte** : `DELETE /api/auth/profile` — suppression en cascade (utilisateur + todos)
- **Minimisation** : seuls l'email et le mot de passe hashé sont stockés

## Stack technique

| Composant    | Technologie                    |
| ------------ | ------------------------------ |
| Frontend     | React 18, Vite, TypeScript     |
| UI           | React Bootstrap                |
| Backend      | Node.js 22, Express, TypeScript|
| Auth         | JWT (jsonwebtoken), bcryptjs   |
| BDD          | MySQL 9 / SQLite               |
| Tests        | Vitest, Playwright             |
| Conteneurs   | Docker, Docker Compose         |
| Proxy        | Traefik v3                     |

## Documentation des décisions

Les Architecture Decision Records (ADR) sont disponibles dans [`docs/adr/`](docs/adr/) :

- [ADR-001](docs/adr/ADR-001-monorepo-separation.md) — Monorepo avec séparation frontend/backend
- [ADR-002](docs/adr/ADR-002-typescript-migration.md) — Migration TypeScript
- [ADR-003](docs/adr/ADR-003-ports-adapters.md) — Pattern Ports/Adapters
- [ADR-004](docs/adr/ADR-004-inmemory-repository.md) — InMemoryRepository pour les tests
- [ADR-005](docs/adr/ADR-005-jwt-authentication.md) — JWT pour l'authentification
- [ADR-006](docs/adr/ADR-006-rgpd-compliance.md) — Conformité RGPD
- [ADR-007](docs/adr/ADR-007-docker-compose.md) — Docker Compose pour l'environnement
