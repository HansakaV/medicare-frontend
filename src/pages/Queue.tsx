import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Clock,
  Search,
  Timer,
  RefreshCcw,
  Plus,
  CreditCard,
} from "lucide-react";
import { queueService } from "../services/queueService";
import { patientService } from "../services/patientService";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { Card, CardContent } from "../components/Card";
import { useToast } from "../components/Toast";

export const Queue = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [queue, setQueue] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResult, setSearchResult] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(false);

  const fetchQueue = async () => {
    try {
      const data = await queueService.getQueue();
      setQueue(data.data || []);
    } catch (err) {
      console.error("Error fetching queue:", err);
      showToast("Error loading queue", "error");
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
      showToast("Patient found", "success");
    } catch (err) {
      showToast("Patient not found. Please register first.", "warning");
      setSearchResult(null);
    } finally {
      setIsSearching(false);
    }
  };

  const handleIssueToken = async (patientId: string) => {
    try {
      await queueService.addToQueue(patientId);
      showToast("Token issued successfully", "success");
      setSearchResult(null);
      setSearchTerm("");
      fetchQueue();
    } catch (err: any) {
      showToast(err.response?.data?.message || "Error issuing token", "error");
    }
  };

  const handleStatusUpdate = async (id: string, status: string) => {
    try {
      await queueService.updateStatus(id, status);
      showToast(`Status updated to ${status}`, "info");
      fetchQueue();
    } catch (err) {
      showToast("Error updating status", "error");
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "waiting":
        return "bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800";
      case "with doctor":
        return "bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800";
      case "completed":
        return "bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800";
      default:
        return "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-400 border-slate-200 dark:border-slate-700";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">
            Today's Token Queue
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Live monitoring and management of patient flow
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => {
            setIsLoading(true);
            fetchQueue();
          }}
          className="gap-2 h-9"
        >
          <RefreshCcw
            className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`}
          />
          <span className="text-xs font-bold">Refresh</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left: Issue Token Section */}
        <div className="space-y-6">
          <Card className="border-emerald-100 dark:border-emerald-800/30 bg-emerald-50/20 dark:bg-emerald-950/10">
            <div className="p-5 border-b border-emerald-100 dark:border-emerald-800/30">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Plus className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                Issue New Token
              </h3>
            </div>
            <CardContent className="p-5">
              <form onSubmit={handlePatientSearch} className="space-y-4">
                <Input
                  placeholder="Enter phone number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  icon={<Search className="h-4 w-4" />}
                />
                <Button
                  type="submit"
                  className="w-full h-10 text-xs font-bold"
                  isLoading={isSearching}
                  variant="secondary"
                >
                  Find Patient
                </Button>
              </form>

              {searchResult && (
                <div className="mt-5 p-4 bg-white dark:bg-slate-800 rounded-xl border border-emerald-200 dark:border-emerald-800/50 animate-in fade-in slide-in-from-top-4 duration-300">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-700 dark:text-emerald-400 font-bold">
                      {searchResult.name[0]}
                    </div>
                    <div>
                      <p className="font-bold text-sm text-slate-900 dark:text-white">
                        {searchResult.name}
                      </p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">
                        {searchResult.phone}
                      </p>
                    </div>
                  </div>
                  <Button
                    className="w-full h-10 bg-emerald-600 hover:bg-emerald-700 text-xs font-bold"
                    onClick={() => handleIssueToken(searchResult._id)}
                  >
                    Generate Token
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-4">
                Queue Summary
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                  <span className="text-xs text-slate-600 dark:text-slate-400">
                    Total Waiting
                  </span>
                  <span className="font-bold text-sm text-slate-900 dark:text-white">
                    {queue.filter((q: any) => q.status === "waiting").length}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                  <span className="text-xs text-slate-600 dark:text-slate-400">
                    In Consultation
                  </span>
                  <span className="font-bold text-sm text-slate-900 dark:text-white">
                    {
                      queue.filter((q: any) => q.status === "with doctor")
                        .length
                    }
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                  <span className="text-xs text-slate-600 dark:text-slate-400">
                    Completed Today
                  </span>
                  <span className="font-bold text-sm text-slate-900 dark:text-white">
                    {queue.filter((q: any) => q.status === "completed").length}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: Live Queue Table */}
        <div className="xl:col-span-2">
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
                      <th className="px-6 py-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Token
                      </th>
                      <th className="px-6 py-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Patient Name
                      </th>
                      <th className="px-6 py-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {isLoading ? (
                      Array(5)
                        .fill(0)
                        .map((_, i) => (
                          <tr key={i} className="animate-pulse">
                            <td colSpan={4} className="px-6 py-5 h-14"></td>
                          </tr>
                        ))
                    ) : queue.length > 0 ? (
                      queue.map((entry: any) => (
                        <tr
                          key={entry._id}
                          className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group"
                        >
                          <td className="px-6 py-3">
                            <div className="w-9 h-9 rounded-lg bg-slate-900 dark:bg-slate-800 text-white flex items-center justify-center font-black text-base shadow-sm">
                              {entry.tokenNumber}
                            </div>
                          </td>
                          <td className="px-6 py-3">
                            <p className="font-bold text-sm text-slate-900 dark:text-slate-100 group-hover:text-emerald-600 transition-colors">
                              {entry.patientId?.name}
                            </p>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                              <Timer className="h-2.5 w-2.5" />
                              {new Date(entry.createdAt).toLocaleTimeString(
                                [],
                                { hour: "2-digit", minute: "2-digit" },
                              )}
                            </p>
                          </td>
                          <td className="px-6 py-3">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase ${getStatusStyle(entry.status)}`}
                            >
                              {entry.status}
                            </span>
                          </td>
                          <td className="px-6 py-3 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {entry.status === "waiting" && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-8 text-[10px] font-bold border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                                  onClick={() =>
                                    handleStatusUpdate(entry._id, "with doctor")
                                  }
                                >
                                  Call Patient
                                </Button>
                              )}
                              {entry.status === "with doctor" && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-8 text-[10px] font-bold border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                                  onClick={() =>
                                    handleStatusUpdate(entry._id, "completed")
                                  }
                                >
                                  Complete
                                </Button>
                              )}
                              {entry.status === "completed" && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-8 text-[10px] font-bold text-slate-400 dark:text-slate-500 gap-1 hover:text-emerald-600 dark:hover:text-emerald-400"
                                  onClick={() =>
                                    navigate(
                                      `/billing?patientId=${entry.patientId?._id}`,
                                    )
                                  }
                                >
                                  <CreditCard className="h-3 w-3" />
                                  Bill
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={4}
                          className="px-6 py-16 text-center text-slate-400 dark:text-slate-500"
                        >
                          <Clock className="h-10 w-10 mx-auto mb-3 opacity-20" />
                          <p className="text-sm italic">
                            The queue is currently empty
                          </p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
