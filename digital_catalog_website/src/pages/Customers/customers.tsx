import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { BASE_URL } from "../../utils/constants";
import { toast } from "react-toastify";
import PageMeta from "../../components/common/PageMeta";

/* ---------------- TYPES ---------------- */

interface APICustomer {
  id: string | number;
  shop_name: string;
  owner_name: string;
  email: string;
  phone: string;
  shop_address: string;
  city: string;
  pincode: string;
  created_at: string;
  is_active?: string | number;
}

/* ---------------- COMPONENT ---------------- */

export default function Customers() {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<APICustomer[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<APICustomer | null>(null);

  const userData = JSON.parse(localStorage.getItem("userData") || "{}");
  const userId = userData.user_id;

  /* ---------------- LOAD CUSTOMERS ---------------- */

  const loadCustomers = () => {
    if (!userId) {
      toast.error("User not logged in");
      return;
    }

    setLoading(true);
    const params = new URLSearchParams();
    params.append("admin_id", String(userId));

    axios
      .post(`${BASE_URL}/cart/getAllCustomers.php`, params, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      })
      .then((res) => {
        if (res.data?.res_code === "200") {
          setCustomers(res.data.data || []);
        } else if (res.data?.res_code === "404") {
          setCustomers([]);
        } else {
          toast.error(res.data?.message || "Failed to load customers");
        }
      })
      .catch((err) => {
        console.error(err);
        toast.error("Something went wrong loading customers");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (userId) loadCustomers();
  }, [userId]);

  const toggleStatus = (customer: APICustomer) => {
    const currentStatus = Number(customer.is_active || 0);
    const newStatus = currentStatus === 1 ? 0 : 1;

    axios
      .get(`${BASE_URL}/toggleCustomerStatus.php`, {
        params: {
          customer_id: customer.id,
          status: newStatus,
        },
      })
      .then((res) => {
        if (res.data?.res_code === "200" || res.data?.status === "success" || res.data?.message?.toLowerCase().includes("success")) {
          toast.success(res.data.message || `Customer status updated successfully`);
          loadCustomers();
          if (selectedCustomer && selectedCustomer.id === customer.id) {
            setSelectedCustomer((prev) => prev ? { ...prev, is_active: newStatus } : null);
          }
        } else {
          toast.error(res.data?.message || "Failed to update customer status");
        }
      })
      .catch((err) => {
        console.error(err);
        toast.error("Failed to update customer status");
      });
  };



  /* ---------------- HELPERS ---------------- */

  const getInitials = (name: string) => {
    if (!name) return "C";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const getAvatarBg = (id: string | number) => {
    const idNum = typeof id === "number" ? id : (parseInt(id, 10) || 0);
    const colors = [
      "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
      "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400",
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
      "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
      "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
      "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400",
    ];
    return colors[idNum % colors.length];
  };

  return (
    <>
      <PageMeta
        title="Customers | Digital Catalog Maker"
        description="View your catalog customers."
      />
      <div className="space-y-4 max-w-7xl mx-auto px-4 py-1.5 sm:px-6 lg:px-8">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-955 dark:text-white">Customers</h1>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Monitor catalog user activity and customer contacts.
          </p>
        </div>

        {/* Customers Table */}
        <div className="bg-white dark:bg-white/[0.03] border border-gray-100 dark:border-gray-800 rounded-xl p-4 shadow-sm">
          {loading ? (
            <div className="py-20 text-center text-gray-500 dark:text-gray-400">
              <svg className="animate-spin h-8 w-8 mx-auto text-brand-500 mb-3" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span>Loading customers...</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-xs font-semibold text-gray-400 uppercase tracking-wider border-b border-gray-100 dark:border-gray-808/80">
                    <th className="pb-3 pt-1">Customer</th>
                    <th className="pb-3 pt-1">Email</th>
                    <th className="pb-3 pt-1">Phone Number</th>
                    <th className="pb-3 pt-1">City</th>
                    <th className="pb-3 pt-1">Pincode</th>
                    <th className="pb-3 pt-1">Joined On</th>
                    
                    <th className="pb-3 pt-1">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-808/30 text-sm">
                  {customers.length > 0 ? (
                    customers.map((cust) => (
                      <tr
                        key={cust.id}
                        onClick={() => setSelectedCustomer(cust)}
                        className="hover:bg-gray-55/50 dark:hover:bg-gray-800/10 cursor-pointer transition-colors"
                      >
                        <td className="py-2.5 flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${getAvatarBg(cust.id)}`}>
                            {getInitials(cust.owner_name)}
                          </div>
                          <div>
                            <span className="font-semibold text-gray-900 dark:text-white block">
                              {cust.owner_name || "N/A"}
                            </span>
                            {cust.shop_name && (
                              <span className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 block">
                                {cust.shop_name}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-2.5 text-gray-800 dark:text-gray-200">{cust.email || "N/A"}</td>
                        <td className="py-2.5 text-gray-505 dark:text-gray-400 font-medium">{cust.phone || "N/A"}</td>
                        <td className="py-2.5 text-gray-600 dark:text-gray-300">{cust.city || "N/A"}</td>
                        <td className="py-2.5 text-gray-500 dark:text-gray-400">{cust.pincode || "N/A"}</td>
                        <td className="py-2.5 text-gray-500 dark:text-gray-400">{cust.created_at}</td>
                        
                        <td className="py-2.5">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleStatus(cust);
                              }}
                              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer shrink-0 ${
                                Number(cust.is_active || 0) === 1
                                  ? "bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-500/10 dark:text-rose-400"
                                  : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400"
                              }`}
                            >
                              {Number(cust.is_active || 0) === 1 ? "Deactivate" : "Activate"}
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/customers/${cust.id}/orders`, { state: { customer: cust } });
                              }}
                              className="px-3 py-1.5 text-xs font-bold rounded-lg bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-800/60 transition-colors shrink-0"
                            >
                              View Orders
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="py-16 text-center text-gray-400 dark:text-gray-500">
                        No customers found for this admin.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Customer Details Modal */}
      {selectedCustomer && (
        <div
          className="fixed inset-0 z-[99999] bg-black/60 flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setSelectedCustomer(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-xl bg-white dark:bg-gray-900 rounded-xl p-4 sm:p-5 shadow-2xl space-y-4 my-6"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-gray-150 dark:border-gray-800">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${getAvatarBg(selectedCustomer.id)}`}>
                  {getInitials(selectedCustomer.owner_name)}
                </div>
                <div>
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                    {selectedCustomer.owner_name || "Customer Details"}
                  </h3>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                    Customer ID: #{selectedCustomer.id}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="text-gray-400 hover:text-red-500 text-xl font-bold transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Profile Info block */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">Shop Name</span>
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                  {selectedCustomer.shop_name || "N/A"}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">Phone Number</span>
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                  {selectedCustomer.phone || "N/A"}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">Email Address</span>
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                  {selectedCustomer.email || "N/A"}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">Joined Timestamp</span>
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                  {selectedCustomer.created_at || "N/A"}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">Status</span>
                <div className="mt-1">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                    Number(selectedCustomer.is_active || 0) === 1
                      ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
                      : "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400"
                  }`}>
                    {Number(selectedCustomer.is_active || 0) === 1 ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>

            </div>

            {/* Address Block */}
            <div className="bg-gray-50/50 dark:bg-gray-855/10 border border-gray-100 dark:border-gray-800 rounded-xl p-3.5 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block border-b border-gray-150 dark:border-gray-800 pb-2">Address details</span>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                <div className="sm:col-span-2">
                  <span className="text-[9px] font-semibold text-gray-400 block">Street / Shop Address</span>
                  <p className="font-semibold text-gray-800 dark:text-gray-200 mt-0.5">
                    {selectedCustomer.shop_address || "N/A"}
                  </p>
                </div>
                
                <div>
                  <span className="text-[9px] font-semibold text-gray-400 block">City</span>
                  <p className="font-semibold text-gray-800 dark:text-gray-200 mt-0.5">
                    {selectedCustomer.city || "N/A"}
                  </p>
                </div>

                <div>
                  <span className="text-[9px] font-semibold text-gray-400 block">Pincode</span>
                  <p className="font-semibold text-gray-800 dark:text-gray-200 mt-0.5">
                    {selectedCustomer.pincode || "N/A"}
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-gray-150 dark:border-gray-800 flex flex-wrap gap-3 items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleStatus(selectedCustomer)}
                  className={`px-4 py-1.5 text-sm font-semibold rounded-lg shadow-sm hover:shadow transition-all cursor-pointer ${
                    Number(selectedCustomer.is_active || 0) === 1
                      ? "bg-rose-600 hover:bg-rose-700 text-white"
                      : "bg-emerald-600 hover:bg-emerald-700 text-white"
                  }`}
                >
                  {Number(selectedCustomer.is_active || 0) === 1 ? "Deactivate Customer" : "Activate Customer"}
                </button>
                <button
                  onClick={() => {
                    navigate(`/customers/${selectedCustomer.id}/orders`, { state: { customer: selectedCustomer } });
                    setSelectedCustomer(null);
                  }}
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg shadow-sm hover:shadow transition-all"
                >
                  View Orders
                </button>
              </div>

              <button
                onClick={() => setSelectedCustomer(null)}
                className="px-5 py-1.5 bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold rounded-lg shadow-sm hover:shadow transition-all"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
