# TrueDeal — Black Friday Deal Finder

[![make.fun bounty](https://make.fun/badge/black-friday-deal-finder-01.svg)](https://make.fun/bounty/black-friday-deal-finder-01)
[![rank](https://make.fun/badge/black-friday-deal-finder-01/naplex666/makefun-black-friday-deals/rank.svg)](https://make.fun/bounty/black-friday-deal-finder-01)
[![reward](https://make.fun/badge/black-friday-deal-finder-01/naplex666/makefun-black-friday-deals/reward.svg)](https://make.fun/bounty/black-friday-deal-finder-01)

A static Black Friday deal finder built for the [make.fun bounty](https://make.fun/bounty/black-friday-deal-finder-01). It lists 39 Black Friday and Cyber Monday deals that were found and price-checked on Nov 27, 2026. Each deal shows the product, the store, a link to the store, the sale price, the usual price, the discount, the time the price was checked and the source — plus an honest signal: new low, strong price, routine sale, or checked with no record found.

Search and filter by category, store and discount; sort by verdict, biggest discount or price; pick up to three deals and compare them side by side to see which one really saves the most. The site runs from static files with no network request, on desktop and on a phone.

## Run it

```sh
node serve.ts   # serves app/ on http://localhost:8080
```

## Hand in

`main.ts` first validates every deal (required fields, sale below usual, known signal, readable check time, unique id), then copies `app/` and `screenshots/` to `/output` and writes `/output/dossier.json` with the vendored make.fun library, as the kit's starter does.

## License

MIT — see [LICENSE](LICENSE).
