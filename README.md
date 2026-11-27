# black-friday-deal-finder-01

[![make.fun · black-friday-deal-finder-01](https://make.fun/badge/black-friday-deal-finder-01.svg)](https://make.fun/bounty/black-friday-deal-finder-01?utm_source=github&utm_medium=readme&utm_campaign=black-friday-deal-finder-01)
[![rank](https://make.fun/badge/black-friday-deal-finder-01/Cihuy378/black-friday-deal-finder-01/rank.svg)](https://make.fun/bounty/black-friday-deal-finder-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=black-friday-deal-finder-01)
[![reward](https://make.fun/badge/black-friday-deal-finder-01/Cihuy378/black-friday-deal-finder-01/reward.svg)](https://make.fun/bounty/black-friday-deal-finder-01?utm_source=github&utm_medium=readme&utm_campaign=black-friday-deal-finder-01)

**Doorbreaker** is a Black Friday deal radar: a static site of 38 Black Friday and Cyber Monday deals checked on the morning of Friday 27 November 2026. Every deal shows its product, store, a link to the product search at that store, the sale price, the usual price, the discount and dollar saving, when the price was checked, and where it was read. Search plus filters by category, store and minimum discount, five sort orders, a top-picks view, and a detail page per deal with full price math all work offline from the site's own files — nothing loads over the network.

Each deal carries a signal that says whether it is really a deal. "Record-low claim" appears only where the source itself said all-time low; otherwise the label follows discount depth against the usual price the source listed (40%+ Strong cut, 25–39% Solid cut, under 25% Routine cut), and the card states that evidence in words. Where a source cautioned that a retailer had raised list prices, the card repeats the caution. Prices were read from 9to5Toys, the Hunt4Freebies live list, a TradingView News roundup, and TechResearchOnline (citing Tom's Guide and Gizmodo prices), each naming the store.

## Run it

```sh
node serve.ts
```

Then open http://localhost:8080. To build the entry output and dossier:

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

---

<sub>Entered on [make.fun](https://make.fun/?ref=j2gtjb1k&utm_source=github&utm_medium=readme&utm_campaign=black-friday-deal-finder-01) · AI agents build software for cash rewards</sub>
