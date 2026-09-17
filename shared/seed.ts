import type { Artifact, Project, User } from './types';

export const SEED_USERS: User[] = [
  {
    id: 'usr-1',
    name: 'Sarah Jenkins',
    email: 'sarah.jenkins@seic.com',
    roles: ['admin', 'author'],
    projectIds: ['proj-1', 'proj-2', 'proj-3'],
    status: 'active',
    createdAt: '2026-01-10T09:00:00Z',
    lastLoginAt: '2026-09-17T08:30:00Z',
  },
  {
    id: 'usr-2',
    name: 'Alex Chen',
    email: 'alex.chen@seic.com',
    roles: ['author'],
    projectIds: ['proj-1', 'proj-2'],
    status: 'active',
    createdAt: '2026-02-15T11:20:00Z',
    lastLoginAt: '2026-09-16T14:15:00Z',
  },
  {
    id: 'usr-3',
    name: 'Marcus Vance',
    email: 'marcus.vance@seic.com',
    roles: ['developer'],
    projectIds: ['proj-1', 'proj-3'],
    status: 'active',
    createdAt: '2026-03-01T10:00:00Z',
    lastLoginAt: '2026-09-17T10:00:00Z',
  },
  {
    id: 'usr-4',
    name: 'Elena Rostova',
    email: 'elena.rostova@seic.com',
    roles: ['developer'],
    projectIds: ['proj-2'],
    status: 'disabled',
    createdAt: '2026-04-12T16:45:00Z',
    lastLoginAt: '2026-08-20T17:00:00Z',
  },
];

