# ADR-007 : Docker Compose pour l'environnement

## Statut

Accepté

## Contexte

Le projet nécessite plusieurs services pour fonctionner : un frontend React, un backend Express, une base de données MySQL et un outil d'administration (phpMyAdmin). Sans conteneurisation, chaque développeur devrait installer et configurer manuellement Node.js, MySQL et les dépendances, ce qui crée des incohérences entre environnements et complexifie l'onboarding.

## Décision

Utiliser Docker Compose pour orchestrer l'ensemble de l'environnement de développement :

- **`compose.yaml`** à la racine du projet
- **Services** :
  - `client` : frontend React (Vite), port 5173, hot reload via `watch`
  - `backend` : serveur Express, port 3000, rechargement automatique
  - `db` : MySQL 9, volume persistant
  - `phpmyadmin` : interface d'administration de la base
  - `proxy` : Traefik pour le routage (localhost, db.localhost)

- **Dockerfiles multi-étapes** : chaque sous-projet possède son propre `Dockerfile` avec une étape de build et une étape de production, réduisant la taille des images finales.

- **Mode watch** : `docker compose up --watch` synchronise automatiquement les fichiers sources avec les conteneurs, permettant le hot reload sans reconstruire les images.

## Alternatives considérées

- **Développement sans Docker (npm start local)** : écarté car cela nécessite l'installation manuelle de MySQL, Node.js, et la configuration des variables d'environnement. La reproductibilité n'est pas garantie.
- **Kubernetes (Minikube)** : écarté car disproportionné pour un projet de développement local. Docker Compose est plus simple et suffisant.
- **Docker sans Compose (docker run)** : écarté car la gestion manuelle de plusieurs conteneurs et de leur réseau est fastidieuse et sujette aux erreurs.

## Conséquences

**Positif :**
- Lancement du projet en une seule commande : `docker compose up --watch`
- Environnement identique pour tous les développeurs
- Pas d'installation locale requise (seulement Docker Desktop)
- Isolation complète entre les services
- Hot reload préservé en développement

**Négatif :**
- Docker Desktop doit être installé (ressources mémoire/CPU)
- Le premier lancement télécharge les images et peut prendre quelques minutes
- Le débogage à l'intérieur des conteneurs est moins direct qu'en local
