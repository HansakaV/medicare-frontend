import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Clock, 
  Pill, 
  TrendingUp, 
  ChevronRight,
  UserPlus,
  UserCheck
} from 'lucide-react';
import { Card, CardContent } from '../components/Card';
import { patientService } from '../services/patientService';
import { queueService } from '../services/queueService';
import { medicineService } from '../services/medicineService';

const StatCard = ({ title, value, icon: Icon, trend, color }: any) => (
  <Card className="hover:shadow-md transition-shadow">
    <CardContent className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl ${color} bg-opacity-10 text-${color.split('-')[1]}-600`}>
          <Icon className="h-6 w-6" />
        </div>
        {trend && (
          <div className="flex items-center text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
            <TrendingUp className="h-3 w-3 mr-1" />
            {trend}
          </div>
        )}
      </div>
      <div>
        <h3 className="text-sm font-medium text-slate-500">{title}</h3>
        <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
      </div>
    </CardContent>
  </Card>
);

export const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalPatients: 0,
    todayTokens: 0,
    lowStock: 0,
  });
  const [recentQueue, setRecentQueue] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [patients, queue, medicines] = await Promise.all([
          patientService.getPatients(1, 1),
          queueService.getQueue(),
          medicineService.getLowStock(10)
        ]);

        setStats({
          totalPatients: patients.total || 0,
          todayTokens: queue.count || 0,
          lowStock: medicines.count || 0
        });
        setRecentQueue(queue.data?.slice(0, 5) || []);
      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Health Overview</h1>
          <p className="text-slate-500">Welcome back! Here's what's happening today.</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium text-slate-900">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          <p className="text-xs text-slate-500">System is active</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard 
          title="Total Registered Patients" 
          value={stats.totalPatients} 
          icon={Users} 
          trend="Live" 
          color="bg-blue-500" 
        />
        <StatCard 
          title="Tokens Issued Today" 
          value={stats.todayTokens} 
          icon={Clock} 
          trend="Today" 
          color="bg-emerald-500" 
        />
        <StatCard 
          title="Low Stock Medicines" 
          value={stats.lowStock} 
          icon={Pill} 
          trend={stats.lowStock > 0 ? "Action Required" : "Stable"}
          color="bg-orange-500" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Queue */}
        <Card className="lg:col-span-2">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-slate-900">Current Patient Queue</h3>
            <button 
              onClick={() => navigate('/queue')}
              className="text-sm text-emerald-600 font-semibold hover:underline flex items-center"
            >
              View Full Queue <ChevronRight className="h-4 w-4 ml-1" />
            </button>
          </div>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-semibold">
                    <th className="px-6 py-3">Token</th>
                    <th className="px-6 py-3">Patient Name</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentQueue.length > 0 ? (
                    recentQueue.map((entry: any) => (
                      <tr key={entry._id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4">
                          <span className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm">
                            {entry.tokenNumber}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-semibold text-slate-900">{entry.patientId?.name}</p>
                          <p className="text-xs text-slate-500">{entry.patientId?.phone}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            entry.status === 'waiting' ? 'bg-orange-100 text-orange-700' :
                            entry.status === 'with doctor' ? 'bg-blue-100 text-blue-700' :
                            'bg-emerald-100 text-emerald-700'
                          }`}>
                            {entry.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <button 
                            onClick={() => navigate('/queue')}
                            className="text-slate-400 hover:text-emerald-600 transition-colors"
                          >
                            <ChevronRight className="h-5 w-5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-slate-400">
                        No active patients in queue
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="space-y-6">
          <h3 className="font-bold text-slate-900">Quick Actions</h3>
          <div className="grid grid-cols-1 gap-4">
            <button 
              onClick={() => navigate('/patients')}
              className="flex items-center gap-4 p-4 bg-white border border-slate-200 rounded-xl hover:border-emerald-500 hover:shadow-md transition-all group"
            >
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <UserPlus className="h-6 w-6" />
              </div>
              <div className="text-left">
                <p className="font-bold text-slate-900">New Patient</p>
                <p className="text-xs text-slate-500">Register a new patient</p>
              </div>
            </button>

            <button 
              onClick={() => navigate('/queue')}
              className="flex items-center gap-4 p-4 bg-white border border-slate-200 rounded-xl hover:border-blue-500 hover:shadow-md transition-all group"
            >
              <div className="p-3 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <UserCheck className="h-6 w-6" />
              </div>
              <div className="text-left">
                <p className="font-bold text-slate-900">Issue Token</p>
                <p className="text-xs text-slate-500">Add patient to queue</p>
              </div>
            </button>

            <button 
              onClick={() => navigate('/inventory')}
              className="flex items-center gap-4 p-4 bg-white border border-slate-200 rounded-xl hover:border-orange-500 hover:shadow-md transition-all group"
            >
              <div className="p-3 bg-orange-50 text-orange-600 rounded-lg group-hover:bg-orange-600 group-hover:text-white transition-colors">
                <Pill className="h-6 w-6" />
              </div>
              <div className="text-left">
                <p className="font-bold text-slate-900">Add Medicine</p>
                <p className="text-xs text-slate-500">Update inventory stock</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