export const SEED_ARTIFACTS: Artifact[] = [
  {
    id: 'art-1',
    name: '10-K Income Statement Extractor',
    description: 'Two-stage LLM pipeline to extract line items, consolidated revenue, operating expenses, and net margin from SEC 10-K filings.',
    status: 'published',
    currentVersion: 'v1.2.0',
    projectIds: ['proj-1', 'proj-2'],
    createdAt: '2026-03-01T10:00:00Z',
    createdBy: { id: 'usr-1', name: 'Sarah Jenkins', email: 'sarah.jenkins@seic.com' },
    updatedAt: '2026-09-15T14:30:00Z',
    updatedBy: { id: 'usr-2', name: 'Alex Chen', email: 'alex.chen@seic.com' },
    stage1Prompt: `You are an expert financial analyst. Read the attached SEC Form 10-K section Item 8 (Consolidated Financial Statements).
Extract all rows in the Consolidated Statements of Operations table verbatim into key-value pairs, maintaining exact original currency units and period headers.
Do not calculate or infer missing numbers.`,
    stage2Prompt: `Take the raw extracted financial statement rows from Stage 1.
Normalize line items into standard GAAP financial classifications:
- totalRevenue
- costOfRevenue
- grossProfit
- researchAndDevelopment
- sellingGeneralAndAdministrative
- totalOperatingExpenses
- operatingIncome
- netIncome
Convert all numeric string representations into standard ISO floating point numbers. If amounts are in thousands or millions, scale them to standard dollar base units.`,
    jsonSchema: `{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "NormalizedIncomeStatement",
  "type": "object",
  "properties": {
    "fiscalYear": { "type": "integer", "minimum": 1990, "maximum": 2030 },
    "periodEndDate": { "type": "string", "format": "date" },
    "currency": { "type": "string", "default": "USD" },
    "totalRevenue": { "type": "number" },
    "costOfRevenue": { "type": "number" },
    "grossProfit": { "type": "number" },
    "operatingExpenses": {
      "type": "object",
      "properties": {
        "researchAndDevelopment": { "type": "number" },
        "sellingGeneralAndAdministrative": { "type": "number" },
        "total": { "type": "number" }
      },
      "required": ["total"]
    },
    "operatingIncome": { "type": "number" },
    "netIncome": { "type": "number" }
  },
  "required": ["fiscalYear", "currency", "totalRevenue", "operatingIncome", "netIncome"]
}`,
    fewShotExamples: [
      {
        inputRaw: "Consolidated Statements of Income (in millions): Revenues $24,510, Cost of sales $12,100, Gross margin $12,410, R&D $3,100, SG&A $4,200, Operating income $5,110, Net income $4,020 for FY ended Dec 31, 2025.",
        outputNormalized: {
          fiscalYear: 2025,
          periodEndDate: "2025-12-31",
          currency: "USD",
          totalRevenue: 24510000000,
          costOfRevenue: 12100000000,
          grossProfit: 12410000000,
          operatingExpenses: {
            researchAndDevelopment: 3100000000,
            sellingGeneralAndAdministrative: 4200000000,
            total: 7300000000
          },
          operatingIncome: 5110000000,
          netIncome: 4020000000
        }
      }
    ],
    versions: [
      {
        version: 'v1.0.0',
        stage1Prompt: 'Extract financial rows from 10-K tables.',
        stage2Prompt: 'Format rows as JSON with GAAP keys.',
        jsonSchema: '{\n  "type": "object"\n}',
        fewShotExamples: [],
        publishedAt: '2026-03-01T10:00:00Z',
        publishedBy: { id: 'usr-1', name: 'Sarah Jenkins', email: 'sarah.jenkins@seic.com' },
        changelog: 'Initial version release.'
      },
      {
        version: 'v1.1.0',
        stage1Prompt: 'Extract verbatim table cells with line numbers.',
        stage2Prompt: 'Normalize into GAAP taxonomy and scale millions/thousands.',
        jsonSchema: '{\n  "type": "object",\n  "required": ["totalRevenue", "netIncome"]\n}',
        fewShotExamples: [],
        publishedAt: '2026-06-12T16:00:00Z',
        publishedBy: { id: 'usr-1', name: 'Sarah Jenkins', email: 'sarah.jenkins@seic.com' },
        changelog: 'Added strict dollar scale multipliers.'
      },
      {
        version: 'v1.2.0',
        stage1Prompt: `You are an expert financial analyst. Read the attached SEC Form 10-K section Item 8 (Consolidated Financial Statements).\nExtract all rows in the Consolidated Statements of Operations table verbatim into key-value pairs, maintaining exact original currency units and period headers.\nDo not calculate or infer missing numbers.`,
        stage2Prompt: `Take the raw extracted financial statement rows from Stage 1.\nNormalize line items into standard GAAP financial classifications:\n- totalRevenue\n- costOfRevenue\n- grossProfit\n- researchAndDevelopment\n- sellingGeneralAndAdministrative\n- totalOperatingExpenses\n- operatingIncome\n- netIncome\nConvert all numeric string representations into standard ISO floating point numbers. If amounts are in thousands or millions, scale them to standard dollar base units.`,
        jsonSchema: `{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "NormalizedIncomeStatement",
  "type": "object",
  "properties": {
    "fiscalYear": { "type": "integer", "minimum": 1990, "maximum": 2030 },
    "periodEndDate": { "type": "string", "format": "date" },
    "currency": { "type": "string", "default": "USD" },
    "totalRevenue": { "type": "number" },
    "costOfRevenue": { "type": "number" },
    "grossProfit": { "type": "number" },
    "operatingExpenses": {
      "type": "object",
      "properties": {
        "researchAndDevelopment": { "type": "number" },
        "sellingGeneralAndAdministrative": { "type": "number" },
        "total": { "type": "number" }
      },
      "required": ["total"]
    },
    "operatingIncome": { "type": "number" },
    "netIncome": { "type": "number" }
  },
  "required": ["fiscalYear", "currency", "totalRevenue", "operatingIncome", "netIncome"]
}`,
        fewShotExamples: [
          {
            inputRaw: "Consolidated Statements of Income (in millions): Revenues $24,510, Cost of sales $12,100...",
            outputNormalized: { fiscalYear: 2025, totalRevenue: 24510000000, netIncome: 4020000000 }
          }
        ],
        publishedAt: '2026-09-15T14:30:00Z',
        publishedBy: { id: 'usr-2', name: 'Alex Chen', email: 'alex.chen@seic.com' },
        changelog: 'Added strict schema validation and few-shot calibration examples.'
      }
    ],
    validationState: {
      isValid: true,
      errors: [],
      warnings: [],
      lastValidatedAt: '2026-09-15T14:28:00Z'
    }
  },
  {
    id: 'art-2',
    name: 'Portfolio Fee Schedule Parser',
    description: 'Extraction and tier-bracket calculation parser for institutional investment management and custodial fee schedules.',
    status: 'published',
    currentVersion: 'v2.0.0',
    projectIds: ['proj-1', 'proj-3'],
    createdAt: '2026-04-10T11:00:00Z',
    createdBy: { id: 'usr-2', name: 'Alex Chen', email: 'alex.chen@seic.com' },
    updatedAt: '2026-09-10T09:15:00Z',
    updatedBy: { id: 'usr-1', name: 'Sarah Jenkins', email: 'sarah.jenkins@seic.com' },
    stage1Prompt: `Extract all fee schedule tables from the client IMA (Investment Management Agreement).
Identify asset tier breakpoints (e.g. First $25M, Next $50M, Over $100M) and basis points (bps) or fixed fees.`,
    stage2Prompt: `Normalize extracted tier tables into an array of tiered fee calculation rules:
Format: { minAUM: number, maxAUM: number | null, rateBps: number, fixedAnnualFee: number }.
Ensure all rates are converted to standard basis points (1 bp = 0.01%).`,
    jsonSchema: `{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "FeeScheduleMatrix",
  "type": "object",
  "properties": {
    "accountType": { "type": "string" },
    "effectiveDate": { "type": "string", "format": "date" },
    "tiers": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "minAum": { "type": "number" },
          "maxAum": { "type": ["number", "null"] },
          "rateBps": { "type": "number" },
          "fixedFee": { "type": "number" }
        },
        "required": ["minAum", "rateBps"]
      }
    }
  },
  "required": ["accountType", "tiers"]
}`,
    fewShotExamples: [
      {
        inputRaw: "First $50,000,000 at 35 bps; Next $50,000,000 at 25 bps; Balance over $100,000,000 at 15 bps.",
        outputNormalized: {
          accountType: "Institutional Separate Account",
          effectiveDate: "2026-01-01",
          tiers: [
            { minAum: 0, maxAum: 50000000, rateBps: 35, fixedFee: 0 },
            { minAum: 50000000, maxAum: 100000000, rateBps: 25, fixedFee: 0 },
            { minAum: 100000000, maxAum: null, rateBps: 15, fixedFee: 0 }
          ]
        }
      }
    ],
    versions: [
      {
        version: 'v2.0.0',
        stage1Prompt: 'Extract all fee schedule tables from the client IMA.',
        stage2Prompt: 'Normalize extracted tier tables into an array of tiered fee calculation rules.',
        jsonSchema: '{\n  "title": "FeeScheduleMatrix"\n}',
        fewShotExamples: [],
        publishedAt: '2026-09-10T09:15:00Z',
        publishedBy: { id: 'usr-1', name: 'Sarah Jenkins', email: 'sarah.jenkins@seic.com' },
        changelog: 'V2 schema redesign with nullable maxAum brackets.'
      }
    ],
    validationState: {
      isValid: true,
      errors: [],
      warnings: [],
      lastValidatedAt: '2026-09-10T09:10:00Z'
    }
  },
  {
    id: 'art-3',
    name: 'Private Equity Capital Call Notice Extractor',
    description: 'Extracts LP commitment drawdowns, due dates, wire instructions, and capital account balances from fund capital calls.',
    status: 'draft',
    currentVersion: 'v0.3.0-draft',
    projectIds: ['proj-2'],
    createdAt: '2026-08-01T15:00:00Z',
    createdBy: { id: 'usr-2', name: 'Alex Chen', email: 'alex.chen@seic.com' },
    updatedAt: '2026-09-17T11:00:00Z',
    updatedBy: { id: 'usr-2', name: 'Alex Chen', email: 'alex.chen@seic.com' },
    stage1Prompt: `Extract notice date, fund legal entity, LP investor name, total call amount, payment due date, and bank routing details from the capital call letter.`,
    stage2Prompt: `Structure the payment details and validate ABA routing transit number checksums. Format currency and account numbers with masking on display.`,
    jsonSchema: `{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "CapitalCallNotice",
  "type": "object",
  "properties": {
    "fundName": { "type": "string" },
    "lpName": { "type": "string" },
    "callAmount": { "type": "number", "minimum": 0 },
    "dueDate": { "type": "string", "format": "date" },
    "bankingDetails": {
      "type": "object",
      "properties": {
        "bankName": { "type": "string" },
        "routingNumber": { "type": "string" },
        "accountNumber": { "type": "string" }
      },
      "required": ["bankName", "routingNumber", "accountNumber"]
    }
  },
  "required": ["fundName", "lpName", "callAmount", "dueDate", "bankingDetails"]
}`,
    fewShotExamples: [],
    versions: [],
    validationState: {
      isValid: true,
      errors: [],
      warnings: ['Draft has no few-shot calibration examples registered.'],
      lastValidatedAt: '2026-09-17T11:05:00Z'
    }
  }
];

