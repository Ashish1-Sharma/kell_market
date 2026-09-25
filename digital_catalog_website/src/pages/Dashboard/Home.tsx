import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import axios from "axios";
import PageMeta from "../../components/common/PageMeta";
import { BASE_URL } from "../../utils/constants";

interface Counts {
  item_master_count: number;
  product_category_count: number;
  total_customers: number;
  total_orders: number;
}

export default function Home() {
  const navigate = useNavigate();
  const [counts, setCounts] = useState<Counts>({
    item_master_count: 0,
    product_category_count: 0,
    total_customers: 0,
    total_orders: 0,
  });

  const userData = JSON.parse(localStorage.getItem("userData") || "{}");

  useEffect(() => {
    if (!userData.user_id) return;

    axios
      .get(`${BASE_URL}/getPrductAndCategoryCount.php`, {
        params: { user_id: userData.user_id },
      })
      .then((res) => {
        if (res.data?.res_code === "200") {
          setCounts((prev) => ({
            ...prev,
            ...res.data.counts,
          }));
        }
      })
      .catch((err) => console.error("Failed to load counts", err));

    axios
      .get(`${BASE_URL}/get_dashboard_count.php`, {
        params: { user_id: userData.user_id },
      })
      .then((res) => {
        if (res.data?.res_code === "200" || res.data?.res_code === "786") {
          setCounts((prev) => ({
            ...prev,
            total_customers: Number(res.data.total_customers || 0),
            total_orders: Number(res.data.total_orders || 0),
            item_master_count: res.data.total_products !== undefined ? Number(res.data.total_products) : prev.item_master_count,
          }));
        }
      })
      .catch((err) => console.error("Failed to load dashboard count", err));
  }, [userData.user_id]);

  const firstName = userData.username ? userData.username.split(" ")[0] : "Sagar";



  return (
    <>
      <PageMeta
        title="Dashboard | Digital Catalog Maker"
        description="Welcome back to your Digital Catalog Maker dashboard."
      />
      <div className="space-y-6  sm:px-6 lg:px-8">
        
        {/* Welcome Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-950 dark:text-white flex items-center gap-2">
              Welcome back, {firstName}! <span className="animate-bounce">👋</span>
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Here's what's happening in your business today.
            </p>
          </div>
          
          {/* Date Picker Button */}
          {/* <div className="self-start sm:self-center">
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-sm font-medium text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 shadow-sm transition-colors">
              <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>May 20 - May 26, 2024</span>
              <svg className="w-3.5 h-3.5 text-gray-400 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div> */}
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Total Orders */}
          <div className="bg-white dark:bg-white/[0.03] border border-gray-100 dark:border-gray-800 rounded-xl p-4 flex items-start gap-3 hover:shadow-sm transition-shadow">
            <div className="p-2.5 bg-rose-50 dark:bg-rose-500/10 rounded-xl text-rose-500 flex-shrink-0">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Total Orders</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white mt-0.5">{counts.total_orders}</p>
              <p className="text-[11px] text-gray-405 dark:text-gray-500 mt-0.5">Total orders placed</p>
            </div>
          </div>

          {/* Total Customers */}
          <div className="bg-white dark:bg-white/[0.03] border border-gray-100 dark:border-gray-800 rounded-xl p-4 flex items-start gap-3 hover:shadow-sm transition-shadow">
            <div className="p-2.5 bg-purple-50 dark:bg-purple-500/10 rounded-xl text-purple-500 flex-shrink-0">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Total Customers</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white mt-0.5">{counts.total_customers}</p>
              <p className="text-[11px] text-gray-405 dark:text-gray-500 mt-0.5">Registered customers</p>
            </div>
          </div>

          {/* Total Products */}
          <div className="bg-white dark:bg-white/[0.03] border border-gray-100 dark:border-gray-800 rounded-xl p-4 flex items-start gap-3 hover:shadow-sm transition-shadow">
            <div className="p-2.5 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl text-emerald-500 flex-shrink-0">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Total Products</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white mt-0.5">{counts.item_master_count}</p>
              <p className="text-[11px] text-gray-405 dark:text-gray-500 mt-0.5">Active products</p>
            </div>
          </div>

          {/* Total Categories */}
          <div className="bg-white dark:bg-white/[0.03] border border-gray-100 dark:border-gray-800 rounded-xl p-4 flex items-start gap-3 hover:shadow-sm transition-shadow">
            <div className="p-2.5 bg-amber-50 dark:bg-amber-500/10 rounded-xl text-amber-500 flex-shrink-0">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Total Categories</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white mt-0.5">{counts.product_category_count}</p>
              <p className="text-[11px] text-gray-450 dark:text-gray-500 mt-0.5">Active categories</p>
            </div>
          </div>
        </div>

        
        <div className="bg-white dark:bg-white/[0.03] border border-gray-100 dark:border-gray-800 rounded-xl p-4 hover:shadow-sm transition-shadow">
          <h2 className="text-base font-bold text-gray-900 dark:text-white pb-2 border-b border-gray-100 dark:border-gray-800/80 mb-4">
            Quick Actions
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div 
              onClick={() => navigate("/addproducts")} 
              className="flex items-center justify-between p-4 border border-gray-100 dark:border-gray-800 hover:border-rose-300 dark:hover:border-rose-500/30 rounded-xl cursor-pointer hover:shadow-sm transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-rose-50 dark:bg-rose-500/10 rounded-xl text-rose-500">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Add Product</h4>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Create a new product</p>
                </div>
              </div>
              <svg className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </div>

            {/* Add Category */}
            <div 
              onClick={() => navigate("/addCategory")} 
              className="flex items-center justify-between p-4 border border-gray-100 dark:border-gray-800 hover:border-amber-300 dark:hover:border-amber-500/30 rounded-xl cursor-pointer hover:shadow-sm transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-amber-50 dark:bg-amber-500/10 rounded-xl text-amber-500">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6z" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Add Category</h4>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Create a new category</p>
                </div>
              </div>
              <svg className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </div>

            {/* View Orders */}
            <div 
              onClick={() => navigate("/orders")} 
              className="flex items-center justify-between p-4 border border-gray-100 dark:border-gray-800 hover:border-blue-300 dark:hover:border-blue-500/30 rounded-xl cursor-pointer hover:shadow-sm transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-50 dark:bg-blue-500/10 rounded-xl text-blue-500">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white">View Orders</h4>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Manage all orders</p>
                </div>
              </div>
              <svg className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </div>

            {/* View Customers */}
            <div 
              onClick={() => navigate("/customers")} 
              className="flex items-center justify-between p-4 border border-gray-100 dark:border-gray-800 hover:border-purple-300 dark:hover:border-purple-500/30 rounded-xl cursor-pointer hover:shadow-sm transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-purple-50 dark:bg-purple-500/10 rounded-xl text-purple-500">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white">View Customers</h4>
                  <p className="text-xs text-gray-400 dark:text-gray-555 mt-0.5">Manage all customers</p>
                </div>
              </div>
              <svg className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </div>

          </div>
        </div>

      </div>
    </>
  );
}
