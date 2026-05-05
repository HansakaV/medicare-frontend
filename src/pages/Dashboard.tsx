import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  Clock,
  Pill,
  TrendingUp,
  ChevronRight,
  UserPlus,
  UserCheck,
} from "lucide-react";
import { Card, CardContent } from "../components/Card";
import { patientService } from "../services/patientService";
import { queueService } from "../services/queueService";
import { medicineService } from "../services/medicineService";

import anime from "animejs";

const CharacterIcon = ({ type, color }: { type: 'patients' | 'tokens' | 'stock', color: string }) => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'));

    // Blinking Eyes Animation
    anime({
      targets: `.char-eye-${type}`,
      scaleY: [1, 0, 1],
      duration: 200,
      delay: () => anime.random(2000, 5000),
      loop: true,
      easing: 'easeInOutSine'
    });

    // Floating Animation
    anime({
      targets: `.char-container-${type}`,
      translateY: [-2, 2],
      duration: 1500,
      direction: 'alternate',
      loop: true,
      easing: 'easeInOutQuad'
    });
  }, [type]);

  const fill = color.includes('emerald') ? '#10b981' : color.includes('blue') ? '#3b82f6' : '#f59e0b';
  const bg = isDark ? (color.includes('emerald') ? '#064e3b33' : color.includes('blue') ? '#1e3a8a33' : '#78350f33') : (color.includes('emerald') ? '#ecfdf5' : color.includes('blue') ? '#eff6ff' : '#fff7ed');

  return (
    <div className={`char-container-${type} w-12 h-12 rounded-xl flex items-center justify-center transition-colors duration-300`} style={{ backgroundColor: bg }}>
      <svg viewBox="0 0 100 100" className="w-10 h-10">
        <circle cx="50" cy="40" r="25" fill={fill} opacity={isDark ? "0.3" : "0.2"} />
        {type === 'patients' && (
          <g>
            <circle cx="50" cy="45" r="20" fill={fill} />
            <circle className={`char-eye-${type}`} cx="43" cy="42" r="2" fill="white" />
            <circle className={`char-eye-${type}`} cx="57" cy="42" r="2" fill="white" />
            <path d="M45 52 Q50 56 55 52" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" />
          </g>
        )}
        {type === 'tokens' && (
          <g>
            <rect x="35" y="30" width="30" height="40" rx="5" fill={fill} />
            <rect x="40" y="35" width="20" height="2" fill="white" opacity="0.5" />
            <rect x="40" y="42" width="20" height="2" fill="white" opacity="0.5" />
            <circle className={`char-eye-${type}`} cx="45" cy="55" r="2" fill="white" />
            <circle className={`char-eye-${type}`} cx="55" cy="55" r="2" fill="white" />
          </g>
        )}
        {type === 'stock' && (
          <g>
            <path d="M40 30 L60 30 L65 70 L35 70 Z" fill={fill} />
            <rect x="42" y="25" width="16" height="5" rx="2" fill={fill} opacity="0.8" />
            <circle className={`char-eye-${type}`} cx="45" cy="45" r="2" fill="white" />
            <circle className={`char-eye-${type}`} cx="55" cy="45" r="2" fill="white" />
            <path d="M47 55 L53 55" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" />
          </g>
        )}
      </svg>
    </div>
  );
};

const StatCard = ({ title, value, type, trend, color }: any) => (
  <Card className="hover:shadow-md transition-shadow">
    <CardContent className="p-4 xl:p-5">
      <div className="flex items-center justify-between mb-2">
        <CharacterIcon type={type} color={color} />
        {trend && (
          <div className="flex items-center text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded-full uppercase">
            <TrendingUp className="h-2.5 w-2.5 mr-1" />
            {trend}
          </div>
        )}
      </div>
      <div>
        <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{title}</h3>
        <p className="text-2xl font-black text-slate-900 dark:text-white mt-0.5 tracking-tight">{value}</p>
      </div>
    </CardContent>
  </Card>
);

