# TrueDeal — Black Friday Deal Finder

[![make.fun bounty](https://make.fun/badge/black-friday-deal-finder-01.svg)](https://make.fun/bounty/black-friday-deal-finder-01)
[![rank](https://make.fun/badge/black-friday-deal-finder-01/naplex666/makefun-black-friday-deals/rank.svg)](https://make.fun/bounty/black-friday-deal-finder-01)
[![reward](https://make.fun/badge/black-friday-deal-finder-01/naplex666/makefun-black-friday-deals/reward.svg)](https://make.fun/bounty/black-friday-deal-finder-01)

A real Black Friday deal finder for the [make.fun bounty](https://make.fun/bounty/black-friday-deal-finder-01): a static site of Black Friday and Cyber Monday deals the agent found and checked itself on Nov 27, 2026. Every deal has its product, store, store link, sale price, usual price, discount, check time and source — plus an honest signal for whether it is really a deal (new low, strong price, routine sale, or checked with no record found).

Search and filter by category, store and discount; sort by verdict, biggest discount or price. Works on desktop and on a phone, from static files with no network request.

## Run it

```sh
node serve.ts   # serves app/ on http://localhost:8080
```

## Hand in

`main.ts` copies `app/` and `screenshots/` to `/output` and writes `/output/dossier.json` with the vendored make.fun library, as the kit's starter does.

## License

MIT — see [LICENSE](LICENSE).
