# ADR-006 : Conformité RGPD

## Statut

Accepté

## Contexte

Le RGPD (Règlement Général sur la Protection des Données) impose aux applications traitant des données personnelles de respecter certains droits des utilisateurs. L'application stocke des données personnelles (email, mot de passe hashé, todos associés) et doit donc se conformer aux exigences légales. Le sujet impose explicitement l'implémentation de fonctionnalités RGPD.

## Décision

Implémenter trois droits fondamentaux du RGPD :

### Droit d'accès (Article 15)
- **Route** : `GET /api/auth/export`
- L'utilisateur peut télécharger toutes ses données personnelles au format JSON (profil + todos)
- Le fichier est généré côté serveur via `getAllUserData()` et téléchargé via le navigateur

### Droit à l'effacement (Article 17)
- **Route** : `DELETE /api/auth/profile`
- Suppression en cascade : tous les todos de l'utilisateur sont supprimés avant le compte
- Confirmation obligatoire côté frontend (modal de confirmation)
- Après suppression, l'utilisateur est automatiquement déconnecté

### Minimisation des données (Article 5)
- Seules les données strictement nécessaires sont collectées : email et mot de passe
- Le mot de passe est stocké hashé (bcryptjs, 10 rounds), jamais en clair
- Pas de collecte de nom, prénom, adresse ou autres données superflues

## Alternatives considérées

- **Soft delete (marquage comme supprimé)** : écarté car le RGPD exige l'effacement effectif des données. Un soft delete ne répond pas au droit à l'oubli.
- **Export CSV** : écarté au profit du JSON, plus structuré et plus facile à exploiter programmatiquement.
- **Anonymisation au lieu de suppression** : écarté car l'anonymisation est complexe à garantir et le volume de données ne le justifie pas.

## Conséquences

**Positif :**
- Conformité avec les articles 5, 15 et 17 du RGPD
- Les utilisateurs ont le contrôle total sur leurs données
- L'export JSON permet la portabilité des données
- La suppression en cascade garantit qu'aucune donnée orpheline ne subsiste

**Négatif :**
- La suppression est irréversible (pas de corbeille ou de période de grâce)
- L'export inclut toutes les données, sans possibilité de filtrage
- Pas de journalisation des demandes RGPD (acceptable pour un projet de cette taille)
