// ─── Mock Data ────────────────────────────────────────────────────────────────

const DASHBOARD_METRICS = {
  total_revenue: 2480000,
  revenue_trend: [180000, 220000, 195000, 270000, 310000, 248000],
  total_orders: 1284,
  orders_trend: [88, 102, 97, 134, 151, 128],
  active_campaigns: 4,
  low_stock_alerts: 7,
  ai_actions_today: 12,
};

const RECENT_AI_ACTIONS = [
  {
    id: 1,
    time: '2 min ago',
    type: 'Campaign Created',
    description: 'Launched "Karachi Summer Surge" campaign at 18% discount targeting high-abandon carts.',
    status: 'executed',
    impact: '+₨ 82,000 projected',
  },
  {
    id: 2,
    time: '47 min ago',
    type: 'Price Adjustment',
    description: 'Reduced price on SKU-2041 by 12% in Lahore region after 3-day low velocity analysis.',
    status: 'executed',
    impact: '+23% velocity',
  },
  {
    id: 3,
    time: '2 hrs ago',
    type: 'Inventory Alert',
    description: 'Reorder triggered for "Samsung Galaxy A15" — Islamabad stock below threshold (4 units).',
    status: 'pending',
    impact: 'Awaiting approval',
  },
  {
    id: 4,
    time: '4 hrs ago',
    type: 'Sales Analysis',
    description: 'Detected 34% drop in Peshawar region. Root cause: festival season shift. Recommendation generated.',
    status: 'insight',
    impact: 'Action queued',
  },
];

// ─── Router ───────────────────────────────────────────────────────────────────

export const getMockResponse = (url: string): any | null => {
  if (url.includes('/dashboard/metrics')) return DASHBOARD_METRICS;
  if (url.includes('/dashboard/ai-actions')) return RECENT_AI_ACTIONS;
  return null;
};

export { RECENT_AI_ACTIONS };