export const Dashboard = () => {
  const navigate = useNavigate();
  const [isSystemActive, setIsSystemActive] = useState(true);
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
          medicineService.getLowStock(10),
        ]);

        setStats({
          totalPatients: patients.total || 0,
          todayTokens: queue.count || 0,
          lowStock: medicines.count || 0,
        });
        setRecentQueue(queue.data?.slice(0, 5) || []);
        setIsSystemActive(true);
      } catch (err) {
        console.error("Error fetching dashboard stats:", err);
        setIsSystemActive(false);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
    
    // Animation for the active indicator
    if (isSystemActive) {
      anime({
        targets: '.status-dot',
        scale: [1, 1.5, 1],
        opacity: [1, 0.5, 1],
        duration: 2000,
        loop: true,
        easing: 'easeInOutSine'
      });
    }
  }, [isSystemActive]);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Health Overview</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Welcome back! Here's what's happening today.
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs font-medium text-slate-900 dark:text-slate-300">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
          <div className="flex items-center justify-end gap-2 mt-0.5">
            <div className={`status-dot w-1.5 h-1.5 rounded-full ${isSystemActive ? 'bg-emerald-500' : 'bg-red-500'}`} />
            <p className={`text-[10px] font-bold uppercase tracking-wider ${isSystemActive ? 'text-emerald-600' : 'text-red-600'}`}>
              {isSystemActive ? 'System is active' : 'System under Maintenance'}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="Registered Patients"
          value={stats.totalPatients}
          type="patients"
          trend="Live"
          color="bg-blue-500"
        />
        <StatCard
          title="Today's Tokens"
          value={stats.todayTokens}
          type="tokens"
          trend="Today"
          color="bg-emerald-500"
        />
        <StatCard
          title="Low Stock"
          value={stats.lowStock}
          type="stock"
          trend={stats.lowStock > 0 ? "Action Required" : "Stable"}
          color="bg-orange-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Recent Queue */}
        <Card className="lg:col-span-2">
          <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Current Queue</h3>
            <button
              onClick={() => navigate("/queue")}
              className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold hover:underline flex items-center"
            >
              View All <ChevronRight className="h-3 w-3 ml-0.5" />
            </button>
          </div>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider font-semibold border-b dark:border-slate-800">
                    <th className="px-6 py-3">Token</th>
                    <th className="px-6 py-3">Patient Name</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {recentQueue.length > 0 ? (
                    recentQueue.map((entry: any) => (
                      <tr
                        key={entry._id}
                        className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <span className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold text-sm">
                            {entry.tokenNumber}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-semibold text-slate-900 dark:text-white">
                            {entry.patientId?.name}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {entry.patientId?.phone}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium border ${
                              entry.status === "waiting"
                                ? "bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800"
                                : entry.status === "with doctor"
                                  ? "bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800"
                                  : "bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800"
                            }`}
                          >
                            {entry.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => navigate("/queue")}
                            className="text-slate-400 dark:text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                          >
                            <ChevronRight className="h-5 w-5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-6 py-12 text-center text-slate-400 dark:text-slate-500"
                      >
                        No active patients in queue
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white px-1">Quick Actions</h3>
          <div className="grid grid-cols-1 gap-2">
            <button
              onClick={() => navigate("/patients")}
              className="flex items-center gap-3 p-3 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl hover:border-emerald-500 hover:shadow-sm transition-all group"
            >
              <div className="p-2 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <UserPlus className="h-4 w-4" />
              </div>
              <p className="font-bold text-xs text-slate-900 dark:text-slate-200">New Patient</p>
            </button>

            <button
              onClick={() => navigate("/queue")}
              className="flex items-center gap-3 p-3 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl hover:border-blue-500 hover:shadow-sm transition-all group"
            >
              <div className="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <UserCheck className="h-4 w-4" />
              </div>
              <p className="font-bold text-xs text-slate-900 dark:text-slate-200">Issue Token</p>
            </button>

            <button
              onClick={() => navigate("/inventory")}
              className="flex items-center gap-3 p-3 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl hover:border-orange-500 hover:shadow-sm transition-all group"
            >
              <div className="p-2 bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-lg group-hover:bg-orange-600 group-hover:text-white transition-colors">
                <Pill className="h-4 w-4" />
              </div>
              <p className="font-bold text-xs text-slate-900 dark:text-slate-200">Add Medicine</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
