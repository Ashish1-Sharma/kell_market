import { useEffect, useState } from "react";
import axios from "axios";
import { BASE_URL } from "../../utils/constants";
import { toast } from "react-toastify";
import PageMeta from "../../components/common/PageMeta";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

/* ---------------- TYPES ---------------- */

interface CustomerDetails {
  id: string;
  shop_name: string;
  owner_name: string;
  city: string;
}

interface OrderItem {
  id: string;
  item_name: string;
  item_price: string;
  item_dis_price: string | null;
  item_image: string;
  item_category: string;
  quantity: string;
}

interface APIOrder {
  id: string;
  user_id: string;
  name: string;
  phone_no: string;
  city: string;
  description: string;
  inquiry_date: string;
  customer?: CustomerDetails | null;
  items?: OrderItem[];
}

/* ---------------- COMPONENT ---------------- */

export default function Orders() {
  const [orders, setOrders] = useState<APIOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<APIOrder | null>(null);

  const userData = JSON.parse(localStorage.getItem("userData") || "{}");
  const userId = userData.user_id;

  /* ---------------- LOAD ORDERS ---------------- */

  const loadOrders = () => {
    if (!userId) {
      toast.error("User not logged in");
      return;
    }

    setLoading(true);
    const params = new URLSearchParams();
    params.append("user_id", String(userId));

    axios
      .post(`${BASE_URL}/cart/getAdminOrders.php`, params, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      })
      .then((res) => {
        if (res.data?.res_code === "200") {
          const ordersList: APIOrder[] = res.data.data.map((order: APIOrder) => {
            return {
              ...order,
              items: Array.isArray(order.items) ? order.items : [],
            };
          });
          setOrders(ordersList);
        } else if (res.data?.res_code === "404") {
          setOrders([]);
        } else {
          toast.error(res.data?.message || "Failed to load orders");
        }
      })
      .catch((err) => {
        console.error(err);
        toast.error("Something went wrong loading orders");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (userId) loadOrders();
  }, [userId]);

  /* ---------------- MANAGE ORDERS ---------------- */

  const handleAcceptOrder = (orderId: string) => {
    axios
      .get(`${BASE_URL}/cart/manageOrder.php`, {
        params: { order_id: orderId, action: "accept" },
      })
      .then((res) => {
        if (res.data?.res_code === "200") {
          toast.success(res.data.message || "Order Accepted successfully");
          loadOrders();
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
          loadOrders();
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
          loadOrders();
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

  /* ---------------- PDF DOWNLOAD ---------------- */

  const downloadOrderPDF = async (order: APIOrder) => {
    const items = order.items || [];
    const total = getOrderTotalVal(items);

    // Build an off-screen div with the full order layout
    const container = document.createElement("div");
    container.style.cssText = [
      "position:fixed", "left:-9999px", "top:0",
      "width:794px", "background:#ffffff", "font-family:'Noto Sans','Segoe UI',Arial,sans-serif",
      "font-size:13px", "color:#1a1a1a", "padding:0", "box-sizing:border-box",
    ].join(";");

    const itemsHTML = items.map((item) => {
      const price = parseFloat(item.item_dis_price || item.item_price || "0");
      const qty = parseInt(item.quantity || "1", 10);
      const subtotal = price * qty;
      const priceDisplay = item.item_dis_price
        ? `<span style="text-decoration:line-through;color:#aaa;margin-right:4px">₹${parseFloat(item.item_price).toLocaleString()}</span>₹${parseFloat(item.item_dis_price).toLocaleString()}`
        : `₹${parseFloat(item.item_price).toLocaleString()}`;
      return `
        <tr>
          <td style="padding:8px 10px;border-bottom:1px solid #f0f0f0">${item.item_name}</td>
          <td style="padding:8px 10px;border-bottom:1px solid #f0f0f0;color:#666">${item.item_category}</td>
          <td style="padding:8px 10px;border-bottom:1px solid #f0f0f0;text-align:right">${priceDisplay}</td>
          <td style="padding:8px 10px;border-bottom:1px solid #f0f0f0;text-align:center;color:#444">${item.quantity}</td>
          <td style="padding:8px 10px;border-bottom:1px solid #f0f0f0;text-align:right;font-weight:600">₹${subtotal.toLocaleString()}</td>
        </tr>`;
    }).join("");

    container.innerHTML = `
      <!-- Header -->
      <div style="background:#2563eb;padding:20px 28px;color:#fff">
        <div style="display:flex;justify-content:space-between;align-items:flex-start">
          <div>
            <div style="font-size:22px;font-weight:700;margin-bottom:4px">Order Details</div>
            <div style="font-size:13px;opacity:0.85">Received on ${formatDate(order.inquiry_date)}</div>
          </div>
          <div style="text-align:right">
            <div style="font-size:20px;font-weight:700">#${order.id}</div>
            <div style="font-size:13px;opacity:0.85">₹${total.toLocaleString()}</div>
          </div>
        </div>
      </div>

      <!-- Info grid -->
      <div style="display:flex;gap:0;border-bottom:1px solid #e5e7eb">
        <div style="flex:1;padding:18px 28px;border-right:1px solid #e5e7eb">
          <div style="font-size:10px;font-weight:700;color:#9ca3af;letter-spacing:.08em;text-transform:uppercase;margin-bottom:8px">Shop / Client Details</div>
          <div style="font-size:15px;font-weight:700;color:#111;margin-bottom:4px">${order.customer?.shop_name || order.name || "N/A"}</div>
          ${order.customer?.owner_name ? `<div style="color:#555;margin-bottom:2px">Owner: ${order.customer.owner_name}</div>` : ""}
          ${order.description ? `<div style="color:#888;font-size:12px;margin-top:6px;background:#f9fafb;padding:6px 8px;border-radius:6px">Note: ${order.description}</div>` : ""}
        </div>
        <div style="flex:1;padding:18px 28px">
          <div style="font-size:10px;font-weight:700;color:#9ca3af;letter-spacing:.08em;text-transform:uppercase;margin-bottom:8px">Delivery Information</div>
          <div style="color:#374151;margin-bottom:6px">📞 ${order.phone_no || "N/A"}</div>
          <div style="color:#374151">📍 ${order.city || "N/A"}</div>
        </div>
      </div>

      <!-- Items table -->
      <div style="padding:18px 28px">
        <div style="font-size:10px;font-weight:700;color:#9ca3af;letter-spacing:.08em;text-transform:uppercase;margin-bottom:10px">Ordered Items (${items.length})</div>
        <table style="width:100%;border-collapse:collapse">
          <thead>
            <tr style="background:#eff6ff">
              <th style="padding:8px 10px;text-align:left;font-size:11px;color:#2563eb;font-weight:700;border-bottom:2px solid #dbeafe">Item Name</th>
              <th style="padding:8px 10px;text-align:left;font-size:11px;color:#2563eb;font-weight:700;border-bottom:2px solid #dbeafe">Category</th>
              <th style="padding:8px 10px;text-align:right;font-size:11px;color:#2563eb;font-weight:700;border-bottom:2px solid #dbeafe">Price</th>
              <th style="padding:8px 10px;text-align:center;font-size:11px;color:#2563eb;font-weight:700;border-bottom:2px solid #dbeafe">Qty</th>
              <th style="padding:8px 10px;text-align:right;font-size:11px;color:#2563eb;font-weight:700;border-bottom:2px solid #dbeafe">Subtotal</th>
            </tr>
          </thead>
          <tbody>${itemsHTML}</tbody>
        </table>
      </div>

      <!-- Grand total -->
      <div style="padding:14px 28px 20px;border-top:2px solid #e5e7eb;display:flex;justify-content:flex-end;align-items:center">
        <div style="text-align:right">
          <div style="font-size:11px;color:#9ca3af;font-weight:600;letter-spacing:.05em;text-transform:uppercase;margin-bottom:2px">Grand Total</div>
          <div style="font-size:26px;font-weight:800;color:#2563eb">₹${total.toLocaleString()}</div>
        </div>
      </div>

      <!-- Footer -->
      <div style="padding:10px 28px;background:#f9fafb;border-top:1px solid #e5e7eb;display:flex;justify-content:space-between;font-size:11px;color:#9ca3af">
        <span>Generated by Digital Catalog</span>
        <span>${new Date().toLocaleDateString()}</span>
      </div>
    `;

    document.body.appendChild(container);

    try {
      const canvas = await html2canvas(container, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
      });

      const imgData = canvas.toDataURL("image/png");
      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      const doc = new jsPDF({ orientation: imgHeight > 297 ? "portrait" : "portrait", unit: "mm", format: "a4" });

      if (imgHeight <= 297) {
        doc.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
      } else {
        // Multi-page: slice image across pages
        const pageHeight = 297;
        const pxPerMm = canvas.width / imgWidth;
        let yOffset = 0;
        while (yOffset < canvas.height) {
          const sliceH = Math.min(pageHeight * pxPerMm, canvas.height - yOffset);
          const sliceCanvas = document.createElement("canvas");
          sliceCanvas.width = canvas.width;
          sliceCanvas.height = sliceH;
          const ctx = sliceCanvas.getContext("2d")!;
          ctx.drawImage(canvas, 0, -yOffset);
          const sliceData = sliceCanvas.toDataURL("image/png");
          if (yOffset > 0) doc.addPage();
          doc.addImage(sliceData, "PNG", 0, 0, imgWidth, (sliceH / pxPerMm));
          yOffset += sliceH;
        }
      }

      doc.save(`order-${order.id}.pdf`);
    } finally {
      document.body.removeChild(container);
    }
  };

  return (
    <>
      <PageMeta
        title="Orders | Digital Catalog Maker"
        description="Manage your customer catalog orders."
      />
      <div className="space-y-4 max-w-7xl mx-auto px-4 py-1.5 sm:px-6 lg:px-8">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-950 dark:text-white">Orders</h1>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            View and manage all customer catalog orders.
          </p>
        </div>

        {/* Orders Table */}
        <div className="bg-white dark:bg-white/[0.03] border border-gray-100 dark:border-gray-800 rounded-xl p-4 shadow-sm">
          {loading ? (
            <div className="py-20 text-center text-gray-500 dark:text-gray-400">
              <svg className="animate-spin h-8 w-8 mx-auto text-brand-500 mb-3" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span>Loading orders...</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-xs font-semibold text-gray-400 uppercase tracking-wider border-b border-gray-100 dark:border-gray-800/80">
                    <th className="pb-3 pt-1">ORDER ID</th>
                    <th className="pb-3 pt-1">CUSTOMER</th>
                    <th className="pb-3 pt-1">PHONE</th>
                    <th className="pb-3 pt-1">DATE</th>
                    <th className="pb-3 pt-1">ITEMS COUNT</th>
                    <th className="pb-3 pt-1 pr-4">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-800/30 text-sm">
                  {orders.length > 0 ? (
                    orders.map((order) => (
                      <tr
                        key={order.id}
                        onClick={() => setSelectedOrder(order)}
                        className="hover:bg-gray-50/50 dark:hover:bg-gray-800/10 cursor-pointer transition-colors"
                      >
                        <td className="py-2.5 font-bold text-gray-950 dark:text-white">#{order.id}</td>
                        <td className="py-2.5 font-normal text-gray-800 dark:text-gray-200">
                          {order.customer?.owner_name || order.name || "N/A"}
                        </td>
                        <td className="py-2.5 font-normal text-gray-500 dark:text-gray-400">
                          {order.phone_no || "N/A"}
                        </td>
                        <td className="py-2.5 font-normal text-gray-600 dark:text-gray-300">
                          {formatDate(order.inquiry_date)}
                        </td>
                        <td className="py-2.5 font-semibold text-gray-900 dark:text-white">
                          {(order.items || []).length} {(order.items || []).length === 1 ? "Item" : "Items"}
                        </td>
                        <td className="py-2.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            {/* View */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedOrder(order);
                              }}
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
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAcceptOrder(order.id);
                              }}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:hover:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800/60 rounded-lg text-xs font-semibold transition-colors"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                              Accept
                            </button>

                            {/* Reject */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRejectOrder(order.id);
                              }}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-900/20 dark:hover:bg-rose-900/30 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-800/60 rounded-lg text-xs font-semibold transition-colors"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                              </svg>
                              Reject
                            </button>

                            {/* Delete */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteOrder(order.id);
                              }}
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
                      <td colSpan={6} className="py-16 text-center text-gray-400 dark:text-gray-500">
                        No orders found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div
          className="fixed inset-0 z-[99999] bg-black/60 flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setSelectedOrder(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl bg-white dark:bg-gray-900 rounded-xl p-4 sm:p-5 shadow-2xl space-y-4 my-6"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-gray-150 dark:border-gray-800">
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  Order Details <span className="text-brand-500 text-sm font-semibold">#{selectedOrder.id}</span>
                </h3>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  Received on {selectedOrder.inquiry_date}
                </p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-gray-400 hover:text-red-500 text-xl font-bold transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Customer Details info block */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50/50 dark:bg-gray-850/10 border border-gray-100 dark:border-gray-800 rounded-lg p-3.5">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">Shop / Client Details</span>
                <h4 className="font-bold text-gray-900 dark:text-white mt-1">
                  {selectedOrder.customer?.shop_name || selectedOrder.name || "N/A"}
                </h4>
                {selectedOrder.customer?.owner_name && (
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-0.5">
                    Owner: {selectedOrder.customer.owner_name}
                  </p>
                )}
                {selectedOrder.description && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 bg-white dark:bg-gray-900 p-2 rounded-lg border border-gray-100 dark:border-gray-800">
                    Note: {selectedOrder.description}
                  </p>
                )}
              </div>

              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">Delivery Information</span>
                <p className="text-sm text-gray-700 dark:text-gray-300 mt-1 flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  {selectedOrder.phone_no || "N/A"}
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-300 mt-1 flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {selectedOrder.city || "N/A"}
                </p>
              </div>
            </div>

            {/* Ordered Items */}
            <div className="space-y-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 block mb-2">Ordered Items ({(selectedOrder.items || []).length})</span>
              
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {(selectedOrder.items || []).map((item) => {
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

            {/* Grand Total + Download */}
            <div className="pt-4 border-t border-gray-150 dark:border-gray-800 flex items-center justify-between">
              <button
                onClick={() => downloadOrderPDF(selectedOrder)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold shadow-sm transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 15V3" />
                </svg>
                Download PDF
              </button>
              <div className="text-right">
                <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">Grand Total</span>
                <p className="text-2xl font-bold text-gray-950 dark:text-white mt-0.5">
                  {getOrderTotal(selectedOrder.items)}
                </p>
              </div>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
