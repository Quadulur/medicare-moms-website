# Meet Our Team data

The agent cards on `/meet-our-team/` and `/es/equipo/` are generated. Don't edit the cards in the HTML.

## Where agent info comes from

| What | Source |
|---|---|
| Who is on the team | The `health-plan-moms` funnel in the CrestPoint site (`tools/funnels.json` in `crestpoint-website`), by TBW agent id |
| Photo, city, languages, English bio | TBW, through `https://crestpointinsurance.com/api/agents?funnel=health-plan-moms`, whenever TBW has a value |
| Spanish bio, taglines, lines of coverage, @healthplanmoms.com email, direct phone, photo framing, page order | `data/team.json` (TBW has no fields for these yet) |

A blank in TBW never wipes what the site shows. If the API is down or returns far fewer agents than before, the sync changes nothing.

## Jobs

- **Nightly**: `.github/workflows/sync-team.yml` runs `scripts/team/sync-team.mjs` at 3:17 AM Mountain and publishes any change. Run it by hand from GitHub > Actions.
- **After editing `data/team.json` yourself**: `node scripts/team/build-team.mjs`, then `./push.sh "Team update"`.
- **Preview a sync**: `node scripts/team/sync-team.mjs --dry-run`

## Common changes

- **Add a mom**: add her TBW agent id to the `health-plan-moms` funnel in CrestPoint. The next sync adds her to `data/team.json`, hidden (`"needsSetup": true`). Fill in `email` or `phone`, `lines`, `en` and `es`, put her photo in the site root if TBW has none, then delete `"needsSetup"` and `"hidden"`.
- **Remove a mom**: take her id out of the funnel. The next sync hides her (`"hidden": true`); her info stays in the file in case she comes back.
- **Link an existing card to TBW**: once she is in the funnel, the sync links her by name (first name plus a shared last name) and sets `tbwId`.
- **Fields in `data/team.json`**: `languages` uses full names (`Spanish`, `Japanese`, `German`, `American Sign Language`); the first non-English one becomes the badge on the photo. `lines` drives the Medicare and ACA filters. `city` as `City, ST` drives the state filters. `orderEn` and `orderEs` set the order on each page.
- No em dashes in bios or taglines; the build refuses them.
