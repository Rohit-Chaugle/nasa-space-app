import { z } from 'zod';

export const IDS = [
  'bass',
  'bass-ii',
  'saffire-1',
  'saffire-2',
  'saffire-3',
  'same',
  'same-r',
  'flex',
  'flex-2',
  'cfi',
  'cfi-g',
  'e-field',
  'bre',
  'spice',
  'slice',
  'daft',
  'daft-2',
  'luci',
  'fm2',
] as const;

export const phaseSchema = z.enum(['solid', 'liquid', 'gas', 'dust']);
export const gravitySchema = z.enum(['microgravity', 'partial_analog', 'partial']);
export const tierSchema = z.enum(['direct', 'related', 'planned']);
export const functionSchema = z.enum([
  'flammability',
  'detection',
  'suppression',
  'oxygen-enriched',
  'partial-gravity',
  'dust-detection',
  'flame-fundamentals',
]);
export const readinessInputSchema = z
  .object({
    stated: z.boolean(),
    value: z.string().min(1),
  })
  .strict();

export const investigationSchema = z
  .object({
    id: z.enum(IDS),
    name: z.string().min(3),
    acronym: z.string().min(1),
    status: z.enum(['in_psi', 'planned']),
    tier: tierSchema,
    gravity: gravitySchema,
    phases: z.array(phaseSchema),
    functions: z.array(functionSchema).min(1),
    fuel: z.string().min(1),
    hardware: z.string().min(1),
    conditions: z.string().min(1),
    objective: z.string().min(1),
    variables: z.array(z.string().min(1)),
    measurements: z.array(z.string().min(1)),
    readiness: z
      .object({
        oxygen: readinessInputSchema,
        pressure: readinessInputSchema,
        airflow: readinessInputSchema,
        fuelIdentity: readinessInputSchema,
        fuelGeometry: readinessInputSchema,
        measurement: readinessInputSchema,
      })
      .strict(),
    oxygen_pct_max: z.number().min(0).max(100).nullable(),
    source: z
      .object({
        section: z.string().min(1),
        psi_url: z.literal('https://psi.nasa.gov/'),
        verification: z.literal('named_in_brief'),
      })
      .strict(),
  })
  .strict();

export const investigationsSchema = z
  .array(investigationSchema)
  .length(IDS.length)
  .superRefine((records, ctx) => {
    const seen = new Set<string>();
    for (const record of records) {
      if (seen.has(record.id)) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: `Duplicate id: ${record.id}` });
      }
      seen.add(record.id);
      if (record.objective.trim().split(/\s+/).length > 35) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Objective over 35 words: ${record.id}`,
        });
      }
      if (record.status === 'planned' && record.tier !== 'planned') {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: `Planned tier mismatch: ${record.id}` });
      }
      if (record.status === 'in_psi' && record.tier === 'planned') {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: `In-PSI tier mismatch: ${record.id}` });
      }
      if (record.status === 'in_psi' && record.gravity === 'partial') {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: `Partial gravity in PSI: ${record.id}` });
      }
      if (record.oxygen_pct_max !== null && record.readiness.oxygen.stated !== true) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: `Unstated oxygen level: ${record.id}` });
      }
    }
    for (const id of IDS) {
      if (!seen.has(id)) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: `Missing id: ${id}` });
      }
    }
  });

export type Investigation = z.infer<typeof investigationSchema>;
export type ReadinessInput = z.infer<typeof readinessInputSchema>;
export type Phase = z.infer<typeof phaseSchema>;
export type Gravity = z.infer<typeof gravitySchema>;
export type Tier = z.infer<typeof tierSchema>;
export type InvestigationFunction = z.infer<typeof functionSchema>;
