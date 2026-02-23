# ADR-004 : InMemoryRepository pour les tests

## Statut

Accepté

## Contexte

Les tests unitaires et d'intégration doivent être rapides, isolés et déterministes. Dépendre d'une vraie base de données (SQLite ou MySQL) ralentit les tests, introduit des effets de bord et complexifie le setup du CI. Le pattern Ports/Adapters (ADR-003) permet de substituer l'implémentation concrète des repositories.

## Décision

Créer des implémentations `InMemoryTodoRepository` et `InMemoryUserRepository` qui stockent les données dans de simples `Map<string, T>` en mémoire. Ces repositories implémentent les mêmes interfaces que les adapters SQLite et MySQL, et sont injectés dans les tests via l'injection de dépendances.

Chaque test reçoit une instance fraîche du repository, garantissant l'isolation entre les tests.

## Alternatives considérées

- **Base SQLite en mémoire (`":memory:"`)** : écarté car cela nécessite toujours un driver SQL, des migrations, et le temps de setup est plus long qu'un simple `Map`.
- **Mocks manuels (jest.fn())** : écarté car les mocks ne vérifient pas la logique métier du repository (tri, filtrage, cascade). Les InMemory repositories testent le comportement réel.
- **Testcontainers (Docker MySQL pour les tests)** : écarté car trop lourd pour des tests unitaires. Réservé aux tests d'intégration E2E.

## Conséquences

**Positif :**
- Tests exécutés en millisecondes (pas d'I/O disque ou réseau)
- Aucune dépendance externe pour lancer les tests
- Isolation parfaite entre les tests (pas d'état partagé)
- Les 35 tests backend passent de manière déterministe

**Négatif :**
- Le comportement de `Map` peut différer légèrement de SQL (tri, contraintes d'unicité)
- Les InMemory repositories doivent être maintenus en parallèle des vrais adapters
