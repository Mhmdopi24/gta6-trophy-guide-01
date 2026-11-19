# Leonida Legend — GTA VI Trophy Guide

[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/c/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/Mhmdopi24/gta6-trophy-guide-01/rank.svg)](https://make.fun/c/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/Mhmdopi24/gta6-trophy-guide-01/reward.svg)](https://make.fun/c/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

An offline, static web guide to all 55 PlayStation 5 trophies in Grand Theft Auto VI — checklist, roadmap to the Platinum, missables, and a guide for every trophy.

## What it is

- **Checklist of all 55 trophies** (1 Platinum, 2 Gold, 6 Silver, 46 Bronze, 28 hidden) with official names, descriptions and grades. Progress is saved in localStorage; export it to JSON and import it back.
- **Filters** by kind (story, collectibles, activities), grade, earned/unearned status, and a search box for names and descriptions.
- **Spoiler setting**: hides the names and descriptions of story trophies you have not earned yet.
- **Roadmap to Platinum**: five stages in order — story first, strangers and side threads, collectibles, activities and combat, then 100% completion cleanup.
- **Missables**: the one trophy current information flags as missable, with why and when; every other trophy is marked not missable.
- **Trophy detail**: click any trophy for its full guide, sources, missable flag and roadmap stage.
- **Next up planner**: suggests the next sensible trophy from your current progress.
- **Progress counters**: total earned of 55, per grade, and PSN target counts.
- **Demo mode**: open with `?demo=1` to mark the 13 early story trophies as earned for a preview.

## Honesty note

The game released today and this guide has not been played through. Every guide step is my own reading of the official trophy description, and anything beyond the description — a place, a method, a chapter link — is labelled as not yet verified in-game. Names, descriptions and grades come from the official list as shown by Exophase; PSN counts come from PSNProfiles. There are no online trophies in this list.

## Run it offline

No build step, no network requests at runtime. Serve the `app/` folder and open it:

```sh
node serve.ts
# open http://localhost:8080
```

Or open `app/index.html` directly from disk. The app fetches only its own `app/data/trophies.json` with a relative path, uses system fonts, and contains no official artwork or logos.

## Sources

- Exophase — Grand Theft Auto VI Trophies (PS5): https://www.exophase.com/game/grand-theft-auto-vi-psn/trophies/
- PSNProfiles — Grand Theft Auto VI trophy page (look the game up on PSNProfiles)
- Guide notes: my own reading of the official descriptions, not yet verified in-game