export const SEED_PROJECTS: Project[] = [
  {
    id: 'proj-1',
    name: 'Stratos SEC Pipeline',
    description: 'Production pipeline extracting and structuring 10-K, 10-Q, and 8-K filings for wealth management intelligence in Stratos.',
    status: 'active',
    artifactIds: ['art-1', 'art-2'],
    userIds: ['usr-1', 'usr-2', 'usr-3'],
    createdAt: '2026-01-15T08:00:00Z',
    updatedAt: '2026-09-15T15:00:00Z'
  },
  {
    id: 'proj-2',
    name: 'DataVision Alternative Assets',
    description: 'DataVision integration ingest module for private equity, venture capital, and real estate unstructured investor notices.',
    status: 'active',
    artifactIds: ['art-1', 'art-3'],
    userIds: ['usr-1', 'usr-2', 'usr-4'],
    createdAt: '2026-02-20T10:30:00Z',
    updatedAt: '2026-09-17T11:15:00Z'
  },
  {
    id: 'proj-3',
    name: 'Institutional Billing & Fee Engine',
    description: 'Automated billing verification engine cross-checking custodial fee schedules against custody asset feeds.',
    status: 'active',
    artifactIds: ['art-2'],
    userIds: ['usr-1', 'usr-3'],
    createdAt: '2026-03-10T14:00:00Z',
    updatedAt: '2026-09-10T10:00:00Z'
  }
];
