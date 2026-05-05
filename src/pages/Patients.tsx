import React, { useEffect, useState } from 'react';
import { 
  Search, 
  UserPlus, 
  MoreVertical, 
  Phone, 
  MapPin, 
  Calendar,
  History,
  X,
  Users
} from 'lucide-react';
import { patientService } from '../services/patientService';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Card, CardContent } from '../components/Card';
import { useToast } from '../components/Toast';

export const Patients = () => {
  const { showToast, ToastContainer } = useToast();
  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isRegistering, setIsRegistering] = useState(false);
  // Modal & Selection State
  const [showAddModal, setShowAddModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    age: '',
    gender: 'male',
    address: ''
  });

  const fetchPatients = async () => {
    try {
      const data = await patientService.getPatients();
      setPatients(data.data || []);
    } catch (err) {
      console.error('Error fetching patients:', err);
      showToast('Failed to fetch patients', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm) {
      fetchPatients();
      return;
    }
    try {
      setIsLoading(true);
      const data = await patientService.searchPatient(searchTerm);
      setPatients([data.data]);
    } catch (err) {
      setPatients([]);
      showToast('Patient not found', 'info');
    } finally {
      setIsLoading(false);
    }
  };

  const validateForm = () => {
    if (!formData.name.trim()) return 'Name is required';
    if (!/^\d{10}$/.test(formData.phone)) return 'Phone number must be exactly 10 digits';
    if (parseInt(formData.age) <= 0 || isNaN(parseInt(formData.age))) return 'Age must be a positive number';
    if (!formData.address.trim()) return 'Address is required';
    return null;
  };

  const handleAddPatient = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const error = validateForm();
    if (error) {
      showToast(error, 'error');
      return;
    }

    setIsRegistering(true);
    try {
      if (isEditing && selectedPatient) {
        await patientService.updatePatient(selectedPatient._id, formData);
        showToast('Patient updated successfully', 'success');
      } else {
        await patientService.createPatient(formData);
        showToast('Patient registered successfully', 'success');
      }
      setShowAddModal(false);
      resetForm();
      fetchPatients();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Error saving patient data.', 'error');
    } finally {
      setIsRegistering(false);
    }
  };

  const resetForm = () => {
    setFormData({ name: '', phone: '', age: '', gender: 'male', address: '' });
    setIsEditing(false);
    setSelectedPatient(null);
  };

  const handleEditClick = (patient: any) => {
    setIsEditing(true);
    setSelectedPatient(patient);
    setFormData({
      name: patient.name,
      phone: patient.phone,
      age: patient.age.toString(),
      gender: patient.gender,
      address: patient.address
    });
    setShowAddModal(true);
  };

  const handleHistoryClick = (patient: any) => {
    setSelectedPatient(patient);
    setShowHistoryModal(true);
  };

  return (
    <div className="space-y-6">
      <ToastContainer />
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Patient Management</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">Manage and view patient records</p>
        </div>
        <Button 
          onClick={() => { resetForm(); setShowAddModal(true); }}
          className="flex items-center gap-2 shadow-lg shadow-emerald-200 dark:shadow-none h-10 text-xs font-bold"
        >
          <UserPlus className="h-4 w-4" />
          Add New Patient
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <form onSubmit={handleSearch} className="flex-1 flex gap-2">
          <Input 
            placeholder="Search by phone number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon={<Search className="h-4 w-4" />}
            className="bg-white dark:bg-slate-900"
          />
          <Button type="submit" variant="outline" className="h-11">Search</Button>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {isLoading ? (
          Array(6).fill(0).map((_, i) => (
            <Card key={i} className="animate-pulse h-48 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800" />
          ))
        ) : patients.length > 0 ? (
          patients.map((patient: any) => (
            <Card key={patient._id} className="hover:shadow-md transition-shadow group border-slate-200 dark:border-slate-800 dark:bg-slate-900/50">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-700 dark:text-emerald-400 font-black text-xl border-2 border-emerald-50 dark:border-emerald-900/20 shadow-sm">
                      {patient.name[0].toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors leading-tight">{patient.name}</h3>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase mt-1">ID: {patient._id.slice(-6).toUpperCase()}</p>
                    </div>
                  </div>
                  <button className="text-slate-300 dark:text-slate-600 hover:text-slate-600 dark:hover:text-slate-400 transition-colors">
                    <MoreVertical className="h-5 w-5" />
                  </button>
                </div>

                <div className="space-y-3 mt-6">
                  <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                    <Phone className="h-4 w-4 text-emerald-500 dark:text-emerald-400 opacity-70" />
                    <span className="font-medium">{patient.phone}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                    <Calendar className="h-4 w-4 text-emerald-500 dark:text-emerald-400 opacity-70" />
                    <span className="font-medium">{patient.age} years • {patient.gender}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                    <MapPin className="h-4 w-4 text-emerald-500 dark:text-emerald-400 opacity-70" />
                    <span className="truncate font-medium">{patient.address}</span>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-50 dark:border-slate-800 flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1 gap-2 text-[11px] font-bold h-9"
                    onClick={() => handleHistoryClick(patient)}
                  >
                    <History className="h-3.5 w-3.5" />
                    History
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1 text-[11px] font-bold h-9"
                    onClick={() => handleEditClick(patient)}
                  >
                    Edit
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full py-20 text-center bg-white dark:bg-slate-900/50 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-800">
            <Users className="h-12 w-12 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
            <p className="text-slate-500 dark:text-slate-400">No patients found</p>
            <Button 
              variant="ghost" 
              onClick={() => { setSearchTerm(''); fetchPatients(); }}
              className="mt-2"
            >
              Clear Search
            </Button>
          </div>
        )}
      </div>

      {/* Add/Edit Patient Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-lg shadow-2xl animate-in fade-in zoom-in duration-200 dark:border-slate-800 dark:bg-slate-900">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-emerald-600/20 flex items-center justify-between bg-emerald-600 text-white rounded-t-xl">
              <h3 className="font-bold">{isEditing ? 'Edit Patient Record' : 'Register New Patient'}</h3>
              <button onClick={() => setShowAddModal(false)} className="hover:rotate-90 transition-transform">
                <X className="h-5 w-5" />
              </button>
            </div>
            <CardContent className="p-6">
              <form onSubmit={handleAddPatient} className="space-y-4">
                <Input 
                  label="Full Name" 
                  placeholder="e.g. John Doe"
                  required 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="bg-white dark:bg-slate-800 dark:border-slate-700"
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input 
                    label="Phone Number" 
                    placeholder="e.g. 0771234567"
                    required 
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="bg-white dark:bg-slate-800 dark:border-slate-700"
                  />
                  <Input 
                    label="Age" 
                    type="number" 
                    placeholder="e.g. 25"
                    required 
                    value={formData.age}
                    onChange={(e) => setFormData({...formData, age: e.target.value})}
                    className="bg-white dark:bg-slate-800 dark:border-slate-700"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Gender</label>
                  <div className="flex gap-6">
                    {['male', 'female', 'other'].map((g) => (
                      <label key={g} className="flex items-center gap-2 cursor-pointer group">
                        <input 
                          type="radio" 
                          name="gender" 
                          value={g} 
                          checked={formData.gender === g}
                          onChange={(e) => setFormData({...formData, gender: e.target.value})}
                          className="w-4 h-4 text-emerald-600 focus:ring-emerald-500/20 dark:bg-slate-800 dark:border-slate-700"
                        />
                        <span className="text-sm capitalize text-slate-600 dark:text-slate-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors font-medium">{g}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <Input 
                  label="Address" 
                  placeholder="e.g. 123 Main St, Colombo"
                  required 
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  className="bg-white dark:bg-slate-800 dark:border-slate-700"
                />
                <div className="flex gap-3 pt-4">
                  <Button type="button" variant="ghost" className="flex-1 dark:text-slate-400 dark:hover:bg-slate-800" onClick={() => setShowAddModal(false)}>Cancel</Button>
                  <Button type="submit" className="flex-1 shadow-lg shadow-emerald-200 dark:shadow-none" isLoading={isRegistering}>
                    {isEditing ? 'Update Records' : 'Register Patient'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* History Modal */}
      {showHistoryModal && selectedPatient && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl shadow-2xl animate-in fade-in zoom-in duration-200 dark:border-slate-800 dark:bg-slate-900">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-800 dark:bg-slate-800 text-white rounded-t-xl">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/10 rounded-lg">
                  <History className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold">Medical History</h3>
                  <p className="text-[10px] uppercase tracking-widest opacity-60 font-bold mt-0.5">{selectedPatient.name}</p>
                </div>
              </div>
              <button onClick={() => setShowHistoryModal(false)} className="hover:rotate-90 transition-transform">
                <X className="h-5 w-5" />
              </button>
            </div>
            <CardContent className="p-6">
              <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                {selectedPatient.medicalHistory && selectedPatient.medicalHistory.length > 0 ? (
                  selectedPatient.medicalHistory.map((h: any, i: number) => (
                    <div key={i} className="p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 relative overflow-hidden group hover:border-emerald-200 dark:hover:border-emerald-800 transition-colors">
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500" />
                      <div className="flex justify-between items-start mb-3">
                        <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest bg-white dark:bg-slate-800 px-2 py-1 rounded shadow-sm border dark:border-slate-700">
                          {new Date(h.date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                        </span>
                        <span className="text-[9px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-1 rounded-full uppercase tracking-tighter">
                          Clinical Visit
                        </span>
                      </div>
                      <p className="text-sm text-slate-800 dark:text-slate-200 font-medium leading-relaxed">{h.notes}</p>
                      <div className="mt-4 pt-4 border-t border-slate-200/50 dark:border-slate-700/50 flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[10px] font-black text-slate-600 dark:text-slate-400">
                          DR
                        </div>
                        <span className="text-xs text-slate-500 dark:text-slate-400 font-bold italic">{h.doctor}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-16 text-center text-slate-400 dark:text-slate-600 italic text-sm">
                    <History className="h-12 w-12 mx-auto mb-4 opacity-10" />
                    No medical history records available for this patient.
                  </div>
                )}
              </div>
              <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                <Button onClick={() => setShowHistoryModal(false)} variant="outline" className="font-bold">Close History</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Add/Edit Patient Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-lg shadow-2xl animate-in fade-in zoom-in duration-200 dark:border-slate-800">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-emerald-600/20 flex items-center justify-between bg-emerald-600 text-white">
              <h3 className="font-bold">{isEditing ? 'Edit Patient Record' : 'Register New Patient'}</h3>
              <button onClick={() => setShowAddModal(false)} className="hover:rotate-90 transition-transform">
                <X className="h-5 w-5" />
              </button>
            </div>
            <CardContent className="p-6">
              <form onSubmit={handleAddPatient} className="space-y-4">
                <Input 
                  label="Full Name" 
                  placeholder="e.g. John Doe"
                  required 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input 
                    label="Phone Number" 
                    placeholder="e.g. 0771234567"
                    required 
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  />
                  <Input 
                    label="Age" 
                    type="number" 
                    placeholder="e.g. 25"
                    required 
                    value={formData.age}
                    onChange={(e) => setFormData({...formData, age: e.target.value})}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Gender</label>
                  <div className="flex gap-4">
                    {['male', 'female', 'other'].map((g) => (
                      <label key={g} className="flex items-center gap-2 cursor-pointer group">
                        <input 
                          type="radio" 
                          name="gender" 
                          value={g} 
                          checked={formData.gender === g}
                          onChange={(e) => setFormData({...formData, gender: e.target.value})}
                          className="text-emerald-600 focus:ring-emerald-500 dark:bg-slate-800 dark:border-slate-700"
                        />
                        <span className="text-sm capitalize dark:text-slate-400 group-hover:text-emerald-600 transition-colors">{g}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <Input 
                  label="Address" 
                  placeholder="e.g. 123 Main St, Colombo"
                  required 
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                />
                <div className="flex gap-3 pt-4">
                  <Button type="button" variant="ghost" className="flex-1" onClick={() => setShowAddModal(false)}>Cancel</Button>
                  <Button type="submit" className="flex-1" isLoading={isRegistering}>
                    {isEditing ? 'Update Records' : 'Register Patient'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* History Modal */}
      {showHistoryModal && selectedPatient && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-800 text-white">
              <div className="flex items-center gap-3">
                <History className="h-5 w-5" />
                <div>
                  <h3 className="font-bold">Medical History</h3>
                  <p className="text-[10px] uppercase tracking-widest opacity-60">{selectedPatient.name}</p>
                </div>
              </div>
              <button onClick={() => setShowHistoryModal(false)} className="hover:rotate-90 transition-transform">
                <X className="h-5 w-5" />
              </button>
            </div>
            <CardContent className="p-6">
              <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                {selectedPatient.medicalHistory && selectedPatient.medicalHistory.length > 0 ? (
                  selectedPatient.medicalHistory.map((h: any, i: number) => (
                    <div key={i} className="p-4 bg-slate-50 rounded-xl border border-slate-100 relative overflow-hidden group">
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500" />
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                          {new Date(h.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                        </span>
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full uppercase">
                          Visit Record
                        </span>
                      </div>
                      <p className="text-sm text-slate-800 font-medium leading-relaxed">{h.notes}</p>
                      <div className="mt-3 pt-3 border-t border-slate-200/50 flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600">
                          DR
                        </div>
                        <span className="text-xs text-slate-500 font-semibold">{h.doctor}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-12 text-center text-slate-400 italic">
                    No medical history records available for this patient.
                  </div>
                )}
              </div>
              <div className="mt-6 pt-6 border-t border-slate-100 flex justify-end">
                <Button onClick={() => setShowHistoryModal(false)}>Close History</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};


