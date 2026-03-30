# Missing Coordinates

Status for [data/opta_top100_stadiums.csv](/Users/martintoudal/Documents/StadiumWorld/stadium-world-app/data/opta_top100_stadiums.csv).

- Total stadiums: `225`
- Missing stadium names: `0`
- Missing latitude/longitude: `0`

## Summary

All current stadium rows now have:

- `name`
- `lat`
- `lon`

If new leagues or clubs are added later, regenerate app data with:

```bash
cd /Users/martintoudal/Documents/StadiumWorld/stadium-world-app
npm run sync:data
```
