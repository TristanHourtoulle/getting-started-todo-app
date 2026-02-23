# ADR-002 : Migration TypeScript

## Statut

Accepté

## Contexte

Le projet d'origine est écrit en JavaScript. Le manque de typage statique rend le refactoring risqué, les erreurs ne sont détectées qu'à l'exécution, et la lisibilité du code est réduite pour les nouveaux contributeurs. Le sujet impose explicitement la migration en TypeScript.

## Décision

Migrer l'intégralité du code frontend et backend en TypeScript avec le mode strict activé :

- `backend/tsconfig.json` : `"strict": true`
- `client/tsconfig.json` : `"strict": true`

Tous les fichiers `.js`/`.jsx` sont renommés en `.ts`/`.tsx`. Les types sont définis dans des fichiers dédiés (`domain/todo.ts`, `domain/user.ts`, `types/todo.ts`).

## Alternatives considérées

- **Rester en JavaScript avec JSDoc** : écarté car le typage JSDoc est incomplet, non vérifié par défaut à la compilation, et ne répond pas à l'exigence du sujet.
- **Migration progressive (allowJs)** : écarté car le projet est suffisamment petit pour une migration complète en une fois. Le mode `allowJs` laisse des zones non typées.

## Conséquences

**Positif :**
- Erreurs détectées à la compilation avant l'exécution
- Refactoring plus sûr grâce à la vérification de types
- Autocomplétion et documentation inline dans l'IDE
- Les interfaces `TodoRepository` et `UserRepository` sont des contrats explicites

**Négatif :**
- Courbe d'apprentissage pour les développeurs non familiers avec TypeScript
- Configuration supplémentaire (`tsconfig.json`, types pour les dépendances)
