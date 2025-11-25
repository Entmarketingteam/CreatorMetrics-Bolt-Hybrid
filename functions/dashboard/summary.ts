import { getSummaryMetrics } from '../../lib/storage';

export async function getDashboardSummary() {
  const summary = await getSummaryMetrics();
  return summary;
}
