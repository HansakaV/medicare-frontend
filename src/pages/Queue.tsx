import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Clock, 
  Search, 
  CheckCircle2, 
  UserCircle2, 
  Timer,
  RefreshCcw,
  Plus,
  CreditCard
} from 'lucide-react';
import { queueService } from '../services/queueService';
import { patientService } from '../services/patientService';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Card, CardContent } from '../components/Card';

export const Queue = () => {
  const navigate = useNavigate();
  const [queue, setQueue] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResult, setSearchResult] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(false);

  const fetchQueue = async () => {
    try {
      const data = await queueService.getQueue();
      setQueue(data.data || []);
    } catch (err) {
      console.error('Error fetching queue:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
    // Poll every 30 seconds for updates
    const interval = setInterval(fetchQueue, 30000);
    return () => clearInterval(interval);
  }, []);

  const handlePatientSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm) return;
    setIsSearching(true);
    try {
      const data = await patientService.searchPatient(searchTerm);
      setSearchResult(data.data);
    } catch (err) {
      alert('Patient not found. Please register the patient first.');
      setSearchResult(null);
    } finally {
      setIsSearching(false);
    }
  };

  const handleIssueToken = async (patientId: string) => {
    try {
      await queueService.addToQueue(patientId);
      setSearchResult(null);
      setSearchTerm('');
      fetchQueue();
    } catch (err) {
      alert('Error issuing token. Patient might already be in queue.');
    }
  };

  const handleStatusUpdate = async (id: string, status: string) => {
    try {
      await queueService.updateStatus(id, status);
      fetchQueue();
    } catch (err) {
      alert('Error updating status');
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'waiting': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'with doctor': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'completed': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Today's Token Queue</h1>
          <p className="text-slate-500">Live monitoring and management of patient flow</p>
        </div>
        <Button 
          variant="outline" 
          onClick={() => { setIsLoading(true); fetchQueue(); }}
          className="gap-2"
        >
          <RefreshCcw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh Live
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Token Issuance Card */}
        <Card className="lg:col-span-1 h-fit border-emerald-100 bg-emerald-50/30">
          <div className="p-6">
            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Plus className="h-5 w-5 text-emerald-600" />
              Issue New Token
            </h3>
            <form onSubmit={handlePatientSearch} className="space-y-4">
              <Input 
                placeholder="Patient phone number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                icon={<Search className="h-4 w-4" />}
                className="bg-white"
              />
              <Button type="submit" className="w-full" isLoading={isSearching}>Find Patient</Button>
            </form>

            {searchResult && (
              <div className="mt-6 p-4 bg-white rounded-xl border border-emerald-200 animate-in slide-in-from-top-2 duration-300">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold">
                    {searchResult.name[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">{searchResult.name}</p>
                    <p className="text-xs text-slate-500">{searchResult.phone}</p>
                  </div>
                </div>
                <Button 
                  className="w-full bg-emerald-600 hover:bg-emerald-700"
                  onClick={() => handleIssueToken(searchResult._id)}
                >
                  Issue Token
                </Button>
              </div>
            )}
          </div>
        </Card>

        {/* Live Queue Table */}
        <Card className="lg:col-span-2 overflow-hidden border-slate-200">
          <CardContent className="p-0">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr className="text-slate-500 text-xs uppercase tracking-wider font-semibold">
                  <th className="px-6 py-4">Token</th>
                  <th className="px-6 py-4">Patient</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Update Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  Array(5).fill(0).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={4} className="px-6 py-6 h-16 bg-white"></td>
                    </tr>
                  ))
                ) : queue.length > 0 ? (
                  queue.map((entry: any) => (
                    <tr key={entry._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex flex-col items-center justify-center shadow-md">
                          <span className="text-[10px] uppercase font-bold opacity-70">Token</span>
                          <span className="text-lg font-bold leading-none">{entry.tokenNumber}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-bold text-slate-900">{entry.patientId?.name}</p>
                        <p className="text-xs text-slate-500">{entry.patientId?.phone}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${getStatusStyle(entry.status)}`}>
                          {entry.status === 'waiting' && <Timer className="h-3 w-3" />}
                          {entry.status === 'with doctor' && <UserCircle2 className="h-3 w-3" />}
                          {entry.status === 'completed' && <CheckCircle2 className="h-3 w-3" />}
                          <span className="capitalize">{entry.status}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          {entry.status === 'waiting' && (
                            <Button 
                              size="sm" 
                              className="bg-blue-600 hover:bg-blue-700 h-8"
                              onClick={() => handleStatusUpdate(entry._id, 'with doctor')}
                            >
                              Call In
                            </Button>
                          )}
                          {entry.status === 'with doctor' && (
                            <Button 
                              size="sm" 
                              className="bg-emerald-600 hover:bg-emerald-700 h-8"
                              onClick={() => handleStatusUpdate(entry._id, 'completed')}
                            >
                              Complete
                            </Button>
                          )}
                          {entry.status === 'completed' && (
                            <div className="flex items-center justify-end gap-3">
                              <span className="text-emerald-600 font-bold text-xs flex items-center gap-1">
                                <CheckCircle2 className="h-4 w-4" /> Finished
                              </span>
                              <Button 
                                size="sm" 
                                variant="outline"
                                className="h-8 border-emerald-200 text-emerald-600 hover:bg-emerald-50 gap-1 font-bold"
                                onClick={() => navigate(`/billing?patientId=${entry.patientId?._id}`)}
                              >
                                <CreditCard className="h-3 w-3" /> Bill
                              </Button>
                            </div>
                          )}

                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-20 text-center text-slate-400">
                      <Clock className="h-12 w-12 mx-auto mb-4 opacity-20" />
                      <p>Queue is empty for today</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
