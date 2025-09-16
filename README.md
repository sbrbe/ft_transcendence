# ft_transcendence — Pong Arena (42)

Un écosystème **Pong** full-stack, jouable **local** et **en ligne**, avec **moteur côté serveur**, **microservices**, **authentification avancée (JWT + 2FA)**, **IA**, **tournois multi-joueurs**, et **blockchain**.

> Accès par défaut :
> - Local : https://localhost:8443/
> - Distant : https://<IP_DE_LA_MACHINE_QUI_A_LANCÉ_`make`>:8443/

---

## Vue d’ensemble

- **Backend** : framework Node.js (Fastify/Express), **WebSocket** temps réel, **API** REST, architecture **microservices**.
- **Frontend** : framework/toolkit (TypeScript + Canvas), UI responsive.
- **Jeu** : **server-side Pong** (physique & règles côté serveur), client = rendu + input.
- **Auth & Users** : comptes, profils, JWT, **2FA**, gestion d’utilisateurs à travers les tournois.
- **Temps réel** : matchmaking, **remote players**, **multi-joueurs** (1v1, 2v2 en option).
- **Tournois** : organisation, brackets, **scores enregistrés sur Blockchain**.
- **Stockage** : base de données pour utilisateurs, matchs, historique, etc.
- **IA** : adversaire bot.

---

## ✅ Modules (statut)

| Type   | Module                                                                 | Statut |
|--------|-------------------------------------------------------------------------|--------|
| Major  | **Use a framework to build the backend**                                | ✅     |
| Minor  | **Use a framework/toolkit to build the front-end**                      | ✅     |
| Minor  | **Use a database for the backend**                                      | ✅     |
| Major  | **Store the score of a tournament in the Blockchain**                   | ✅     |
| Major  | **Standard user management, authentication across tournaments**         | ✅     |
| Major  | **Remote players**                                                      | ✅     |
| Major  | **Multiple players**                                                    | ✅     |
| Major  | **Introduce an AI opponent**                                            | ✅     |
| Major  | **Implement Two-Factor Authentication (2FA) and JWT**                   | ✅     |
| Major  | **Designing the Backend as Microservices**                              | ✅     |
| Minor  | Support on all devices                                                  | ✅     |
| Minor  | Expanding Browser Compatibility                                         | ✅     |
| Major  | **Replace Basic Pong with Server-Side Pong & Implement an API**         | ✅     |


---

## Architecture

- **Gateway** (HTTPS 8443) → reverse-proxy (ex. Nginx) vers services
- **Auth Service** → JWT, **2FA** (TOTP), refresh, rôles
- **Users Service** → profils, stats, avatars
- **Game Service** → **moteur serveur Pong** (physique, collisions, score), **WebSocket**
- **Tournament Service** → création, brackets, règles, **ancrage Blockchain** des scores
- **Blockchain Adapter** → écriture/lecture des scores on-chain
- **DB** → (ex. Postgres/SQLite) utilisateurs, matchs, historiques, sessions
- **Frontend Web** → TS/Canvas, UI responsive, WS client

---

##  Sécurité

- **HTTPS** obligatoire (port **8443**).
- **JWT** (access + refresh), scoping par service.
- **2FA (TOTP)** : activation/désactivation, backup codes.
- **CORS** strict côté API Gateway.
- **Rate-limit** & **CSRF** pour endpoints sensibles.

---

##  Gameplay (server-side)

- Le **serveur** gère la **physique**, les **collisions**, la **vitesse**, la **logique de score**.
- Le **client** transmet les **inputs** (up/down) et **rend** le jeu selon l’état reçu.
- **Remote** : synchronisation via **WebSocket** (tickrate serveur).
- **IA** : bot serveur (prédiction balle + délais humains configurables).

---

##  Tournois & Blockchain

- Création de tournois, inscriptions, brackets.
- Fin de match → **score signé** → **Transaction on-chain**.
- Preuve d’intégrité publique des résultats (hash/txid exposé dans l’UI).

---

##  Stack (indicatif)

- **Backend** : Node.js (Fastify/Express), WS, TypeScript
- **Frontend** : TypeScript, Canvas, (Vite/React optionnel)
- **DB** : SQLite (migrations)
- **Proxy** : Nginx (TLS, 8443)
- **Blockchain** : EVM-compatible / adapter abstrait
- **Auth** : speakeasy/otplib (TOTP), jsonwebtoken
- **Infra** : Docker / docker compose, Makefile

---

##  Lancer le projet

> Pré-requis : .env, Docker Desktop (pas nécessaire sur tous les pcs).

```bash
make            # build + run tous les services
```
