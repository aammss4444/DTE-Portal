import { useState, useEffect } from 'react';
import { LayoutDashboard, Building2, Users, FileCheck, Loader2 } from 'lucide-react';
import api from '../../services/api';

const RODashboard = () => {
  const [liveStats, setLiveStats] = useState({
    institutes: 0,
    verifiedAds: 0,
    pendingApprovals: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/requirements/dashboard/ro-stats');
        if (response.data.status === 'success') {
          setLiveStats(response.data.data);
        }
      } catch (error) {
        console.error('Failed to fetch RO stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const stats = [
    { label: 'Institutes in Region', value: liveStats.institutes, icon: Building2, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { label: 'Total Verified Ads', value: liveStats.verifiedAds, icon: FileCheck, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { label: 'Pending Approvals', value: liveStats.pendingApprovals, icon: Users, color: 'text-amber-500', bg: 'bg-amber-500/10' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">RO Dashboard (Regional Office)</h1>
        <p className="text-secondary">Overview of regional activities, institute status, and recruitment approvals.</p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="p-8 bg-background rounded-2xl border border-border shadow-sm flex flex-col items-center text-center space-y-4">
            <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color}`}>
              <stat.icon size={32} />
            </div>
            <div>
              <p className="text-sm font-semibold text-secondary tracking-wide uppercase">{stat.label}</p>
              <p className="text-4xl font-bold text-foreground mt-2">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>
      )}

      <div className="grid md:grid-cols-2 gap-8 mt-12">
        <div className="bg-background rounded-2xl border border-border p-8 border-dashed flex flex-col items-center justify-center text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center text-secondary">
            <Building2 size={32} />
          </div>
          <h3 className="text-xl font-bold">Regional Map View</h3>
          <p className="text-secondary max-w-sm">Geographical distribution of institutes and their recruitment status will be displayed here.</p>
        </div>
        
        <div className="bg-background rounded-2xl border border-border p-8 border-dashed flex flex-col items-center justify-center text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center text-secondary">
            <LayoutDashboard size={32} />
          </div>
          <h3 className="text-xl font-bold">Regional Statistics</h3>
          <p className="text-secondary max-w-sm">Detailed charts and analytics for the region's recruitment performance.</p>
        </div>
      </div>
    </div>
  );
};

export default RODashboard;
