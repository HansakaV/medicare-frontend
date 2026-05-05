import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  Send, 
  Users, 
  Search,
  CheckCircle2,
  AlertCircle,
  History,
  Lock,
  Unlock,
  Settings,
  X
} from 'lucide-react';
import { smsService } from '../services/smsService';
import { patientService } from '../services/patientService';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Card, CardContent, CardHeader } from '../components/Card';
import { useToast } from '../components/Toast';

export const SMS = () => {
  const { showToast, ToastContainer } = useToast();
  const [recipientType, setRecipientType] = useState<'individual' | 'bulk'>('individual');
  const [phoneSearch, setPhoneSearch] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [showConfig, setShowConfig] = useState(false);

  // Gateway Credentials State
  const [credentials, setCredentials] = useState({
    username: localStorage.getItem('sms_username') || '',
    password: localStorage.getItem('sms_password') || ''
  });
  const [isConnected, setIsConnected] = useState(!!(credentials.username && credentials.password));
  const [logs, setLogs] = useState<any[]>([]);

  const fetchLogs = async () => {
    try {
      const data = await smsService.getLogs();
      setLogs(data.data || []);
    } catch (err) {
      console.error('Failed to fetch SMS logs:', err);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return date.toLocaleDateString();
  };

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    if (credentials.username && credentials.password) {
      localStorage.setItem('sms_username', credentials.username);
      localStorage.setItem('sms_password', credentials.password);
      setIsConnected(true);
      setShowConfig(false);
      showToast('SMS Gateway configured successfully', 'success');
    }
  };

  const handleResetConfig = () => {
    localStorage.removeItem('sms_username');
    localStorage.removeItem('sms_password');
    setCredentials({ username: '', password: '' });
    setIsConnected(false);
    showToast('SMS Gateway disconnected', 'info');
  };

  const findPatient = async () => {
    if (!phoneSearch) return;
    try {
      const data = await patientService.searchPatient(phoneSearch);
      setSelectedPatient(data.data);
    } catch (err) {
      showToast('Patient not found', 'error');
      setSelectedPatient(null);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConnected) {
      setShowConfig(true);
      return;
    }
    if (!message) return;
    
    let numbers: string[] = [];
    if (recipientType === 'individual') {
      if (!selectedPatient) return showToast('Please select a patient', 'error');
      numbers = [selectedPatient.phone];
    } else {
      try {
        const allPatients = await patientService.getPatients(1, 1000);
        numbers = allPatients.data.map((p: any) => p.phone);
      } catch (err) {
        showToast('Failed to fetch patients for bulk SMS', 'error');
        return;
      }
    }

    setIsSending(true);
    try {
      await smsService.sendSms({ 
        numbers, 
        message,
        username: credentials.username,
        password: credentials.password
      });
      showToast(`Successfully sent to ${numbers.length} recipient(s).`, 'success');
      setMessage('');
      if (recipientType === 'individual') setSelectedPatient(null);
      fetchLogs();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to send SMS', 'error');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <ToastContainer />
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-2xl">
            <MessageSquare className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">SMS Notification Center</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Communicate with your patients instantly</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider ${
            isConnected ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
          }`}>
            {isConnected ? <Unlock className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
            {isConnected ? 'Gateway Active' : 'Gateway Locked'}
          </div>
          <Button variant="outline" size="sm" onClick={() => setShowConfig(true)} className="gap-2">
            <Settings className="h-4 w-4" />
            Config
          </Button>
        </div>
      </div>

      {!isConnected && (
        <Card className="bg-orange-50 dark:bg-orange-950/10 border-orange-200 dark:border-orange-900/50 border-2 border-dashed">
          <CardContent className="p-8 text-center space-y-4">
            <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-500 rounded-full flex items-center justify-center mx-auto">
              <AlertCircle className="h-8 w-8" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">SMS Service Disabled</h3>
              <p className="text-slate-600 dark:text-slate-400 max-w-md mx-auto">To enable SMS notifications, you must first configure your Dialog eSMS gateway credentials.</p>
            </div>
            <Button onClick={() => setShowConfig(true)} className="gap-2 shadow-lg shadow-emerald-200 dark:shadow-none">
              <Unlock className="h-4 w-4" />
              Configure Gateway Now
            </Button>
          </CardContent>
        </Card>
      )}

      <div className={`grid grid-cols-1 md:grid-cols-3 gap-8 transition-opacity duration-300 ${!isConnected ? 'opacity-50 pointer-events-none' : ''}`}>
        {/* Recipient Selection */}
        <div className="md:col-span-1 space-y-6">
          <Card className={`${recipientType === 'individual' ? 'border-emerald-500 ring-2 ring-emerald-500/10' : 'dark:border-slate-800'} dark:bg-slate-900`}>
            <button 
              className="w-full p-6 text-left"
              onClick={() => setRecipientType('individual')}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className={`p-2 rounded-lg ${recipientType === 'individual' ? 'bg-emerald-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500'}`}>
                  <Users className="h-5 w-5" />
                </div>
                <span className="font-bold text-slate-900 dark:text-white">Individual</span>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-snug">Send message to a specific patient</p>
            </button>
          </Card>

          <Card className={`${recipientType === 'bulk' ? 'border-emerald-500 ring-2 ring-emerald-500/10' : 'dark:border-slate-800'} dark:bg-slate-900`}>
            <button 
              className="w-full p-6 text-left"
              onClick={() => setRecipientType('bulk')}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className={`p-2 rounded-lg ${recipientType === 'bulk' ? 'bg-emerald-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500'}`}>
                  <MessageSquare className="h-5 w-5" />
                </div>
                <span className="font-bold text-slate-900 dark:text-white">Bulk Broadcast</span>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-snug">Send message to ALL registered patients</p>
            </button>
          </Card>

          <Card className="border-slate-100 dark:border-slate-800 dark:bg-slate-900 shadow-sm">
            <CardHeader title="Templates" subtitle="Quick select" />
            <CardContent className="space-y-2 p-4">
              {[
                "Holiday Notice",
                "Clinic Closed Today",
                "New Doctor Arrival",
                "System Maintenance"
              ].map((tmp) => (
                <button 
                  key={tmp}
                  onClick={() => setMessage(`Medicare Center: ${tmp}. Sorry for any inconvenience.`)}
                  className="w-full px-3 py-2 text-left text-xs font-bold bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-white hover:bg-emerald-50 dark:hover:bg-white/10 rounded-lg transition-all border border-slate-200 dark:border-white/5"
                >
                  {tmp}
                </button>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Message Composer */}
        <div className="md:col-span-2">
          <Card className="dark:border-slate-800">
            <CardHeader title="Composer" subtitle="Write your message below" />
            <CardContent className="p-6">
              <form onSubmit={handleSend} className="space-y-6">
                {recipientType === 'individual' && (
                  <div className="space-y-4 pb-6 border-b border-slate-100 dark:border-slate-800">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Find Patient</label>
                    <div className="flex gap-2">
                      <Input 
                        placeholder="Search by phone..." 
                        value={phoneSearch}
                        onChange={(e) => setPhoneSearch(e.target.value)}
                        icon={<Search className="h-4 w-4" />}
                        className="bg-white dark:bg-slate-900"
                      />
                      <Button type="button" onClick={findPatient}>Find</Button>
                    </div>
                    {selectedPatient && (
                      <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-800 rounded-xl flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-500" />
                          <div>
                            <p className="text-sm font-black text-slate-900 dark:text-white">{selectedPatient.name}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">{selectedPatient.phone}</p>
                          </div>
                        </div>
                        <button onClick={() => setSelectedPatient(null)} className="text-slate-400 hover:text-red-500 transition-colors">
                          <X className="h-5 w-5" />
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {recipientType === 'bulk' && (
                  <div className="p-4 bg-orange-50 dark:bg-orange-950/20 border border-orange-100 dark:border-orange-800 rounded-xl flex items-center gap-3 mb-6">
                    <AlertCircle className="h-5 w-5 text-orange-600 dark:text-orange-500" />
                    <p className="text-sm text-orange-700 dark:text-orange-400 font-bold">Warning: This will send an SMS to all patients in the system.</p>
                  </div>
                )}

                <div className="space-y-2">
                  <div className="flex justify-between items-end">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Message Content</label>
                    <span className={`text-[10px] font-black uppercase tracking-wider ${message.length > 160 ? 'text-red-500' : 'text-slate-400 dark:text-slate-500'}`}>
                      {message.length} / 160 characters
                    </span>
                  </div>
                  <textarea
                    rows={6}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all placeholder:text-slate-300 dark:placeholder:text-slate-600"
                    placeholder="Enter message here..."
                    required
                  />
                </div>

                <div className="flex gap-3">
                  <Button 
                    type="submit" 
                    className="flex-1 h-12 text-lg font-black gap-2 shadow-lg shadow-emerald-200 dark:shadow-none"
                    isLoading={isSending}
                    disabled={recipientType === 'individual' && !selectedPatient}
                  >
                    <Send className="h-5 w-5" />
                    Send Message
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <Card className="mt-8 dark:border-slate-800">
            <CardHeader 
              title="Recent Activity" 
              subtitle="Latest outgoing messages" 
              action={<Button variant="ghost" size="sm" className="gap-2 text-blue-600 dark:text-blue-400"><History className="h-4 w-4" /> Logs</Button>}
            />
            <CardContent className="p-0">
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {logs.length > 0 ? (
                  logs.map((log, i) => (
                    <div key={log._id || i} className="flex justify-between items-center p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <div className="flex-1 min-w-0 mr-4">
                        <p className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                          {log.numbers.length === 1 ? log.numbers[0] : `${log.numbers.length} Recipients`}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">{log.message}</p>
                      </div>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider whitespace-nowrap bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded">
                        {formatTime(log.sentAt)}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="py-12 text-center text-slate-400 dark:text-slate-600 text-sm italic">
                    No recent SMS activity
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Gateway Config Modal */}
      {showConfig && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-emerald-600 text-white">
              <div className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                <h3 className="font-bold">Gateway Configuration</h3>
              </div>
              <button onClick={() => setShowConfig(false)} className="hover:rotate-90 transition-transform">
                <X className="h-5 w-5" />
              </button>
            </div>
            <CardContent className="p-6">
              <form onSubmit={handleSaveConfig} className="space-y-4">
                <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg text-xs text-blue-700 leading-relaxed mb-4">
                  Enter your Dialog eSMS API credentials. These are required to authenticate with the SMS gateway.
                </div>
                <Input 
                  label="ESMS Username" 
                  placeholder="e.g. clinic_admin"
                  required 
                  value={credentials.username}
                  onChange={(e) => setCredentials({...credentials, username: e.target.value})}
                />
                <Input 
                  label="ESMS Password" 
                  type="password"
                  placeholder="••••••••"
                  required 
                  value={credentials.password}
                  onChange={(e) => setCredentials({...credentials, password: e.target.value})}
                />
                <div className="flex gap-3 pt-4">
                  {isConnected && (
                    <Button type="button" variant="danger" className="flex-1" onClick={handleResetConfig}>Disconnect</Button>
                  )}
                  <Button type="submit" className="flex-1">Save & Activate</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

