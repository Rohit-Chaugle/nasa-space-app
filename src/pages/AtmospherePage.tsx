import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Page } from '../components/Page';
import { Term } from '../components/Term';
import { scaleLinear } from 'd3-scale';
import { line as d3line } from 'd3-shape';
import {
  ATMOSPHERE_NOTES,
  EARTH_OXYGEN_PCT,
  EARTH_TOTAL_PRESSURE_PSI,
  MOON_OXYGEN_PCT,
  MOON_TOTAL_PRESSURE_PSI,
  SUIT_OXYGEN_PCT,
  SUIT_TOTAL_PRESSURE_PSI,
  earthOxygenPartialPressure,
  fixed,
  moonOxygenPartialPressure,
  oxygenPartialPressure,
  percentChange,
  round,
  signedPct,
  signedPsi,
  suitOxygenPartialPressure,
} from '../lib/atmosphere';
import { inPsiRecords } from '../data/investigations';

const WIDTH = 760;
const HEIGHT = 430;
const MARGIN = { top: 34, right: 34, bottom: 58, left: 64 };
const STRIP_WIDTH = 760;
const STRIP_HEIGHT = 136;
const STRIP_MARGIN = { top: 34, right: 34, bottom: 38, left: 64 };

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function AtmospherePage() {
  const [params, setParams] = useSearchParams();
  const [chartTable, setChartTable] = useState(false);
  const [stripTable, setStripTable] = useState(false);
  const pressure = clamp(Number(params.get('p') ?? MOON_TOTAL_PRESSURE_PSI), 4, 15);
  const oxygen = clamp(Number(params.get('o') ?? MOON_OXYGEN_PCT), 10, 100);

  const setSetting = (nextPressure: number, nextOxygen: number) => {
    const next = new URLSearchParams(params);
    next.set('p', String(round(nextPressure, 1)));
    next.set('o', String(Math.round(nextOxygen)));
    setParams(next, { replace: true });
  };

  const partial = oxygenPartialPressure(oxygen, pressure);
  const pressureChange = percentChange(partial, earthOxygenPartialPressure);
  const oxygenChange = percentChange(oxygen, EARTH_OXYGEN_PCT);
  const pressureDelta = partial - earthOxygenPartialPressure;

  const x = scaleLinear().domain([4, 15]).range([MARGIN.left, WIDTH - MARGIN.right]);
  const y = scaleLinear().domain([10, 100]).range([HEIGHT - MARGIN.bottom, MARGIN.top]);
  const stripX = scaleLinear().domain([0, 100]).range([STRIP_MARGIN.left, STRIP_WIDTH - STRIP_MARGIN.right]);

  const earthLinePoints: Array<[number, number]> = [];
  for (let p = 4; p <= 15.0001; p += 0.25) {
    const o = (earthOxygenPartialPressure / p) * 100;
    if (o >= 10 && o <= 100) earthLinePoints.push([p, o]);
  }
  const earthLinePath =
    d3line<[number, number]>()
      .x((point) => x(point[0]))
      .y((point) => y(point[1]))(earthLinePoints) ?? '';

  const oxygenRecords = inPsiRecords.filter((record) => record.oxygen_pct_max !== null);
  const notStatedCount = inPsiRecords.length - oxygenRecords.length;

  const points = [
    {
      id: 'earth',
      label: 'Earth sea level',
      pressure: EARTH_TOTAL_PRESSURE_PSI,
      oxygen: EARTH_OXYGEN_PCT,
      color: 'var(--ember)',
      note: '21% is a standard value, not from the brief.',
    },
    {
      id: 'suit',
      label: 'Spacesuit',
      pressure: SUIT_TOTAL_PRESSURE_PSI,
      oxygen: SUIT_OXYGEN_PCT,
      color: 'var(--ember)',
      note: '100% oxygen at 4.3 psi is from the brief.',
    },
    {
      id: 'moon',
      label: 'Moon planning point',
      pressure: MOON_TOTAL_PRESSURE_PSI,
      oxygen: MOON_OXYGEN_PCT,
      color: 'var(--gilt)',
      note: '30% oxygen or more at 10.2 psi or less.',
    },
  ];

  const current = { id: 'current', label: 'Current setting', pressure, oxygen, color: 'var(--bone)' };

  return (
    <Page
      plate="04"
      title={
        <>
          Two ways to read an <em className="hl-em">atmosphere</em>. They can disagree.
        </>
      }
      lede="Move pressure and oxygen fraction. The lab computes oxygen partial pressure and compares it with Earth, the spacesuit and the Moon planning point."
      wide
    >
      <section className="controls-panel" aria-labelledby="atmosphere-controls-title">
        <h2 id="atmosphere-controls-title" className="visually-hidden">
          Atmosphere settings
        </h2>
        <div className="slider-grid">
          <label className="slider-row">
            <span className="mono-label">Total pressure</span>
            <input
              type="range"
              min={4}
              max={15}
              step={0.1}
              value={pressure}
              onChange={(event) => setSetting(Number(event.target.value), oxygen)}
              aria-valuetext={`${pressure.toFixed(1)} psi`}
            />
            <output>{pressure.toFixed(1)} psi</output>
          </label>
          <label className="slider-row">
            <span className="mono-label">Oxygen fraction</span>
            <input
              type="range"
              min={10}
              max={100}
              step={1}
              value={oxygen}
              onChange={(event) => setSetting(pressure, Number(event.target.value))}
              aria-valuetext={`${oxygen} percent`}
            />
            <output>{oxygen}%</output>
          </label>
        </div>
        <div className="readout-grid">
          <div>
            <span className="readout-label">Oxygen partial pressure</span>
            <strong>{fixed(partial)} psi</strong>
            <span className="formula-line">
              {oxygen}% × {pressure.toFixed(1)} psi = {fixed(partial)} psi
            </span>
          </div>
          <div>
            <span className="readout-label">Change against Earth</span>
            <strong>{signedPsi(pressureDelta)}</strong>
            <span className="formula-line">
              ({fixed(partial)} − {fixed(earthOxygenPartialPressure)}) ÷{' '}
              {fixed(earthOxygenPartialPressure)} = {signedPct(pressureChange)}
            </span>
          </div>
          <div>
            <span className="readout-label">Oxygen fraction change</span>
            <strong>{signedPct(oxygenChange)}</strong>
            <span className="formula-line">
              ({oxygen} − {EARTH_OXYGEN_PCT}) ÷ {EARTH_OXYGEN_PCT} = {signedPct(oxygenChange)}
            </span>
          </div>
          <div>
            <span className="readout-label">Spacesuit</span>
            <strong>{fixed(suitOxygenPartialPressure)} psi</strong>
            <span className="formula-line">
              100% × 4.3 psi = {fixed(suitOxygenPartialPressure)} psi;{' '}
              {signedPct(percentChange(suitOxygenPartialPressure, earthOxygenPartialPressure))} against
              Earth
            </span>
          </div>
        </div>
        <p className="small-note">
          Earth: {ATMOSPHERE_NOTES.earthPressure} {ATMOSPHERE_NOTES.earthOxygen} The Moon planning
          region is 30% oxygen or more at 10.2 psi or less. The site does not claim which measure
          flammability follows.
        </p>
      </section>

      <figure className="chart-figure">
        <div className="figure-head">
          <figcaption>
            <span className="mono-label">Fig. 1</span> Oxygen fraction against total pressure. The
            dashed line is Earth's oxygen partial pressure, {fixed(earthOxygenPartialPressure)} psi.
          </figcaption>
          <button type="button" className="text-button" aria-pressed={chartTable} onClick={() => setChartTable(!chartTable)}>
            {chartTable ? 'View as chart' : 'View as table'}
          </button>
        </div>
        {chartTable ? (
          <div className="table-wrap">
            <table className="data-table">
              <caption className="visually-hidden">Atmosphere comparison table</caption>
              <thead>
                <tr>
                  <th scope="col">Point</th>
                  <th scope="col">Pressure (psi)</th>
                  <th scope="col">Oxygen (%)</th>
                  <th scope="col">Oxygen partial pressure (psi)</th>
                  <th scope="col">Change vs Earth</th>
                  <th scope="col">Oxygen fraction change vs Earth</th>
                </tr>
              </thead>
              <tbody>
                {[...points, current].map((point) => {
                  const pp =
                    point.id === 'current'
                      ? partial
                      : oxygenPartialPressure(point.oxygen, point.pressure);
                  return (
                    <tr key={point.id}>
                      <th scope="row">{point.label}</th>
                      <td className="num">{point.pressure.toFixed(1)}</td>
                      <td className="num">{point.oxygen}%</td>
                      <td className="num">{fixed(pp)}</td>
                      <td className="num">{signedPsi(pp - earthOxygenPartialPressure)}</td>
                      <td className="num">{signedPct(percentChange(point.oxygen, EARTH_OXYGEN_PCT))}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="chart-scroll">
            <svg
              viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
              role="img"
              aria-label={`Chart of oxygen fraction from 10 to 100 percent against total pressure from 4 to 15 psi. The current setting is ${oxygen} percent at ${pressure.toFixed(1)} psi.`}
              className="chart-svg"
            >
              <rect
                x={x(4)}
                y={y(100)}
                width={x(MOON_TOTAL_PRESSURE_PSI) - x(4)}
                height={y(MOON_OXYGEN_PCT) - y(100)}
                fill="var(--gilt)"
                fillOpacity="0.1"
                stroke="var(--gilt)"
                strokeOpacity="0.55"
                strokeWidth="1"
              />
              <text x={x(4.25)} y={y(96)} fill="var(--gilt)" className="chart-label">
                Moon planning region
              </text>
              {[10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map((tick) => (
                <g key={tick}>
                  <line
                    x1={x(4)}
                    x2={WIDTH - MARGIN.right}
                    y1={y(tick)}
                    y2={y(tick)}
                    stroke="var(--hairline)"
                    strokeWidth="1"
                    strokeOpacity={tick === 30 ? 0.9 : 0.45}
                  />
                  <text x={MARGIN.left - 10} y={y(tick) + 4} textAnchor="end" fill="var(--ash)" className="chart-label">
                    {tick}%
                  </text>
                </g>
              ))}
              {[4, 6, 8, 10, 12, 14].map((tick) => (
                <g key={tick}>
                  <line
                    x1={x(tick)}
                    x2={x(tick)}
                    y1={MARGIN.top}
                    y2={HEIGHT - MARGIN.bottom}
                    stroke="var(--hairline)"
                    strokeWidth="1"
                    strokeOpacity="0.45"
                  />
                  <text
                    x={x(tick)}
                    y={HEIGHT - MARGIN.bottom + 22}
                    textAnchor="middle"
                    fill="var(--ash)"
                    className="chart-label"
                  >
                    {tick}
                  </text>
                </g>
              ))}
              <path d={earthLinePath} fill="none" stroke="var(--ember)" strokeWidth="1.5" strokeDasharray="5 5" />
              <text x={x(4.25)} y={y(75.5)} fill="var(--ember)" className="chart-label">
                Earth oxygen partial pressure
              </text>
              {points.map((point) => (
                <g key={point.id}>
                  <circle
                    cx={x(point.pressure)}
                    cy={y(point.oxygen)}
                    r="6"
                    fill={point.color}
                    fillOpacity="0.2"
                    stroke={point.color}
                    strokeWidth="1.5"
                  />
                  <text
                    x={x(point.pressure) + (point.id === 'earth' ? -10 : 10)}
                    y={y(point.oxygen) + (point.id === 'moon' ? 24 : point.id === 'earth' ? 20 : -12)}
                    textAnchor={point.id === 'earth' ? 'end' : 'start'}
                    fill={point.color}
                    className="chart-label"
                  >
                    {point.label}
                  </text>
                </g>
              ))}
              <g>
                <line x1={x(pressure)} y1={MARGIN.top} x2={x(pressure)} y2={HEIGHT - MARGIN.bottom} stroke="var(--bone)" strokeDasharray="3 4" />
                <line x1={MARGIN.left} y1={y(oxygen)} x2={WIDTH - MARGIN.right} y2={y(oxygen)} stroke="var(--bone)" strokeDasharray="3 4" />
                <circle cx={x(pressure)} cy={y(oxygen)} r="7" fill="none" stroke="var(--bone)" strokeWidth="1.5" />
                <text
                  x={x(pressure) + 10}
                  y={y(oxygen) - 10}
                  fill="var(--bone)"
                  className="chart-label"
                >
                  Current {oxygen}% / {pressure.toFixed(1)} psi
                </text>
              </g>
              <text x={WIDTH - MARGIN.right} y={HEIGHT - 12} textAnchor="end" fill="var(--ash)" className="axis-title">
                Total pressure (psi)
              </text>
              <text x={18} y={MARGIN.top} fill="var(--ash)" className="axis-title" transform="rotate(-90 18 120)">
                Oxygen fraction
              </text>
            </svg>
          </div>
        )}
        <p className="figure-caption">
          At {oxygen}% oxygen and {pressure.toFixed(1)} psi, oxygen partial pressure is {fixed(partial)} psi.
          Earth sea level is {fixed(earthOxygenPartialPressure)} psi (21% × 14.7 psi). The Moon planning
          point is {fixed(moonOxygenPartialPressure)} psi (30% × 10.2 psi). The partial pressure change
          is {signedPct(pressureChange)} while the oxygen fraction change is {signedPct(oxygenChange)}.
          The two measures can disagree.
        </p>
      </figure>

      <figure className="chart-figure">
        <div className="figure-head">
          <figcaption>
            <span className="mono-label">Fig. 2</span> Stated oxygen levels in the 17 in-PSI records, on
            a 0 to 100% axis.
          </figcaption>
          <button type="button" className="text-button" aria-pressed={stripTable} onClick={() => setStripTable(!stripTable)}>
            {stripTable ? 'View as chart' : 'View as table'}
          </button>
        </div>
        {stripTable ? (
          <div className="table-wrap">
            <table className="data-table">
              <caption className="visually-hidden">Stated oxygen levels in the archive</caption>
              <thead>
                <tr>
                  <th scope="col">Record</th>
                  <th scope="col">Stated oxygen level</th>
                </tr>
              </thead>
              <tbody>
                {oxygenRecords.map((record) => (
                  <tr key={record.id}>
                    <th scope="row">{record.acronym}</th>
                    <td className="num">up to {record.oxygen_pct_max}%</td>
                  </tr>
                ))}
                <tr>
                  <th scope="row">16 other records</th>
                  <td>not stated in brief</td>
                </tr>
              </tbody>
            </table>
          </div>
        ) : (
          <div className="chart-scroll">
            <svg
              viewBox={`0 0 ${STRIP_WIDTH} ${STRIP_HEIGHT}`}
              role="img"
              aria-label={`Strip chart of stated oxygen levels from 0 to 100 percent. CFI-G states up to ${oxygenRecords[0]?.oxygen_pct_max ?? 85} percent. ${notStatedCount} records state no oxygen level.`}
              className="chart-svg"
            >
              <rect
                x={stripX(MOON_OXYGEN_PCT)}
                y={STRIP_MARGIN.top - 12}
                width={stripX(100) - stripX(MOON_OXYGEN_PCT)}
                height="24"
                fill="var(--gilt)"
                fillOpacity="0.1"
              />
              <line
                x1={stripX(0)}
                x2={stripX(100)}
                y1={STRIP_MARGIN.top + 12}
                y2={STRIP_MARGIN.top + 12}
                stroke="var(--hairline)"
                strokeWidth="1"
              />
              {[0, 30, 50, 75, 100].map((tick) => (
                <g key={tick}>
                  <line
                    x1={stripX(tick)}
                    x2={stripX(tick)}
                    y1={STRIP_MARGIN.top + 6}
                    y2={STRIP_MARGIN.top + 18}
                    stroke="var(--hairline)"
                  />
                  <text
                    x={stripX(tick)}
                    y={STRIP_MARGIN.top + 36}
                    textAnchor="middle"
                    fill="var(--ash)"
                    className="chart-label"
                  >
                    {tick}%
                  </text>
                </g>
              ))}
              {oxygenRecords.map((record) => (
                <g key={record.id}>
                  <circle
                    cx={stripX(record.oxygen_pct_max ?? 0)}
                    cy={STRIP_MARGIN.top + 12}
                    r="6"
                    fill="var(--ember)"
                    fillOpacity="0.2"
                    stroke="var(--ember)"
                    strokeWidth="1.5"
                  />
                  <text
                    x={stripX(record.oxygen_pct_max ?? 0)}
                    y={STRIP_MARGIN.top - 18}
                    textAnchor="middle"
                    fill="var(--ember)"
                    className="chart-label"
                  >
                    {record.acronym} up to {record.oxygen_pct_max}%
                  </text>
                </g>
              ))}
              <text x={STRIP_MARGIN.left} y={STRIP_HEIGHT - 10} fill="var(--ash)" className="chart-label">
                {notStatedCount} records state no oxygen level.
              </text>
            </svg>
          </div>
        )}
        <p className="figure-caption">
          Only CFI-G states an oxygen level above 30%: up to {oxygenRecords[0]?.oxygen_pct_max ?? 85}%.
          The other 16 in-PSI records do not state an oxygen level in the brief. The shaded band is the
          30% or more planning region.
        </p>
      </figure>

      <section className="formula-section" aria-labelledby="atmosphere-formulas-title">
        <h2 id="atmosphere-formulas-title">Formulas on this page.</h2>
        <ul className="formula-list">
          <li>
            Oxygen <Term>partial pressure</Term> = oxygen fraction × total pressure. Example:{' '}
            {oxygen}% × {pressure.toFixed(1)} psi = {fixed(partial)} psi.
          </li>
          <li>Percent change = (value − baseline) ÷ baseline × 100.</li>
          <li>
            Earth baseline: 21% × 14.7 psi = {fixed(earthOxygenPartialPressure)} psi. The 21% is a
            standard value, not from the brief.
          </li>
          <li>
            Moon planning point: 30% × 10.2 psi = {fixed(moonOxygenPartialPressure)} psi. Spacesuit:
            100% × 4.3 psi = {fixed(suitOxygenPartialPressure)} psi.
          </li>
        </ul>
      </section>
    </Page>
  );
}
