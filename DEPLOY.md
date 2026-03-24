# Vercel Deploy

Projektet er sat op til at kunne deployes som et statisk Expo-webbuild på Vercel.

## Hurtigste vej

1. Push [stadium-world-app](/Users/martintoudal/Documents/Stadium%20World/stadium-world-app) til et GitHub-repo.
2. Opret et nyt projekt i Vercel.
3. Vælg repoet.
4. Hvis repoet også indeholder andre mapper, så sæt `Root Directory` til `stadium-world-app`.
5. Vercel vil bruge:
   - `Build Command`: `npm run build:web`
   - `Output Directory`: `dist`

## Lokalt build før deploy

```bash
cd /Users/martintoudal/Documents/Stadium\ World/stadium-world-app
npm run build:web
```

Det gør to ting:

1. regenererer appdata fra CSV via `npm run sync:data`
2. bygger webversionen via `expo export --platform web`

## Hvad der allerede er sat op

- [package.json](/Users/martintoudal/Documents/Stadium%20World/stadium-world-app/package.json) har scriptet `build:web`
- [vercel.json](/Users/martintoudal/Documents/Stadium%20World/stadium-world-app/vercel.json) peger Vercel på `dist`
- rewrite-reglen sender app-routes tilbage til `index.html`, så Expo Router virker på dybe links
