import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  ShoppingCart,
  Search,
  Trash2,
  Plus,
  Minus,
  Printer,
  CreditCard,
  User,
  History,
  Package,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { medicineService } from "../services/medicineService";
import { patientService } from "../services/patientService";
import { orderService } from "../services/orderService";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { Card, CardContent, CardHeader } from "../components/Card";
import { useToast } from "../components/Toast";
import Swal from "sweetalert2";

export const Billing = () => {
  const { showToast, ToastContainer } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const patientIdFromUrl = searchParams.get("patientId");

  const [medicines, setMedicines] = useState([]);
  const [medicineSearch, setMedicineSearch] = useState("");
  const [patientSearch, setPatientSearch] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [cart, setCart] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [recentOrders, setRecentOrders] = useState([]);
  const [isLoadingPatients, setIsLoadingPatients] = useState(false);

  useEffect(() => {
    fetchMedicines();
    fetchRecentOrders();
    if (patientIdFromUrl) {
      autoSelectPatient(patientIdFromUrl);
    }
  }, [patientIdFromUrl]);

  const fetchMedicines = async () => {
    const data = await medicineService.getMedicines();
    setMedicines(data.data || []);
  };

  const fetchRecentOrders = async () => {
    const data = await orderService.getOrders();
    setRecentOrders(data.data?.slice(0, 5) || []);
  };

  const autoSelectPatient = async (id: string) => {
    setIsLoadingPatients(true);
    try {
      const data = await patientService.getPatientById(id);
      setSelectedPatient(data.data);
      showToast(`Selected patient: ${data.data.name}`, "success");
    } catch (err) {
      showToast("Could not find patient from link", "error");
    } finally {
      setIsLoadingPatients(false);
    }
  };

  const findPatient = async () => {
    if (!patientSearch) return;
    setIsLoadingPatients(true);
    try {
      const data = await patientService.searchPatient(patientSearch);
      setSelectedPatient(data.data);
      showToast(`Patient found: ${data.data.name}`, "success");
    } catch (err) {
      showToast("Patient not found. Verify phone number.", "error");
      setSelectedPatient(null);
    } finally {
      setIsLoadingPatients(false);
    }
  };

  const addToCart = (medicine: any) => {
    const existing = cart.find((item) => item.medicineId === medicine._id);
    if (existing) {
      if (existing.quantity >= medicine.stock) {
        showToast("Maximum stock reached for this item", "warning");
        return;
      }
      setCart(
        cart.map((item) =>
          item.medicineId === medicine._id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        ),
      );
    } else {
      if (medicine.stock < 1) {
        showToast("Item out of stock", "error");
        return;
      }
      setCart([
        ...cart,
        {
          medicineId: medicine._id,
          name: medicine.name,
          price: medicine.price,
          quantity: 1,
          stock: medicine.stock,
        },
      ]);
      showToast(`${medicine.name} added to cart`, "info");
    }
  };

  const handleQuantityChange = (id: string, value: string) => {
    const qty = parseInt(value) || 0;
    setCart(
      cart.map((item) => {
        if (item.medicineId === id) {
          // Clamp between 0 and stock
          const validQty = Math.min(Math.max(0, qty), item.stock);
          return { ...item, quantity: validQty };
        }
        return item;
      }),
    );
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(
      cart.map((item) => {
        if (item.medicineId === id) {
          const newQty = item.quantity + delta;
          if (newQty > 0 && newQty <= item.stock) {
            return { ...item, quantity: newQty };
          }
        }
        return item;
      }),
    );
  };

  const removeFromCart = (id: string) => {
    setCart(cart.filter((item) => item.medicineId !== id));
  };

  const filteredMedicines = medicines.filter((m: any) =>
    m.name.toLowerCase().includes(medicineSearch.toLowerCase()),
  );

  const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const handleCheckout = async () => {
    if (!selectedPatient)
      return showToast("Please select a patient first", "warning");
    if (cart.length === 0)
      return showToast("Add medicines to the cart", "warning");

    setIsSubmitting(true);
    try {
      await orderService.createOrder({
        patientId: selectedPatient._id,
        items: cart.map((item) => ({
          medicineId: item.medicineId,
          quantity: item.quantity,
        })),
      });

      Swal.fire({
        title: "Success!",
        text: "Invoice generated successfully",
        icon: "success",
        confirmButtonColor: "#059669", // emerald-600
        confirmButtonText: "Print Invoice",
      });

      setCart([]);

      setSelectedPatient(null);
      setPatientSearch("");
      setSearchParams({}); // Clear URL params
      fetchMedicines();
      fetchRecentOrders();
    } catch (err: any) {
      showToast(
        err.response?.data?.message || "Error processing payment",
        "error",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
      <ToastContainer />

      {/* Main Content Area */}
      <div className="xl:col-span-3 space-y-8">
        <div className="flex items-center gap-4 mb-2">
          <div className="p-3 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-200 dark:shadow-blue-900/20">
            <CreditCard className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Billing & Invoicing
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              Manage patient payments and medicine distribution
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Patient Selection Card */}
          <Card
            className={`border-2 transition-all ${selectedPatient ? "border-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/10 dark:border-emerald-800" : "border-slate-100 dark:border-slate-800"}`}
          >
            <CardHeader
              title="Patient Selection"
              subtitle={
                selectedPatient
                  ? "Selected Patient Details"
                  : "Search to begin billing"
              }
            />
            <CardContent>
              {!selectedPatient ? (
                <div className="flex gap-2">
                  <Input
                    placeholder="Search by phone number..."
                    value={patientSearch}
                    onChange={(e) => setPatientSearch(e.target.value)}
                    icon={<Search className="h-4 w-4" />}
                    className="flex-1 bg-white dark:bg-slate-900"
                  />
                  <Button onClick={findPatient} isLoading={isLoadingPatients}>
                    Find
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-between group">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold text-xl shadow-lg shadow-emerald-200 dark:shadow-emerald-900/20">
                      {selectedPatient.name[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="font-black text-slate-900 dark:text-white text-lg leading-tight">
                        {selectedPatient.name}
                      </p>
                      <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1 font-medium mt-1">
                        <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                        {selectedPatient.phone}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedPatient(null);
                      setSearchParams({});
                    }}
                    className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 font-bold"
                  >
                    Change
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Search Medicine Card */}
          <Card className="dark:border-slate-800">
            <CardHeader
              title="Medicine Lookup"
              subtitle="Quick find items in stock"
            />
            <CardContent>
              <Input
                placeholder="Search medicine name..."
                value={medicineSearch}
                onChange={(e) => setMedicineSearch(e.target.value)}
                icon={<Package className="h-4 w-4" />}
                className="bg-slate-50 dark:bg-slate-900"
              />
            </CardContent>
          </Card>
        </div>

        {/* Medicines Grid */}
        <Card className="dark:border-slate-800">
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <h3 className="font-bold text-slate-900 dark:text-white">Inventory Items</h3>
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
              {filteredMedicines.length} Items Found
            </span>
          </div>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
              {filteredMedicines.map((medicine: any) => (
                <button
                  key={medicine._id}
                  onClick={() => addToCart(medicine)}
                  disabled={medicine.stock === 0}
                  className="relative p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-emerald-500 dark:hover:border-emerald-500 hover:shadow-xl hover:shadow-emerald-500/10 transition-all text-left group disabled:opacity-50"
                >
                  <p className="font-bold text-slate-900 dark:text-slate-100 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 truncate pr-6">
                    {medicine.name}
                  </p>
                  <div className="flex justify-between items-end mt-4">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-tighter">
                        Price
                      </p>
                      <p className="text-sm font-black text-slate-900 dark:text-white">
                        LKR {medicine.price.toFixed(2)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-tighter">
                        In Stock
                      </p>
                      <p
                        className={`text-xs font-bold ${medicine.stock <= 10 ? "text-orange-600 dark:text-orange-400" : "text-slate-900 dark:text-slate-300"}`}
                      >
                        {medicine.stock}
                      </p>
                    </div>
                  </div>
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Plus className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                </button>
              ))}
              {filteredMedicines.length === 0 && (
                <div className="col-span-full py-12 text-center text-slate-400 dark:text-slate-600">
                  <AlertCircle className="h-12 w-12 mx-auto mb-3 opacity-10" />
                  <p className="font-medium italic">
                    No medicines found matching "{medicineSearch}"
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Orders Table */}
        <Card className="border-0 shadow-none bg-slate-50/50 dark:bg-slate-900/50">
          <CardHeader
            title="Recent Activity"
            subtitle="Latest completed transactions"
            action={
              <Button variant="ghost" size="sm" className="gap-2 text-blue-600 dark:text-blue-400">
                <History className="h-4 w-4" /> View Logs
              </Button>
            }
          />
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-slate-400 dark:text-slate-500 text-[10px] uppercase tracking-widest font-black border-b dark:border-slate-800">
                    <th className="px-6 py-4">Transaction Date</th>
                    <th className="px-6 py-4">Patient Profile</th>
                    <th className="px-6 py-4 text-right">Invoice Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {recentOrders.map((order: any) => (
                    <tr key={order._id} className="group hover:bg-white/50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4 text-xs text-slate-500 dark:text-slate-400">
                        {new Date(order.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-bold text-slate-900 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {order.patientId?.name}
                        </p>
                        <p className="text-[9px] text-slate-400 dark:text-slate-500 uppercase font-mono mt-0.5">
                          {order._id}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-right font-black text-slate-900 dark:text-white">
                        LKR {order.totalAmount.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Checkout Sidebar */}
      <div className="xl:col-span-1">
        <div className="sticky top-8 space-y-6">
          <Card className="border-0 shadow-2xl shadow-slate-200 dark:shadow-slate-900/50 overflow-hidden ring-1 ring-slate-200/50 dark:ring-slate-800">
            <div className="p-6 bg-slate-900 dark:bg-slate-800 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/10 rounded-lg">
                    <ShoppingCart className="h-5 w-5" />
                  </div>
                  <h3 className="font-bold text-lg">Billing Cart</h3>
                </div>
                <span className="bg-emerald-500 text-white text-[10px] font-black px-2 py-1 rounded-full">
                  {cart.length} ITEMS
                </span>
              </div>
            </div>
            <CardContent className="p-0">
              <div className="max-h-[450px] overflow-y-auto divide-y divide-slate-50 dark:divide-slate-800 custom-scrollbar">
                {cart.length === 0 ? (
                  <div className="p-16 text-center text-slate-300 dark:text-slate-700">
                    <ShoppingCart className="h-16 w-16 mx-auto mb-4 opacity-5" />
                    <p className="text-sm font-medium">Cart is empty</p>
                    <p className="text-[10px] uppercase mt-1 tracking-widest">
                      Select medicines to begin
                    </p>
                  </div>
                ) : (
                  cart.map((item) => (
                    <div
                      key={item.medicineId}
                      className="p-4 bg-white dark:bg-slate-900 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <p className="font-bold text-slate-900 dark:text-slate-100 text-sm leading-tight">
                            {item.name}
                          </p>
                          <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase mt-1">
                            LKR {item.price.toFixed(2)} / unit
                          </p>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.medicineId)}
                          className="text-slate-300 dark:text-slate-600 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateQuantity(item.medicineId, -1)}
                            className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-emerald-600 dark:hover:text-emerald-400 hover:border-emerald-200 dark:hover:border-emerald-800 transition-all"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) =>
                              handleQuantityChange(
                                item.medicineId,
                                e.target.value,
                              )
                            }
                            className="w-12 h-8 text-center text-sm font-bold bg-slate-50 dark:bg-slate-800 border-0 rounded-lg focus:ring-2 focus:ring-emerald-500/20 dark:text-white"
                          />
                          <button
                            onClick={() => updateQuantity(item.medicineId, 1)}
                            className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-emerald-600 dark:hover:text-emerald-400 hover:border-emerald-200 dark:hover:border-emerald-800 transition-all"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                        <p className="font-black text-slate-900 dark:text-white">
                          LKR {(item.price * item.quantity).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="p-6 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500 dark:text-slate-400 font-medium">Subtotal</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      LKR {total.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between pt-3 border-t border-slate-200 dark:border-slate-700">
                    <span className="text-lg font-black text-slate-900 dark:text-white">
                      Total Amount
                    </span>
                    <span className="text-xl font-black text-emerald-600 dark:text-emerald-400">
                      LKR {total.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 pt-2">
                  <Button
                    className="w-full h-14 text-lg font-black gap-2 shadow-xl shadow-emerald-200 dark:shadow-none"
                    disabled={cart.length === 0 || !selectedPatient}
                    isLoading={isSubmitting}
                    onClick={handleCheckout}
                  >
                    <CreditCard className="h-6 w-6" />
                    Complete Invoice
                  </Button>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1 gap-2 h-10 text-xs"
                      disabled={cart.length === 0}
                    >
                      <Printer className="h-4 w-4" />
                      Print Bill
                    </Button>
                    <Button
                      variant="ghost"
                      className="flex-1 gap-2 h-10 text-xs text-slate-400 dark:text-slate-500"
                      onClick={() => setCart([])}
                    >
                      Clear Cart
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Context Card */}
          {selectedPatient && (
            <div className="p-4 bg-blue-600 dark:bg-blue-600/20 rounded-2xl text-white dark:text-blue-400 border dark:border-blue-800 shadow-xl shadow-blue-200 dark:shadow-none animate-in slide-in-from-bottom-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 dark:bg-blue-500/20 rounded-xl">
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase opacity-60 tracking-widest">
                    Active Patient
                  </p>
                  <p className="font-bold text-sm truncate max-w-[150px]">
                    {selectedPatient.name}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
