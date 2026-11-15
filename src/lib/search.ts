import {
  functionLabels,
  gravityLabels,
  investigations,
  phaseLabels,
  readinessKeys,
  tierLabels,
  type ReadinessKey,
} from '../data/investigations';
import type { Investigation } from '../data/schema';
import { coverageCount } from './coverage';

export type ConceptKey =
  | 'liquid'
  | 'solid'
  | 'gas'
  | 'detection'
  | 'dust-detection'
  | 'suppression'
  | 'partial-gravity'
  | 'oxygen-above-30'
  | 'microgravity';

export type Concept = {
  key: ConceptKey;
  label: string;
  phrases: string[];
  matches: (record: Investigation) => boolean;
};

export const concepts: Concept[] = [
  {
    key: 'liquid',
    label: 'liquid phase',
    phrases: ['liquid', 'liquids', 'droplet', 'droplets', 'drop', 'drops'],
    matches: (record) => record.phases.includes('liquid'),
  },
  {
    key: 'solid',
    label: 'solid phase',
    phrases: ['solid', 'solids', 'fabric', 'fabrics', 'plastic', 'plastics'],
    matches: (record) => record.phases.includes('solid'),
  },
  {
    key: 'gas',
    label: 'gas phase',
    phrases: ['gas', 'gases', 'gaseous', 'propane'],
    matches: (record) => record.phases.includes('gas'),
  },
  {
    key: 'detection',
    label: 'detection',
    phrases: ['smoke', 'detection', 'detect', 'alarm', 'alarms'],
    matches: (record) => record.functions.includes('detection'),
  },
  {
    key: 'dust-detection',
    label: 'dust detection',
    phrases: ['dust'],
    matches: (record) => record.functions.includes('dust-detection'),
  },
  {
    key: 'suppression',
    label: 'suppression',
    phrases: ['extinguish', 'extinguishment', 'suppress', 'suppression', 'helium', 'co2', 'carbon dioxide'],
    matches: (record) => record.functions.includes('suppression'),
  },
  {
    key: 'partial-gravity',
    label: 'partial gravity',
    phrases: ['partial gravity', 'partial-gravity', 'moon', 'lunar', 'martian', 'mars', 'analog'],
    matches: (record) =>
      record.gravity === 'partial' ||
      record.gravity === 'partial_analog' ||
      record.functions.includes('partial-gravity'),
  },
  {
    key: 'oxygen-above-30',
    label: 'oxygen 30% or more',
    phrases: ['above 30% oxygen', 'above 30%', 'above 30', 'over 30%', 'oxygen above 30%', 'more than 30%'],
    matches: (record) => record.oxygen_pct_max !== null && record.oxygen_pct_max > 30,
  },
  {
    key: 'microgravity',
    label: 'microgravity',
    phrases: ['microgravity', 'micro-gravity', 'free fall', 'free-fall', 'weightless'],
    matches: (record) => record.gravity === 'microgravity',
  },
];

const stopwords = new Set([
  'a',
  'an',
  'and',
  'are',
  'as',
  'at',
  'be',
  'by',
  'for',
  'from',
  'in',
  'is',
  'it',
  'of',
  'on',
  'or',
  'that',
  'the',
  'to',
  'with',
  'which',
  'what',
  'show',
  'find',
  'give',
  'me',
  'records',
  'record',
]);

export function stem(word: string): string {
  const clean = word.toLowerCase().replace(/[^a-z0-9%.-]/g, '');
  if (clean.length > 4 && clean.endsWith('ies')) return `${clean.slice(0, -3)}y`;
  if (clean.length > 4 && clean.endsWith('s') && !clean.endsWith('ss')) return clean.slice(0, -1);
  return clean;
}

export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[^a-z0-9%.-]+/)
    .map(stem)
    .filter((word) => word.length > 1 && !stopwords.has(word));
}

