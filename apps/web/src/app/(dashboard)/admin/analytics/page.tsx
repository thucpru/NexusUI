
import { AnalyticsDashboard } from '@/components/admin/analytics-dashboard';

export const metadata = { title: 'Analytics' };

/** Admin platform analytics page */
export default function AdminAnalyticsPage() {
  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-[1.25rem] font-bold text-white">Platform Analytics</h1>
        <p className="text-sm text-[#808080] mt-0.5">
          Revenue, model usage, and platform activity overview.
        </p>
      </div>
      <AnalyticsDashboard />
    </div>
  );
}
