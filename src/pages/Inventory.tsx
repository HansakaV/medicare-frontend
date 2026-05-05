import React, { useEffect, useState } from 'react';
import { 
  Pill, 
  Plus, 
  Search, 
  AlertTriangle, 
  TrendingDown, 
  MoreVertical,
  Package,
  Calendar
} from 'lucide-react';
import { medicineService } from '../services/medicineService';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Card, CardContent } from '../components/Card';

export const Inventory = () => {
  const [medicines, setMedicines] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    stock: '',
    price: '',
    expiryDate: ''
  });

  const fetchMedicines = async () => {
    try {
      const data = await medicineService.getMedicines();
      setMedicines(data.data || []);
    } catch (err) {
      console.error('Error fetching medicines:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMedicines();
  }, []);

  const handleAddMedicine = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await medicineService.addMedicine({
        ...formData,
        stock: Number(formData.stock),
        price: Number(formData.price)
      });
      setShowAddModal(false);
      setFormData({ name: '', stock: '', price: '', expiryDate: '' });
      fetchMedicines();
    } catch (err) {
      alert('Error adding medicine');
    }
  };

  const filteredMedicines = medicines.filter((m: any) => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStockStatus = (stock: number) => {
    if (stock === 0) return { label: 'Out of Stock', class: 'bg-red-100 text-red-700 border-red-200' };
    if (stock <= 10) return { label: 'Low Stock', class: 'bg-orange-100 text-orange-700 border-orange-200' };
    return { label: 'In Stock', class: 'bg-emerald-100 text-emerald-700 border-emerald-200' };
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Medicine Inventory</h1>
          <p className="text-slate-500">Track and manage medical supplies</p>
        </div>
        <Button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add New Medicine
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-emerald-600 text-white border-0 shadow-lg shadow-emerald-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-100 text-sm font-medium">Total Items</p>
                <p className="text-3xl font-bold mt-1">{medicines.length}</p>
              </div>
              <div className="p-3 bg-white/20 rounded-xl">
                <Package className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-orange-500 text-white border-0 shadow-lg shadow-orange-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm font-medium">Low Stock Alerts</p>
                <p className="text-3xl font-bold mt-1">{medicines.filter((m: any) => m.stock <= 10).length}</p>
              </div>
              <div className="p-3 bg-white/20 rounded-xl">
                <AlertTriangle className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 text-white border-0 shadow-lg shadow-slate-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm font-medium">Stock Value</p>
                <p className="text-3xl font-bold mt-1">
                  LKR {medicines.reduce((acc: number, m: any) => acc + (m.price * m.stock), 0).toLocaleString()}
                </p>
              </div>
              <div className="p-3 bg-white/20 rounded-xl">
                <TrendingDown className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-slate-200">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50">
          <Input 
            placeholder="Search medicine name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon={<Search className="h-4 w-4" />}
            className="max-w-md bg-white"
          />
        </div>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-slate-500 text-xs uppercase tracking-wider font-semibold border-b border-slate-100">
                  <th className="px-6 py-4">Medicine Name</th>
                  <th className="px-6 py-4">Current Stock</th>
                  <th className="px-6 py-4">Price (LKR)</th>
                  <th className="px-6 py-4">Expiry Date</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  Array(5).fill(0).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={5} className="px-6 py-4 h-16"></td>
                    </tr>
                  ))
                ) : filteredMedicines.length > 0 ? (
                  filteredMedicines.map((medicine: any) => {
                    const status = getStockStatus(medicine.stock);
                    return (
                      <tr key={medicine._id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                              <Pill className="h-5 w-5" />
                            </div>
                            <span className="font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
                              {medicine.name}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-1">
                            <span className="font-bold text-slate-900">{medicine.stock} units</span>
                            <span className={`w-fit px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase ${status.class}`}>
                              {status.label}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-semibold text-slate-700">
                          {medicine.price.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 text-slate-600 text-sm">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-3.5 w-3.5 opacity-50" />
                            {new Date(medicine.expiryDate).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-400">
                            <MoreVertical className="h-5 w-5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-20 text-center text-slate-400">
                      No medicines found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Add Medicine Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-lg shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-emerald-600 text-white">
              <h3 className="font-bold text-lg">Add to Inventory</h3>
              <button onClick={() => setShowAddModal(false)} className="hover:rotate-90 transition-transform">
                <Search className="h-5 w-5 rotate-45" />
              </button>
            </div>
            <CardContent className="p-6">
              <form onSubmit={handleAddMedicine} className="space-y-4">
                <Input 
                  label="Medicine Name" 
                  required 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input 
                    label="Stock Quantity" 
                    type="number"
                    required 
                    value={formData.stock}
                    onChange={(e) => setFormData({...formData, stock: e.target.value})}
                  />
                  <Input 
                    label="Price per Unit (LKR)" 
                    type="number"
                    step="0.01"
                    required 
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                  />
                </div>
                <Input 
                  label="Expiry Date" 
                  type="date"
                  required 
                  value={formData.expiryDate}
                  onChange={(e) => setFormData({...formData, expiryDate: e.target.value})}
                />
                <div className="flex gap-3 pt-4">
                  <Button type="button" variant="ghost" className="flex-1" onClick={() => setShowAddModal(false)}>Cancel</Button>
                  <Button type="submit" className="flex-1">Add Medicine</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
