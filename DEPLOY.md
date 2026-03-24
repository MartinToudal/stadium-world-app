# Vercel Deploy

Projektet er sat op til at kunne deployes som en statisk Expo Router-webapp på Vercel.

## Hurtigste vej

1. Push [stadium-world-app](/Users/martintoudal/Documents/StadiumWorld/stadium-world-app) til GitHub.
2. Opret et nyt projekt i Vercel og vælg repoet.
3. Bekræft at `Root Directory` er projektmappen med [package.json](/Users/martintoudal/Documents/StadiumWorld/stadium-world-app/package.json).
4. Brug disse settings, hvis Vercel ikke læser dem automatisk fra [vercel.json](/Users/martintoudal/Documents/StadiumWorld/stadium-world-app/vercel.json):
   - `Install Command`: `npm install`
   - `Build Command`: `npm run build:web`
   - `Output Directory`: `dist`
5. Deploy.

## Hvis første deploy fejlede

De to mest almindelige årsager er:

1. forkert `Root Directory`, så Vercel ikke bygger inde fra [stadium-world-app](/Users/martintoudal/Documents/StadiumWorld/stadium-world-app)
2. en SPA-rewrite, der ikke matcher Expo Router-output

Projektet er nu gjort mere eksplicit:

- [app.json](/Users/martintoudal/Documents/StadiumWorld/stadium-world-app/app.json) sætter `expo.web.output` til `single`
- [package.json](/Users/martintoudal/Documents/StadiumWorld/stadium-world-app/package.json) bruger en CI-sikker webbuild via `CI=1`
- [vercel.json](/Users/martintoudal/Documents/StadiumWorld/stadium-world-app/vercel.json) peger rewrites tilbage til `/`

## Lokalt build før deploy

```bash
cd /Users/martintoudal/Documents/StadiumWorld/stadium-world-app
npm run build:web
```

Det gør to ting:

1. regenererer appdata fra CSV via `npm run sync:data`
2. bygger webversionen via `expo export --platform web`

## Hvad der allerede er sat op

- [package.json](/Users/martintoudal/Documents/StadiumWorld/stadium-world-app/package.json) har scriptet `build:web`
- [vercel.json](/Users/martintoudal/Documents/StadiumWorld/stadium-world-app/vercel.json) peger Vercel på `dist`
- rewrite-reglen sender app-routes tilbage til `index.html`, så Expo Router virker på dybe links
