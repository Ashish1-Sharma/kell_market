import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { BASE_URL } from "../../utils/constants";
import { toast } from "react-toastify";
import PageMeta from "../../components/common/PageMeta";

/* ---------------- TYPES ---------------- */

interface OrderItem {
  id: string;
  item_name: string;
  item_price: string;
  item_dis_price: string | null;
  item_image: string;
  item_category: string;
  quantity: string;
}

interface CustomerOrder {
  id: string;
  inquiry_date: string;
  description: string;
  status: string;
  items: OrderItem[];
}

export default function CustomerOrders() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedOrderDetail, setSelectedOrderDetail] = useState<CustomerOrder | null>(null);

  // Retrieve passed customer data if navigating from the customers list
  const customerInfo = location.state?.customer;

  /* ---------------- LOAD CUSTOMER ORDERS ---------------- */

  const loadCustomerOrders = () => {
    if (!id) return;
    setLoading(true);

    const params = new URLSearchParams();
    params.append("customer_id", id);

    axios
      .post(`${BASE_URL}/cart/getCustomerOrders.php`, params, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      })
      .then((res) => {
        if (res.data?.res_code === "200") {
          setOrders(res.data.data || []);
        } else if (res.data?.res_code === "404") {
          setOrders([]);
        } else {
          toast.error(res.data?.message || "Failed to load customer orders");
        }
      })
      .catch((err) => {
        console.error(err);
        toast.error("Something went wrong loading customer orders");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadCustomerOrders();
  }, [id]);

  /* ---------------- LIVE ACTIONS ---------------- */

  const handleAcceptOrder = (orderId: string) => {
    axios
      .get(`${BASE_URL}/cart/manageOrder.php`, {
        params: { order_id: orderId, action: "accept" },
      })
      .then((res) => {
        if (res.data?.res_code === "200") {
          toast.success(res.data.message || "Order Accepted successfully");
          loadCustomerOrders();
        } else {
          toast.error(res.data?.message || "Failed to accept order");
        }
      })
      .catch((err) => {
        console.error(err);
        toast.error("Something went wrong accepting order");
      });
  };

  const handleRejectOrder = (orderId: string) => {
    axios
      .get(`${BASE_URL}/cart/manageOrder.php`, {
        params: { order_id: orderId, action: "reject" },
      })
      .then((res) => {
        if (res.data?.res_code === "200") {
          toast.success(res.data.message || "Order Rejected successfully");
          loadCustomerOrders();
        } else {
          toast.error(res.data?.message || "Failed to reject order");
        }
      })
      .catch((err) => {
        console.error(err);
        toast.error("Something went wrong rejecting order");
      });
  };

  const handleDeleteOrder = (orderId: string) => {
    if (!window.confirm(`Are you sure you want to delete order #${orderId}?`)) return;

    axios
      .get(`${BASE_URL}/cart/manageOrder.php`, {
        params: { order_id: orderId, action: "delete" },
      })
      .then((res) => {
        if (res.data?.res_code === "200") {
          toast.success(res.data.message || "Order deleted successfully");
          loadCustomerOrders();
        } else {
          toast.error(res.data?.message || "Failed to delete order");
        }
      })
      .catch((err) => {
        console.error(err);
        toast.error("Something went wrong deleting order");
      });
  };

  /* ---------------- HELPERS ---------------- */

  const getOrderTotalVal = (items?: OrderItem[]): number => {
    if (!items || !Array.isArray(items)) return 0;
    return items.reduce((sum, item) => {
      const price = parseFloat(item.item_dis_price || item.item_price || "0");
      const qty = parseInt(item.quantity || "1", 10);
      return sum + price * qty;
    }, 0);
  };

  const getOrderTotal = (items?: OrderItem[]): string => {
    const total = getOrderTotalVal(items);
    return `₹${total.toLocaleString()}`;
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "N/A";
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      const day = date.getDate();
      const month = date.toLocaleString("en-US", { month: "short" });
      const year = date.getFullYear();
      return `${day} ${month} ${year}`;
    } catch {
      return dateStr;
    }
  };

  const getStatusBadge = (status?: string) => {
    const s = (status || "Pending").toLowerCase();
    if (s === "accepted" || s === "success" || s === "delivered") {
      return "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400";
    }
    if (s === "rejected" || s === "failed" || s === "cancelled") {
      return "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400";
    }
    return "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400";
  };

  const ownerName = customerInfo?.owner_name || "Customer";
  const shopName = customerInfo?.shop_name;
  const phoneNumber = customerInfo?.phone || "N/A";

  return (
    <>
      <PageMeta
        title={`Orders - ${ownerName} | Digital Catalog Maker`}
        description={`View orders from ${ownerName}`}
      />
      <div className="space-y-4 max-w-7xl mx-auto px-4 py-1.5 sm:px-6 lg:px-8">
        {/* Breadcrumb Navigation / Back Button */}
        <div>
          <button
            onClick={() => navigate("/customers")}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white transition-colors mb-3 cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Customers
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-955 dark:text-white">
              Orders - {ownerName}
            </h1>
            {shopName && (
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {shopName} • Phone: {phoneNumber}
              </p>
            )}
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white dark:bg-white/[0.03] border border-gray-100 dark:border-gray-800 rounded-xl p-4 shadow-sm overflow-x-auto">
          {loading ? (
            <div className="py-20 text-center text-gray-500 dark:text-gray-400">
              <svg className="animate-spin h-8 w-8 mx-auto text-brand-500 mb-3" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span>Loading orders...</span>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-xs font-semibold text-gray-400 uppercase tracking-wider border-b border-gray-100 dark:border-gray-800/80">
                  <th className="pb-3 pt-1">ORDER ID</th>
                  <th className="pb-3 pt-1">PHONE</th>
                  <th className="pb-3 pt-1">DATE</th>
                  <th className="pb-3 pt-1">ITEMS COUNT</th>
                  <th className="pb-3 pt-1">STATUS</th>
                  <th className="pb-3 pt-1 pr-4">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800/30 text-sm">
                {orders.length > 0 ? (
                  orders.map((order) => (
                    <tr
                      key={order.id}
                      className="hover:bg-gray-50/50 dark:hover:bg-gray-855/10 transition-colors"
                    >
                      <td className="py-2.5 font-bold text-gray-955 dark:text-white">#{order.id}</td>
                      <td className="py-2.5 font-normal text-gray-500 dark:text-gray-400">
                        {phoneNumber}
                      </td>
                      <td className="py-2.5 font-normal text-gray-600 dark:text-gray-300">
                        {formatDate(order.inquiry_date)}
                      </td>
                      <td className="py-2.5 font-semibold text-gray-900 dark:text-white">
                        {(order.items || []).length} {(order.items || []).length === 1 ? "Item" : "Items"}
                      </td>
                      <td className="py-2.5">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${getStatusBadge(order.status)}`}>
                          {order.status || "Pending"}
                        </span>
                      </td>
                      <td className="py-2.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          {/* View */}
                          <button
                            onClick={() => setSelectedOrderDetail(order)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-800/60 rounded-lg text-xs font-semibold transition-colors"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            View
                          </button>

                          {/* Accept */}
                          <button
                            onClick={() => handleAcceptOrder(order.id)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:hover:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800/60 rounded-lg text-xs font-semibold transition-colors"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                            Accept
                          </button>

                          {/* Reject */}
                          <button
                            onClick={() => handleRejectOrder(order.id)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-900/20 dark:hover:bg-rose-900/30 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-800/60 rounded-lg text-xs font-semibold transition-colors"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            Reject
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => handleDeleteOrder(order.id)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 hover:bg-gray-100 dark:bg-gray-800/40 dark:hover:bg-gray-800/60 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 rounded-lg text-xs font-semibold transition-colors"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-16 text-center text-gray-400 dark:text-gray-500 font-medium">
                      No orders found for this customer.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Order Items Modal */}
      {selectedOrderDetail && (
        <div
          className="fixed inset-0 z-[99999] bg-black/60 flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setSelectedOrderDetail(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl bg-white dark:bg-gray-900 rounded-xl p-4 sm:p-5 shadow-2xl space-y-4 my-6"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-gray-150 dark:border-gray-800">
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  Order Details <span className="text-brand-500 text-sm font-semibold">#{selectedOrderDetail.id}</span>
                </h3>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  Received on {formatDate(selectedOrderDetail.inquiry_date)}
                </p>
              </div>
              <button
                onClick={() => setSelectedOrderDetail(null)}
                className="text-gray-400 hover:text-red-500 text-xl font-bold transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Customer Details info block */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50/50 dark:bg-gray-850/10 border border-gray-100 dark:border-gray-800 rounded-xl p-3.5">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">Customer Details</span>
                <h4 className="font-bold text-gray-900 dark:text-white mt-1">{ownerName}</h4>
                {shopName && (
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-0.5">Shop: {shopName}</p>
                )}
                {selectedOrderDetail.description && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 bg-white dark:bg-gray-900 p-2 rounded-lg border border-gray-100 dark:border-gray-800">
                    Note: {selectedOrderDetail.description}
                  </p>
                )}
              </div>

              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">Delivery Information</span>
                <p className="text-sm text-gray-700 dark:text-gray-300 mt-1 flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  {phoneNumber}
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-300 mt-1 flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {customerInfo?.city || "N/A"}
                </p>
              </div>
            </div>

            {/* Ordered Items */}
            <div className="space-y-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 block mb-2">Ordered Items ({(selectedOrderDetail.items || []).length})</span>
              
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {(selectedOrderDetail.items || []).map((item) => {
                  const itemPrice = parseFloat(item.item_dis_price || item.item_price || "0");
                  const qty = parseInt(item.quantity || "1", 10);
                  const subtotal = itemPrice * qty;

                  return (
                    <div
                      key={item.id}
                      className="flex items-center justify-between gap-4 p-2 border border-gray-100 dark:border-gray-800 rounded-lg hover:bg-gray-50/50 dark:hover:bg-gray-850/5 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={`${BASE_URL}/${item.item_image}`}
                          alt={item.item_name}
                          className="w-12 h-10 object-cover rounded-lg border border-gray-100 dark:border-gray-800 shrink-0"
                          onError={(e) => {
                            e.currentTarget.src = "/placeholder.png";
                          }}
                        />
                        <div>
                          <h5 className="font-semibold text-gray-900 dark:text-white text-sm">{item.item_name}</h5>
                          <p className="text-xs text-gray-400 mt-0.5">{item.item_category}</p>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">₹{subtotal.toLocaleString()}</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {item.item_dis_price ? (
                            <>
                              <span className="line-through mr-1">₹{item.item_price}</span>
                              <span>₹{item.item_dis_price}</span>
                            </>
                          ) : (
                            <span>₹{item.item_price}</span>
                          )}
                          {" "}× {item.quantity}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Grand Total */}
            <div className="pt-4 border-t border-gray-150 dark:border-gray-800 flex justify-end items-center">
              <div className="text-right">
                <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">Grand Total</span>
                <p className="text-lg font-bold text-gray-955 dark:text-white mt-0.5">
                  {getOrderTotal(selectedOrderDetail.items)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
