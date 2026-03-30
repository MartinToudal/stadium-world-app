# Stadium World Redesign Plan

Et konkret redesign-spor for Stadium World, nu hvor funktionaliteten er blevet tydeligere.

Målet er ikke flere små UI-fixes. Målet er at genopbygge produktet, så det føles som ét samlet univers.

## Problem

Det nuværende UI bærer præg af, at produktet er vokset trin for trin:

- først et datalag
- derefter oversigt
- derefter tracker
- derefter kort
- derefter TribuneTour-lignende detaljer

Resultatet er, at funktionerne findes, men oplevelsen ikke føles helstøbt.

De største problemer lige nu:

- for mange forskellige visuelle retninger på tværs af sider
- for mange kort, panels og chips, som konkurrerer om opmærksomhed
- for lidt tydeligt hierarki mellem `Explore`, `Stadium`, `My Tour` og `Map`
- for meget “UI” og for lidt produktfokus
- kortsiden og gemte-siden føles mere som features end som dele af samme produkt

## Ny Produktretning

Stadium World skal ikke ligne en generisk sports-app.

Det skal føles som:

- et stadium directory
- et personligt groundhopping-overblik
- et roligt, seriøst værktøj for interesserede brugere

Den rigtige mentale model er:

- `Explore`: find stadioner
- `Stadium`: forstå et stadion og registrér dit forhold til det
- `My Tour`: se din egen historik og progression
- `Map`: brug geografi som et browse-værktøj, ikke som en særskilt gimmick

## Anbefalet Visuel Retning

### Direction

Jeg anbefaler en retning, der kan kaldes:

`Editorial football atlas`

Det betyder:

- mørk eller dæmpet base
- tydelig typografi
- få, stærke farver
- roligt layout
- data og progression er det visuelle omdrejningspunkt

Ikke:

- blobs
- for mange dekorative effekter
- “AI-sloppy” dashboard-kort overalt
- for mange parallelle UI-mønstre

### Designprincipper

- En side skal have ét klart primært fokus.
- Filtre skal være simple og funktionelle.
- Cards bruges kun, når de hjælper scanning eller gruppering.
- Typografi skal bære hierarkiet mere end farver og bokse.
- Status som `visited`, `wishlist` og dato skal se utilitaristisk og sikker ud.
- Kortet skal være neutralt og nyttigt, ikke teatralsk.

## Informationsarkitektur

### 1. Explore

Formål:

- søgning
- filtrering
- sammenligning
- hurtig scanning

Skal bestå af:

- hero eller page intro i meget let form
- søgning
- dropdowns for liga, land, region
- tabel/list view som primært browse-format
- klik ind på stadion

Skal ikke bestå af:

- store promo-sektioner
- sekundære insights på samme side
- tunge dekorationer

### 2. Stadium

Formål:

- præcis stadionprofil
- personlig handling

Skal bestå af:

- klub
- stadionnavn
- by, land, liga
- kort-preview eller koordinatinfo
- visited-status
- visited-date
- noter senere

Skal være:

- kompakt
- læsbar
- mere profil end dashboard

### 3. My Tour

Formål:

- brugerens personlige stadionhistorik

Skal bestå af:

- visited count
- wishlist count
- seneste besøg
- stærkeste lande
- stærkeste ligaer
- evt. “næste oplagte stadion”

Det er her produktet bliver personligt.

Det er også her TribuneTour-strukturen bør mærkes tydeligst.

### 4. Map

Formål:

- geografisk browse
- vælge næste stadion

Skal bestå af:

- et rigtigt kort som primært element
- få filtre
- lille selected stadium-panel

Skal ikke føles som en separat visuel verden.

## Hvad Vi Skal Genbygge

### Phase 1: Foundations

- fastlæg design tokens for farver, spacing, radius og teksthierarki
- vælge 1 primær sidebaggrund og 1 panelstil
- vælge 1 filterstil
- vælge 1 CTA-stil
- vælge 1 statusstil for `visited`, `wishlist`, `favorite`

Output:

- lille, konsekvent designsystem i kode

### Phase 2: Explore

- genbyg [components/stadium-browser.tsx](/Users/martintoudal/Documents/StadiumWorld/stadium-world-app/components/stadium-browser.tsx)
- behold funktionerne
- forenkle layoutet kraftigt
- gør tabellen til det klare centrum

Output:

- stærk directory-side

### Phase 3: Stadium

- genbyg [app/stadium/[id].tsx](/Users/martintoudal/Documents/StadiumWorld/stadium-world-app/app/stadium/%5Bid%5D.tsx)
- gør siden mere redaktionel og mindre panel-opdelt
- brug færre sektioner
- giv visited-date og personlige handlinger mere naturlig placering

Output:

- stærk stadionprofil

### Phase 4: My Tour

- erstat den nuværende saved/collections-tilgang med en ægte personlig hub
- mindre filterbrowser
- mere progression, historik og ejerskab

Output:

- TribuneTour-lignende personlig kerne

### Phase 5: Map

- ryd kortsiden helt op
- brug det rigtige kort som hovedflade
- minimér alt omkringliggende UI

Output:

- kort som browse-værktøj, ikke scene

## Hvad Vi Ikke Skal Gøre Nu

- ikke bygge billeder
- ikke bygge community flows
- ikke bygge reviews endnu
- ikke bygge for mange “nice to have” datafelter
- ikke designe fire forskellige visuelle retninger parallelt

## Komponentstrategi

Vi bør ende med et lille sæt tydelige primitives:

- `PageShell`
- `PageHeader`
- `FilterBar`
- `DataTable`
- `StatBlock`
- `StatusPill`
- `PrimaryButton`
- `SecondaryButton`
- `SectionHeader`

I dag har vi for mange enkeltstående komponenter, som er lavet til én skærm ad gangen.

## Konkrete Beslutninger

Hvis vi starter redesignsporet nu, anbefaler jeg disse valg:

- behold tabs, men omdøb mentalt til `Explore`, `My Tour`, `Map`
- gør `Explore` til første reference-side
- brug mørk base med dæmpede neutrale toner og en enkelt accent
- fjern de fleste dekorative former og hero-effekter
- gør tabellen og stadium-profilen til produktets æstetiske centrum

## Prioriteret Handlingsplan

1. Definér designsystem og visuel retning.
2. Genbyg `Explore` helt.
3. Genbyg `Stadium`.
4. Genbyg `My Tour`.
5. Genbyg `Map`.

## Min Anbefaling

Hvis jeg selv vælger næste skridt, bør vi ikke fortsætte med små UI-rettelser side for side.

Vi bør tage et kontrolleret redesign-spor og starte med `Explore`, fordi:

- det er produktets primære entry point
- det sætter tonen for hele universet
- det vil gøre resten af redesignarbejdet meget lettere

Kort sagt:

`funktionaliteten skal bevares, men den visuelle og strukturelle indpakning bør bygges om næsten fra bunden`