function recordText(record: Investigation): string {
  return [
    record.acronym,
    record.name,
    record.fuel,
    record.hardware,
    record.conditions,
    record.objective,
    ...record.phases.map((phase) => phaseLabels[phase]),
    ...record.functions.map((fn) => functionLabels[fn]),
    gravityLabels[record.gravity],
    tierLabels[record.tier],
    ...record.variables,
    ...record.measurements,
    ...readinessKeys.map((key) => record.readiness[key].value),
  ].join(' ');
}

type DocumentVector = Map<string, number>;

function termCounts(tokens: string[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const token of tokens) counts.set(token, (counts.get(token) ?? 0) + 1);
  return counts;
}

const documents = new Map<string, string[]>(
  investigations.map((record) => [record.id, tokenize(recordText(record))]),
);

const documentFrequency = new Map<string, number>();
for (const tokens of documents.values()) {
  for (const token of new Set(tokens)) {
    documentFrequency.set(token, (documentFrequency.get(token) ?? 0) + 1);
  }
}

function idf(token: string): number {
  const df = documentFrequency.get(token) ?? 0;
  return Math.log((1 + documents.size) / (1 + df)) + 1;
}

function vectorFor(tokens: string[]): DocumentVector {
  const counts = termCounts(tokens);
  const vector: DocumentVector = new Map();
  for (const [token, count] of counts) {
    vector.set(token, (count / tokens.length) * idf(token));
  }
  return vector;
}

