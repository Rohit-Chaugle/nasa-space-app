export type GlossaryEntry = { term: string; definition: string };

export const glossary: GlossaryEntry[] = [
  {
    term: 'buoyancy',
    definition:
      'The tendency of a fluid to rise when it is less dense than its surroundings. In a gravity field, hot combustion gas rises and can carry fresh oxygen toward a flame.',
  },
  {
    term: 'diffusion flame',
    definition:
      'A flame in which fuel and oxidizer meet and burn through mixing at the flame zone, rather than being premixed before ignition.',
  },
  {
    term: 'laminar flow',
    definition:
      'Smooth flow in parallel layers with little cross-stream mixing. It is a common baseline for combustion experiments because the flow field is simpler to describe.',
  },
  {
    term: 'co-flow',
    definition:
      'A flow arrangement in which a fuel stream travels alongside a surrounding oxidizer stream in the same direction.',
  },
  {
    term: 'smoke point',
    definition:
      'The condition at which a laminar diffusion flame begins to release visible soot. It is used as a relative measure of a fuel’s sooting tendency.',
  },
  {
    term: 'liftoff',
    definition:
      'The detachment of a flame from a burner or fuel surface when flow velocity is high enough that the flame stabilizes downstream.',
  },
  {
    term: 'dilution',
    definition:
      'Adding a gas that lowers the concentration of oxygen or fuel in a mixture. The brief names CO2 and helium as diluents in suppression work.',
  },
  {
    term: 'flammability limit',
    definition:
      'The boundary of the fuel and oxidizer proportions in which a flame can propagate. Outside that range, the mixture will not sustain combustion.',
  },
  {
    term: 'partial pressure',
    definition:
      'The pressure one gas in a mixture would exert if it occupied the volume alone. In this site, oxygen partial pressure = oxygen fraction × total pressure.',
  },
  {
    term: 'microgravity',
    definition:
      'A free-fall condition in which the effective gravitational acceleration is very small. Buoyancy is weak, so flames rely more on diffusion and ventilation.',
  },
  {
    term: 'partial gravity',
    definition:
      'Gravity weaker than Earth’s, such as the surface gravity of the Moon or Mars. The archive contains an electric-field analog, not partial-gravity combustion data.',
  },
  {
    term: 'cool flame',
    definition:
      'A low-temperature oxidation reaction that can proceed without the bright, hot flame of ordinary combustion. The brief names CFI and CFI-G for this behavior.',
  },
  {
    term: 'aerosol',
    definition:
      'Fine solid or liquid particles suspended in a gas. Smoke and dust are aerosols, which matters for detection.',
  },
  {
    term: 'droplet combustion',
    definition:
      'Burning of a liquid fuel droplet, often studied as a single droplet so evaporation, mixing and flame standoff can be isolated.',
  },
  {
    term: 'inert diluent',
    definition:
      'A gas added to a mixture that does not itself provide fuel or oxygen. Helium is inert; CO2 is used as a diluent and suppressant in the work named in the brief.',
  },
  {
    term: 'fine water mist',
    definition:
      'Water broken into fine droplets and discharged into a fire zone. The small droplets can absorb heat and displace oxygen. The brief names it as an Earth application.',
  },
  {
    term: 'psi',
    definition: 'Pounds per square inch, a unit of pressure. The brief uses psi for total pressure and oxygen partial pressure.',
  },
  {
    term: 'CIR',
    definition: 'Combustion Integrated Rack, the ISS facility named in the brief for MDCA and ACME hardware.',
  },
  {
    term: 'MDCA',
    definition: 'Multi-User Droplet Combustion Apparatus, the hardware in the CIR named for FLEX, FLEX-2 and CFI.',
  },
  {
    term: 'MSG',
    definition: 'Microgravity Science Glovebox, the facility named for BASS, BASS-II, SPICE and SLICE.',
  },
  {
    term: 'ACME',
    definition: 'Advanced Combustion via Microgravity Experiments. The brief names three of its six experiments: CFI-G, E-FIELD and BRE.',
  },
  {
    term: 'PSI',
    definition: 'NASA Physical Science Informatics, the NASA database named as the source for the investigations in this site.',
  },
];

export const glossaryMap = new Map(glossary.map((entry) => [entry.term.toLowerCase(), entry.definition]));
