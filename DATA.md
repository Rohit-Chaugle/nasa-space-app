# Data

## Scope

The archive has 19 records from the challenge brief: 17 in PSI and 2 planned. The planned records are shown as gaps and cannot enter a ranking. The in-PSI records are the only records scored, compared, or exported.

All values are brief metadata. The site does not host raw sensor data, telemetry, or files from the NASA Physical Science Informatics system. PSI is linked as the place to obtain the underlying data.

## Records

| ID | Acronym | Name | Status | Tier | Gravity | Phases | Functions |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `bass` | BASS | Burning and Suppression of Solids | in PSI | direct | microgravity | solid, gas | flammability, suppression |
| `bass-ii` | BASS-II | Burning and Suppression of Solids II | in PSI | direct | microgravity | solid, gas | flammability, suppression |
| `saffire-1` | Saffire-I | Spacecraft Fire Safety Demonstration (Saffire-I) | in PSI | direct | microgravity | solid | flammability |
| `saffire-2` | Saffire-II | Spacecraft Fire Safety Demonstration (Saffire-II) | in PSI | direct | microgravity | solid | flammability |
| `saffire-3` | Saffire-III | Spacecraft Fire Safety Demonstration (Saffire-III) | in PSI | direct | microgravity | solid | flammability |
| `same` | SAME | Smoke and Aerosol Measurement Experiment (SAME) | in PSI | direct | microgravity | not stated in brief | detection |
| `same-r` | SAME-R | Smoke and Aerosol Measurement Experiment (SAME-R) | in PSI | direct | microgravity | not stated in brief | detection |
| `flex` | FLEX | Flame Extinguishment Experiment (FLEX) | in PSI | direct | microgravity | liquid | suppression, flammability |
| `flex-2` | FLEX-2 | Flame Extinguishment Experiment 2 (FLEX-2) | in PSI | related | microgravity | liquid | suppression |
| `cfi` | CFI | Cool Flames Investigation (CFI) | in PSI | related | microgravity | liquid | flammability, flame fundamentals |
| `cfi-g` | CFI-G | Cool Flames Investigation with Gases (CFI-G), part of ACME | in PSI | direct | microgravity | gas | oxygen-enriched, flammability, flame fundamentals |
| `e-field` | E-FIELD | Electric-Field Effects on Laminar Diffusion Flames (E-FIELD Flames), part of ACME | in PSI | direct | partial-gravity analog | gas | partial-gravity, flame fundamentals |
| `bre` | BRE | Burning Rate Emulator (BRE), part of ACME | in PSI | direct | microgravity | gas | flammability |
| `spice` | SPICE | Smoke Point In Co-flow Experiment (SPICE) | in PSI | related | microgravity | solid, gas | flame fundamentals |
| `slice` | SLICE | Structure & Liftoff In Combustion Experiment (SLICE) | in PSI | related | microgravity | solid, gas | flame fundamentals |
| `daft` | DAFT | Dust and Aerosol Measurement Feasibility Test (DAFT) | in PSI | related | microgravity | dust | detection, dust detection |
| `daft-2` | DAFT-2 | Dust and Aerosol Measurement Feasibility Test 2 (DAFT-2) | in PSI | related | microgravity | dust | detection, dust detection |
| `luci` | LUCI | Lunar-g Combustion Investigation (LUCI) | planned | planned | partial | not stated in brief | partial-gravity, flammability |
| `fm2` | FM2 | Flammability of Materials on the Moon (FM2) | planned | planned | partial | not stated in brief | partial-gravity, flammability |

The machine-readable source is `src/data/investigations.json`. `src/data/schema.ts` validates IDs, enums, field lengths, readiness objects, and source metadata. A failed validation stops the production build.

## Fields

| Field | Meaning | Limit |
| --- | --- | --- |
| `id` | Stable route key | Must be one of the 19 IDs |
| `name` | Investigation name | From the brief |
| `acronym` | Short display name | From the brief |
| `status` | `in_psi` or `planned` | Planned records cannot be ranked |
| `tier` | `direct`, `related`, or `planned` | Direct is 1, related is 0.4, planned is 0 |
| `gravity` | `microgravity`, `partial_analog`, or `partial` | Only E-FIELD is an analog |
| `phases` | Solid, liquid, gas, or dust | Empty when the brief does not state it |
| `functions` | Fire-safety roles | At least one per record |
| `fuel` | Fuel description | Brief wording or grouped brief wording |
| `hardware` | Test hardware | Brief wording |
| `conditions` | Test conditions | Brief wording |
| `objective` | What the investigation tested | Brief-derived summary, 35 words or fewer |
| `variables` | Changing inputs named in the brief | Only stated items |
| `measurements` | Outputs named in the brief | Only stated items |
| `readiness` | Six modeling inputs | Each has `stated` and `value` |
| `oxygen_pct_max` | Highest stated oxygen percentage | Null when not stated |
| `source` | Section, PSI URL, verification | Fixed by schema |

## Six readiness inputs

These are the only fields counted by the readiness factor:

1. Oxygen level.
2. Test pressure.
3. Airflow.
4. Fuel identity.
5. Fuel geometry.
6. Measurement.

A field that the brief does not give is marked `stated: false` and its value is `not stated in brief`, or a qualitative description with the missing number called out. Coverage is the count of `stated: true` fields out of six.

## Sources and verification

Every record uses:

- `section`: a challenge brief section.
- `psi_url`: `https://psi.nasa.gov/`.
- `verification`: `named_in_brief`.

The URL is the PSI archive home page, not a per-record deep link. The brief did not supply per-record PSI identifiers, and this project does not invent them. See [REFERENCES.md](REFERENCES.md).

## Exports

The Data room exports the selected records in the browser:

- CSV with selected base, readiness, and source columns.
- JSON with the selected record objects.
- Markdown of the full data dictionary.

These exports contain metadata only. They are not a substitute for the PSI source data.
