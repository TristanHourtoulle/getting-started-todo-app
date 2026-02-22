# ADR-001 : Monorepo avec séparation frontend/backend

## Statut

Accepté

## Contexte

L'application Todo List d'origine est une application monolithique où le frontend React et le backend Node.js/Express coexistent dans un seul ensemble. Pour appliquer les principes du clean code et faciliter le développement, il est nécessaire de formaliser la séparation des responsabilités entre le frontend et le backend tout en conservant un seul dépôt Git.

## Décision

Adopter une structure monorepo avec deux sous-projets distincts :

- `client/` : application React (Vite, TypeScript)
- `backend/` : serveur Express (TypeScript)

Chaque sous-projet possède son propre `package.json`, `tsconfig.json`, `Dockerfile` et ses propres scripts de build/test. Un fichier `compose.yaml` à la racine orchestre l'ensemble.

## Alternatives considérées

- **Multi-repo** (un dépôt par projet) : écarté car cela complexifie la synchronisation des versions, le CI/CD et la revue de code. Le sujet impose un mono-repository.
- **Monolithe sans séparation** : écarté car cela ne respecte pas la séparation des responsabilités et rend les tests et le déploiement plus complexes.

## Conséquences

**Positif :**
- Un seul `git clone` suffit pour récupérer tout le projet
- Docker Compose orchestre les deux services facilement
- Les revues de code et les PR couvrent front et back ensemble
- Chaque sous-projet peut évoluer indépendamment (dépendances, versions Node)

**Négatif :**
- Les deux sous-projets partagent le même historique Git
- Le CI doit détecter quels sous-projets sont impactés par un changement
