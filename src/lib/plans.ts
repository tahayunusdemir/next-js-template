type PlanId = 'free' | 'plus' | 'pro' | 'elite';

/** Billable tiers that can enter checkout. */
export type PaidPlanId = Exclude<PlanId, 'free'>;

export type BillingPeriod = 'monthly' | 'annual';

export type Plan = {
  id: PlanId;
  monthly: number;
  yearly: number;
  popular: boolean;
  /** `Pricing` i18n keys for the plan's feature bullets. */
  features: readonly string[];
  /** `Pricing` i18n key for the "everything in the tier below" line, if any. */
  includesKey?: string;
  /**
   * Stripe price ids per billing period, filled in when billing goes live.
   * Price ids are public (not secrets), so they live in the catalog; the
   * secret key stays in `Env.ts` and is read server-side in the checkout action.
   */
  stripePriceId: Record<BillingPeriod, string | undefined>;
};

// Single source of truth for plan tiers, shared by pricing and checkout.
export const PLANS = [
  {
    id: 'free',
    monthly: 0,
    yearly: 0,
    popular: false,
    includesKey: undefined,
    features: [
      'free_feature_1',
      'free_feature_2',
      'free_feature_3',
      'free_feature_4',
      'free_feature_5',
    ],
    stripePriceId: { monthly: undefined, annual: undefined },
  },
  {
    id: 'plus',
    monthly: 4.99,
    yearly: 47.99,
    popular: true,
    includesKey: undefined,
    features: [
      'plus_feature_1',
      'plus_feature_2',
      'plus_feature_3',
      'plus_feature_4',
      'plus_feature_5',
    ],
    stripePriceId: { monthly: undefined, annual: undefined },
  },
  {
    id: 'pro',
    monthly: 9.99,
    yearly: 95.99,
    popular: false,
    includesKey: 'pro_includes',
    features: [
      'pro_feature_1',
      'pro_feature_2',
      'pro_feature_3',
      'pro_feature_4',
      'pro_feature_5',
      'pro_feature_6',
    ],
    stripePriceId: { monthly: undefined, annual: undefined },
  },
  {
    id: 'elite',
    monthly: 19.99,
    yearly: 191.99,
    popular: false,
    includesKey: 'elite_includes',
    features: [
      'elite_feature_1',
      'elite_feature_2',
      'elite_feature_3',
      'elite_feature_4',
      'elite_feature_5',
    ],
    stripePriceId: { monthly: undefined, annual: undefined },
  },
] as const satisfies readonly Plan[];

export type CatalogPlan = (typeof PLANS)[number];

type PlanPrices = Pick<Plan, 'monthly' | 'yearly'>;

/**
 * Finds a plan by id.
 * @param id - Candidate plan id from a URL or form.
 * @returns The matching plan, or undefined when the id is unknown.
 */
export function getPlan(id: string): CatalogPlan | undefined {
  return PLANS.find((plan) => plan.id === id);
}

/**
 * Narrows a plan to a billable tier eligible for checkout.
 * @param plan - The plan to test.
 * @returns Whether the plan is paid.
 */
export function isPaidPlan(plan: CatalogPlan): plan is CatalogPlan & { id: PaidPlanId } {
  return plan.monthly > 0;
}

// Drops trailing zeros so whole prices read "8" while fractional ones keep cents.
export function formatPrice(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(2);
}

// Per-month price for the selected period (annual shows the monthly equivalent).
export function getMonthlyPrice(plan: PlanPrices, period: BillingPeriod) {
  return period === 'annual' ? Math.round((plan.yearly / 12) * 100) / 100 : plan.monthly;
}

// Amount charged now for the selected period.
export function getPeriodTotal(plan: PlanPrices, period: BillingPeriod) {
  return period === 'annual' ? plan.yearly : plan.monthly;
}

// Undiscounted list price for a year (twelve monthly payments), shown as the
// checkout subtotal before the annual discount line.
export function getAnnualListPrice(plan: PlanPrices) {
  return Math.round(plan.monthly * 12 * 100) / 100;
}

// Money saved over a year by paying annually instead of monthly.
export function getAnnualSavings(plan: PlanPrices) {
  return Math.round((plan.monthly * 12 - plan.yearly) * 100) / 100;
}
