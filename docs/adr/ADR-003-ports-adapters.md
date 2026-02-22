# ADR-003 : Pattern Ports/Adapters pour les repositories

## Statut

Accepté

## Contexte

L'application d'origine accède directement à la base de données depuis les routes Express, ce qui couple fortement la logique métier aux briques techniques (SQLite, MySQL). Cela rend le code difficile à tester et impossible à faire évoluer sans modifier la logique applicative.

## Décision

Appliquer le pattern Ports/Adapters (architecture hexagonale) :

- **Ports** : interfaces TypeScript définies dans la couche domaine
  - `TodoRepository` (`domain/todo.ts`) : `getItems`, `addItem`, `updateItem`, `removeItem`
  - `UserRepository` (`domain/user.ts`) : `createUser`, `findByEmail`, `findById`, `deleteUser`, `getAllUserData`

- **Adapters** : implémentations concrètes dans `infrastructure/`
  - `InMemoryTodoRepository` / `InMemoryUserRepository` (tests)
  - `SqliteTodoRepository` / `SqliteUserRepository` (développement)
  - `MysqlTodoRepository` / `MysqlUserRepository` (production)

- **Injection de dépendances** : les repositories sont instanciés dans `index.ts` et injectés dans les routes via des factory functions (`makeAddItem(repo)`, `makeRegister(userRepo)`).

## Alternatives considérées

- **Accès direct à la base dans les routes** : écarté car cela viole le principe de séparation des responsabilités et rend les tests unitaires impossibles sans base de données.
- **ORM complet (Prisma, TypeORM)** : écarté car cela introduit une dépendance lourde pour un projet de cette taille. Les repositories manuels sont suffisants et plus pédagogiques.

## Conséquences

**Positif :**
- Le domaine métier n'a aucune dépendance technique
- Les tests utilisent `InMemoryRepository` : rapides, déterministes, sans I/O
- Changer de base de données ne nécessite qu'un nouvel adapter
- Le code est testable, maintenable et évolutif

**Négatif :**
- Plus de fichiers et d'interfaces à maintenir
- L'injection de dépendances manuelle peut devenir verbose sur un projet plus grand
