# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.

## Artifacts

### GuardianGabon (Mobile App)
- **Directory**: `artifacts/guardian-gabon/`
- **Type**: Expo (React Native)
- **Purpose**: Application mobile de signalement anonyme des abus sexuels et violences sur mineurs au Gabon
- **Persistence**: AsyncStorage (no backend)
- **Admin password**: `Guardian2024!`

#### Screens
- `app/(tabs)/index.tsx` — Accueil avec numéros d'urgence (Police: 1730, Gendarmerie: 1730, SAMU: 1300)
- `app/report.tsx` — Formulaire de signalement anonyme (jusqu'à 1000 mots + photo/vidéo)
- `app/penal-code.tsx` — Articles du code pénal gabonais sur la protection des mineurs
- `app/admin-login.tsx` — Connexion sécurisée pour l'administrateur
- `app/admin-dashboard.tsx` — Tableau de bord admin (consultation et gestion des signalements)

#### Key Features
- Signalement 100% anonyme pour le public
- Description jusqu'à 1000 mots
- Ajout de photo ou vidéo comme preuve
- Seul l'admin voit le nom, l'âge et les détails du signalant
- Numéros d'urgence cliquables (Police, Gendarmerie, SAMU)
- 12 articles du code pénal gabonais sur abus et violence sur mineurs
- Gestion des statuts des dossiers (En attente, En cours, Traité)
