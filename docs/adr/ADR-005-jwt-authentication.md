# ADR-005 : JWT pour l'authentification

## Statut

Accepté

## Contexte

L'application nécessite un système d'authentification pour associer les todos à un utilisateur et implémenter les fonctionnalités RGPD (profil, export, suppression). Il faut choisir un mécanisme d'authentification adapté à une architecture frontend SPA (React) + backend API REST (Express).

## Décision

Utiliser JSON Web Tokens (JWT) pour l'authentification :

- **Inscription** (`POST /api/auth/register`) : création du compte avec mot de passe hashé (bcryptjs, 10 rounds)
- **Connexion** (`POST /api/auth/login`) : vérification du mot de passe, émission d'un JWT signé (HS256, expiration 24h)
- **Middleware** : chaque requête authentifiée envoie le token via le header `Authorization: Bearer <token>`. Le middleware vérifie la signature et l'existence de l'utilisateur en base.
- **Stockage côté client** : le token est stocké dans `localStorage` et injecté automatiquement par le module `api.ts`.

## Alternatives considérées

- **Sessions côté serveur (express-session)** : écarté car les sessions nécessitent un stockage serveur (Redis ou mémoire), ce qui complexifie l'infrastructure. De plus, les sessions s'adaptent mal aux architectures SPA où le frontend et le backend sont séparés.
- **OAuth2 / OpenID Connect** : écarté car disproportionné pour un projet de cette taille. Il n'y a pas de fournisseur d'identité externe à intégrer.
- **Cookies HttpOnly** : envisagé pour la sécurité (pas d'accès JavaScript), mais écarté car cela complexifie le CORS et le développement avec Vite proxy.

## Conséquences

**Positif :**
- Stateless : pas de stockage de session côté serveur
- Simple à implémenter et à déboguer (le token est lisible en base64)
- Standard de l'industrie, bien documenté
- Compatible avec l'architecture SPA + API REST

**Négatif :**
- Le token dans `localStorage` est vulnérable aux attaques XSS (atténué par l'absence de `dangerouslySetInnerHTML`)
- Pas de révocation native : un token reste valide jusqu'à expiration
- Le secret JWT doit être protégé en production (guard implémenté dans `index.ts`)
