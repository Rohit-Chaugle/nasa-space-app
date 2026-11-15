# References

## Primary sources

1. NASA Space Apps Challenge project brief for this team's challenge. This is the source for the 19 investigation names, the atmosphere planning values, the control questions, and the data-request framing. Sections are cited in the app as `Project brief, section ...`.
2. NASA Physical Science Informatics (PSI) archive home page: https://psi.nasa.gov/

The PSI link is an archive entry point, not a claim that a named record has a specific PSI identifier. This project was built from the brief and does not invent per-record PSI links or accession numbers.

## Standard values named in the interface

- Earth sea-level oxygen fraction: 21%. This is a standard atmosphere value, not a value from the challenge brief.
- Earth sea-level total pressure: 14.7 psi. The brief states this value.
- Spacesuit: 100% oxygen at 4.3 psi. The brief states these values.
- Moon planning point: 30% oxygen or more at 10.2 psi or less. The brief states this range. The app evaluates the point at 30% and 10.2 psi.

## Software and assets

- React, React DOM, React Router: MIT licenses.
- Vite, TypeScript, Vitest, Playwright, Testing Library, Zod, d3-scale, d3-shape: their respective open-source licenses.
- Newsreader, Hanken Grotesk, and IBM Plex Mono: SIL Open Font License, delivered through Fontsource packages.
- Flame and logo artwork: original SVG drawn for this project. No stock images or copyrighted mission photographs are used.

## How to read a source note

The app labels a source note at the point where a value appears. `not stated in brief` means the brief does not supply that value. A standard value is labeled as standard and is not presented as brief evidence. The Data room exposes the same rule through its data dictionary.

## What is not claimed

- No raw PSI telemetry is reproduced.
- No record is described as partial-gravity data when it is an analog.
- No missing pressure, oxygen, airflow, fuel geometry, or measurement value is estimated.
- No external source is cited for a claim the project did not use.
