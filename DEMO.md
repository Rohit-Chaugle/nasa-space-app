# Three-minute demo

The demo runs offline from the built site. Start with:

```bash
npm run build
npm run preview
```

Open the printed local URL. The route fragments below assume the local preview.

## 0:00 to 0:20: The question

Open `#/`. Use the flame switch to move from the Earth teardrop to the free-fall sphere. Read the caption: on Earth, buoyancy carries hot gas and fresh oxygen upward; in free fall, the flame depends on diffusion.

Say: "This is a ranking and briefing tool for the 19 investigations named in the brief. It separates evidence from planning assumptions."

## 0:20 to 0:40: Find the liquid-fuel work

Open `#/atlas?phase=liquid&view=cards`. The filter is in the URL. Point to FLEX, FLEX-2, and CFI. Switch to Table and show that the same filters and record set remain. The URL carries the state.

## 0:40 to 1:05: Defend a ranking

Open `#/crew-fit?preset=lunar`. Point to the first two results: CFI-G, then E-FIELD. Read a reason line. Move the Function slider. The weights re-normalize to 100% and the share URL changes. Say: "The order is an argument with visible inputs, not a hidden model."

Open the Method link or `#/method` if a judge asks for the exact factor rules.

## 1:05 to 1:30: Show why two atmosphere measures disagree

Open `#/atmosphere?o=30&p=10.2`. Point to:

- Oxygen partial pressure: 3.06 psi.
- Change against Earth: -1%.
- Oxygen fraction change: +43%.
- Spacesuit: 4.30 psi and +39% against Earth.

Say: "The partial pressure is slightly below Earth while the oxygen fraction is much higher. The site refuses to collapse those into one number."

## 1:30 to 1:50: Plain-language search

Open `#/ask?q=above+30%25+oxygen`. The parser shows the removable oxygen rule. CFI-G is the one result and the reason line says why. Remove the chip and search again to show the filter is transparent.

## 1:50 to 2:20: A brief with sources

Open `#/brief`. Set the environment to Lunar base. Keep the focus on All. Show the top five, the missing-input list, and the numbered sources. Click "Print or save as PDF" to show the print layout. Return to the screen.

## 2:20 to 2:35: The gaps are part of the answer

Open `#/gaps`. Point to:

- No partial-gravity combustion data. E-FIELD is an analog.
- LUCI and FM2 are planned and not scored.
- Only one record states oxygen above 30%.
- No record states a numeric test pressure or airflow.

Say: "A credible ranking has to show where the archive stops."

## 2:35 to 2:50: The data handoff

Open `#/data`. Show the selected records and the readiness column toggles. Export CSV and JSON. Open the data dictionary download. Say: "The metadata leaves the browser with its limits attached."

## 2:50 to 3:00: Close

Open `#/judges`. Follow the four links if time allows. Close with: "Every score has a formula, every value has a source, and every missing value is named."

## Recovery lines

- If asked about raw data: PSI holds the data. This site holds brief-derived metadata and links to the archive home page.
- If asked about E-FIELD: it is an electric-field partial-gravity analog. The score treats it as a match for surface presets and the UI says so.
- If asked why there is no server: the site must run offline and must not create a privacy or availability dependency.
- If a route is reloaded on a static host: the app uses hash routing, so the server only needs `index.html`.