function cosine(a: DocumentVector, b: DocumentVector): number {
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (const value of a.values()) normA += value * value;
  for (const value of b.values()) normB += value * value;
  for (const [token, value] of a) {
    const other = b.get(token);
    if (other) dot += value * other;
  }
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

const recordVectors = new Map<string, DocumentVector>(
  [...documents.entries()].map(([id, tokens]) => [id, vectorFor(tokens)]),
);

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function stripPhrase(text: string, phrase: string): { text: string; found: boolean } {
  const pattern = new RegExp(`(^|[^a-z0-9])${escapeRegExp(phrase)}(?=$|[^a-z0-9])`, 'i');
  if (!pattern.test(text)) return { text, found: false };
  return { text: text.replace(new RegExp(pattern.source, 'gi'), ' '), found: true };
}

export type ParsedQuery = {
  concepts: Concept[];
  queryWords: string[];
  unmatchedWords: string[];
  cleaned: string;
};

export function parseQuery(query: string, excluded: ConceptKey[] = []): ParsedQuery {
  let text = ` ${query.toLowerCase()} `;
  const found: Concept[] = [];
  const active = concepts.filter((concept) => !excluded.includes(concept.key));
  const phrases = active
    .flatMap((concept) => concept.phrases.map((phrase) => ({ concept, phrase })))
    .sort((a, b) => b.phrase.length - a.phrase.length);

  for (const { concept, phrase } of phrases) {
    const result = stripPhrase(text, phrase);
    if (result.found) {
      if (!found.includes(concept)) found.push(concept);
      text = result.text;
    }
  }

  const queryWords = tokenize(query);
  const unmatchedWords = tokenize(text);
  return {
    concepts: concepts.filter((concept) => found.includes(concept)),
    queryWords,
    unmatchedWords,
    cleaned: text.trim().replace(/\s+/g, ' '),
  };
}

export type ArchiveResult = {
  record: Investigation;
  concepts: Concept[];
  score: number;
  fullSimilarity: number;
  unmatchedSimilarity: number;
  reason: string;
};

export type ArchiveSearch = {
  query: string;
  concepts: Concept[];
  unmatchedWords: string[];
  results: ArchiveResult[];
  planned: ArchiveResult[];
  understood: string[];
  noMatch: boolean;
  suggestions: string[];
};

export const exampleQueries = [
  'liquid fuel',
  'smoke detection',
  'above 30% oxygen',
  'partial gravity',
  'solid materials',
  'helium',
  'dust',
  'microgravity',
] as const;

export function searchArchive(query: string, excluded: ConceptKey[] = []): ArchiveSearch {
  const parsed = parseQuery(query, excluded);
  const fullVector = vectorFor(tokenize(query));
  const unmatchedVector = vectorFor(parsed.unmatchedWords);
  const candidates = investigations.filter((record) => {
    if (parsed.concepts.length === 0) return true;
    return parsed.concepts.some((concept) => concept.matches(record));
  });

  const scored = candidates.map((record) => {
    const vec = recordVectors.get(record.id)!;
    const matched = parsed.concepts.filter((concept) => concept.matches(record));
    const fullSimilarity = cosine(fullVector, vec);
    const unmatchedSimilarity = cosine(unmatchedVector, vec);
    const conceptScore = matched.length * 10;
    const score = conceptScore + unmatchedSimilarity * 4 + fullSimilarity;
    return { record, concepts: matched, score, fullSimilarity, unmatchedSimilarity };
  });

  const ranked = scored
    .filter((result) => result.record.status === 'in_psi')
    .sort((a, b) => {
      if (b.concepts.length !== a.concepts.length) return b.concepts.length - a.concepts.length;
      if (b.score !== a.score) return b.score - a.score;
      if (b.unmatchedSimilarity !== a.unmatchedSimilarity) {
        return b.unmatchedSimilarity - a.unmatchedSimilarity;
      }
      const tierRank = (record: Investigation) => (record.tier === 'direct' ? 1 : 0);
      const tierDiff = tierRank(b.record) - tierRank(a.record);
      if (tierDiff !== 0) return tierDiff;
      const coverageDiff = coverageCount(b.record) - coverageCount(a.record);
      if (coverageDiff !== 0) return coverageDiff;
      return a.record.name.toLowerCase() < b.record.name.toLowerCase() ? -1 : 1;
    })
    .map((result) => {
      const matchedLabel = result.concepts.map((concept) => concept.label).join(', ');
      const reason =
        result.concepts.length > 0
          ? `Matched ${matchedLabel}. Text similarity ${result.fullSimilarity.toFixed(2)}; ${coverageCount(result.record)} of 6 inputs stated.`
          : `No rule match. Text similarity ${result.fullSimilarity.toFixed(2)}; ${coverageCount(result.record)} of 6 inputs stated.`;
      return { ...result, reason };
    });

  const planned = scored
    .filter(
      (result) =>
        result.record.status === 'planned' &&
        (parsed.concepts.length > 0 || result.fullSimilarity > 0 || result.unmatchedSimilarity > 0),
    )
    .sort((a, b) => b.score - a.score)
    .map((result) => ({
      ...result,
      reason:
        result.concepts.length > 0
          ? `Matched ${result.concepts.map((concept) => concept.label).join(', ')}. Planned; not ranked.`
          : 'Planned; not ranked.',
    }));

  const results =
    parsed.concepts.length > 0
      ? ranked.filter((result) => result.concepts.length > 0)
      : ranked.filter(
          (result) => result.fullSimilarity > 0 || result.unmatchedSimilarity > 0,
        );
  const noMatch = query.trim().length > 0 && results.length === 0 && planned.length === 0;
  const understood = parsed.concepts.map((concept) => concept.label);

  return {
    query,
    concepts: parsed.concepts,
    unmatchedWords: parsed.unmatchedWords,
    results,
    planned,
    understood,
    noMatch,
    suggestions: ['liquid fuel', 'smoke detection'],
  };
}

export function conceptFor(key: ConceptKey): Concept | undefined {
  return concepts.find((concept) => concept.key === key);
}

export type ReadinessSummary = Record<ReadinessKey, 'stated' | 'not stated'>;

export function readinessSummary(record: Investigation): ReadinessSummary {
  return readinessKeys.reduce((result, key) => {
    result[key] = record.readiness[key].stated ? 'stated' : 'not stated';
    return result;
  }, {} as ReadinessSummary);
}
