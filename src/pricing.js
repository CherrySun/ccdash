/**
 * pricing.js - Token Usage & Cost Calculator
 *
 * Calculates costs based on Claude model pricing.
 * Prices are per million tokens (MTok).
 */

// Pricing table (per million tokens)
const PRICING = {
  'claude-sonnet-4.6': {
    name: 'Sonnet 4',
    input: 3.00,
    output: 15.00,
    cacheRead: 0.30,
    cacheCreation: 3.75,
  },
  'claude-opus-4.6': {
    name: 'Opus 4',
    input: 15.00,
    output: 75.00,
    cacheRead: 1.50,
    cacheCreation: 18.75,
  },
  // Also match the 1M context variant
  'claude-opus-4.6-1m': {
    name: 'Opus 4',
    input: 15.00,
    output: 75.00,
    cacheRead: 1.50,
    cacheCreation: 18.75,
  },
  'claude-sonnet-4.6-1m': {
    name: 'Sonnet 4',
    input: 3.00,
    output: 15.00,
    cacheRead: 0.30,
    cacheCreation: 3.75,
  },
};

// Default to Opus 4 pricing if model is unknown
const DEFAULT_PRICING = PRICING['claude-opus-4.6'];

/**
 * Get pricing for a model.
 */
export function getModelPricing(model) {
  if (!model) return DEFAULT_PRICING;

  // Try exact match
  if (PRICING[model]) return PRICING[model];

  // Try partial match
  const lower = model.toLowerCase();
  if (lower.includes('sonnet')) return PRICING['claude-sonnet-4.6'];
  if (lower.includes('opus')) return PRICING['claude-opus-4.6'];

  return DEFAULT_PRICING;
}

/**
 * Calculate cost for a single set of token counts.
 */
export function calculateCost(tokens, model) {
  const pricing = getModelPricing(model);
  const mtok = 1_000_000;

  return {
    inputCost: (tokens.input || 0) / mtok * pricing.input,
    outputCost: (tokens.output || 0) / mtok * pricing.output,
    cacheReadCost: (tokens.cacheRead || 0) / mtok * pricing.cacheRead,
    cacheCreationCost: (tokens.cacheCreation || 0) / mtok * pricing.cacheCreation,
    get total() {
      return this.inputCost + this.outputCost + this.cacheReadCost + this.cacheCreationCost;
    },
  };
}

/**
 * Calculate cost for a session.
 */
export function calculateSessionCost(session) {
  const tokens = {
    input: session.totalInputTokens || 0,
    output: session.totalOutputTokens || 0,
    cacheRead: session.totalCacheReadTokens || 0,
    cacheCreation: session.totalCacheCreationTokens || 0,
  };

  const cost = calculateCost(tokens, session.model);

  return {
    sessionId: session.id,
    model: session.model,
    projectPath: session.projectPath || '',
    firstUserMessage: session.firstUserMessage || '',
    tokens,
    cost: {
      input: cost.inputCost,
      output: cost.outputCost,
      cacheRead: cost.cacheReadCost,
      cacheCreation: cost.cacheCreationCost,
      total: cost.total,
    },
  };
}

/**
 * Aggregate costs across multiple sessions.
 */
export function aggregateCosts(sessions) {
  const totals = {
    inputTokens: 0,
    outputTokens: 0,
    cacheReadTokens: 0,
    cacheCreationTokens: 0,
    totalCost: 0,
    inputCost: 0,
    outputCost: 0,
    cacheReadCost: 0,
    cacheCreationCost: 0,
  };

  const perSession = [];
  const perProject = {};
  const perDay = {};
  const perModel = {};

  for (const session of sessions) {
    const sc = calculateSessionCost(session);
    perSession.push(sc);

    totals.inputTokens += sc.tokens.input;
    totals.outputTokens += sc.tokens.output;
    totals.cacheReadTokens += sc.tokens.cacheRead;
    totals.cacheCreationTokens += sc.tokens.cacheCreation;
    totals.totalCost += sc.cost.total;
    totals.inputCost += sc.cost.input;
    totals.outputCost += sc.cost.output;
    totals.cacheReadCost += sc.cost.cacheRead;
    totals.cacheCreationCost += sc.cost.cacheCreation;

    // Per project
    const projectKey = session.projectPath || session.projectHash || 'unknown';
    if (!perProject[projectKey]) {
      perProject[projectKey] = { cost: 0, tokens: 0, sessions: 0 };
    }
    perProject[projectKey].cost += sc.cost.total;
    perProject[projectKey].tokens += sc.tokens.input + sc.tokens.output;
    perProject[projectKey].sessions += 1;

    // Per day
    if (session.startTime) {
      const day = new Date(session.startTime).toISOString().slice(0, 10);
      if (!perDay[day]) {
        perDay[day] = { cost: 0, inputTokens: 0, outputTokens: 0 };
      }
      perDay[day].cost += sc.cost.total;
      perDay[day].inputTokens += sc.tokens.input;
      perDay[day].outputTokens += sc.tokens.output;
    }

    // Per model
    const modelKey = sc.model || 'unknown';
    if (!perModel[modelKey]) {
      perModel[modelKey] = { cost: 0, tokens: 0, sessions: 0 };
    }
    perModel[modelKey].cost += sc.cost.total;
    perModel[modelKey].tokens += sc.tokens.input + sc.tokens.output;
    perModel[modelKey].sessions += 1;
  }

  return {
    totals,
    perSession,
    perProject,
    perDay,
    perModel,
  };
}

/**
 * Get cost stats for a time period.
 */
export function getCostsByPeriod(sessions, period = 'today') {
  const now = new Date();
  let startDate;

  switch (period) {
    case 'today':
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      break;
    case 'week':
      startDate = new Date(now);
      startDate.setDate(startDate.getDate() - 7);
      break;
    case 'month':
      startDate = new Date(now);
      startDate.setMonth(startDate.getMonth() - 1);
      break;
    case 'all':
      startDate = new Date(0);
      break;
    default:
      startDate = new Date(0);
  }

  const filtered = sessions.filter(s =>
    s.startTime && new Date(s.startTime) >= startDate
  );

  return aggregateCosts(filtered);
}

/**
 * Format cost as a readable string.
 */
export function formatCost(cost) {
  if (cost < 0.01) return `$${cost.toFixed(4)}`;
  if (cost < 1) return `$${cost.toFixed(3)}`;
  return `$${cost.toFixed(2)}`;
}

/**
 * Format token count as readable string.
 */
export function formatTokens(count) {
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`;
  if (count >= 1_000) return `${(count / 1_000).toFixed(1)}K`;
  return count.toString();
}

/**
 * Get all supported pricing models.
 */
export function getSupportedModels() {
  const models = {};
  for (const [key, value] of Object.entries(PRICING)) {
    if (!key.endsWith('-1m')) {
      models[key] = value;
    }
  }
  return models;
}
