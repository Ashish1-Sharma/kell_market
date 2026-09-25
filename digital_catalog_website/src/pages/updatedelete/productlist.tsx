import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import axios from "axios";
import { BASE_URL } from "../../utils/constants";
import { toast } from "react-toastify";
import EditProductModal from "./UpdateDeleteProduct";
import PageMeta from "../../components/common/PageMeta";

/* ---------------- TYPES ---------------- */

interface Product {
  id: string;
  item_name: string;
  item_price: string;
  item_quantity: string;
  item_category: string;
  product_status: string;
  item_image: string;
}

interface Category {
  id: number;
  category_name: string;
}

/* ---------------- HELPERS ---------------- */

const extractJson = (data: any) => {
  if (typeof data === "object") return data;
  try {
    const jsonStart = data.indexOf("{");
    return JSON.parse(data.slice(jsonStart));
  } catch {
    return null;
  }
};

function useDebounce<T>(value: T, delay = 400): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

/* ---------------- COMPONENT ---------------- */

export default function ProductList() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [editId, setEditId] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 400);

  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [selectedStatus, setSelectedStatus] = useState("All Status");

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItemsCount, setTotalItemsCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // State for sorting screen
  const [isSortingMode, setIsSortingMode] = useState(false);
  const [modalCategory, setModalCategory] = useState("");
  const [modalSearch, setModalSearch] = useState("");
  const [modalProducts, setModalProducts] = useState<Product[]>([]);
  const [loadingModalProducts, setLoadingModalProducts] = useState(false);
  const [savingProductOrder, setSavingProductOrder] = useState(false);
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);

  const userData = JSON.parse(localStorage.getItem("userData") || "{}");
  const userId = userData.user_id;

  /* ---------------- API CALLS ---------------- */

  const fetchPaginatedProducts = async (pageNo: number) => {
    return axios.get(`${BASE_URL}/getPaginationProducts.php`, {
      params: {
        user_id: userId,
        page: pageNo,
      },
    });
  };

  const loadCategories = () => {
    const params = new URLSearchParams();
    params.append("user_id", String(userId));
    params.append("action_type", "GET");

    axios
      .post(`${BASE_URL}/categoryapi_new.php`, params, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      })
      .then((res) => {
        const parsed = extractJson(res.data);
        if (parsed?.res_code === "200") {
          setCategories(parsed.category_list);
        }
      })
      .catch((err) => console.error("Failed to load categories", err));
  };

  const fetchAllProducts = async () => {
    let all: Product[] = [];
    let currentPage = 1;
    let total = 1;

    do {
      const res = await fetchPaginatedProducts(currentPage);
      if (res.data.res_code !== "200") break;

      all = [...all, ...res.data.item_list];
      total = res.data.total_pages;
      currentPage++;
    } while (currentPage <= total);

    return all;
  };

  /* ---------------- FETCH INITIAL DATA ---------------- */

  useEffect(() => {
    if (userId) {
      loadCategories();
    }
  }, [userId]);

  /* ---------------- MAIN FILTER / FETCH EFFECT ---------------- */

  const loadProducts = () => {
    if (!userId) {
      toast.error("User not logged in");
      return;
    }

    setLoading(true);

    const hasActiveFilters =
      debouncedSearch.trim() !== "" ||
      selectedCategory !== "All Categories" ||
      selectedStatus !== "All Status";

    if (hasActiveFilters) {
      // Fetch all products and filter locally
      fetchAllProducts()
        .then((allProducts) => {
          let filtered = [...allProducts];

          if (debouncedSearch.trim()) {
            const keyword = debouncedSearch.toLowerCase();
            filtered = filtered.filter(
              (item) =>
                item.item_name?.toLowerCase().includes(keyword) ||
                item.item_category?.toLowerCase().includes(keyword)
            );
          }

          if (selectedCategory !== "All Categories") {
            filtered = filtered.filter(
              (item) => item.item_category === selectedCategory
            );
          }

          if (selectedStatus !== "All Status") {
            filtered = filtered.filter(
              (item) => item.product_status === selectedStatus
            );
          }

          setProducts(filtered);
          setTotalItemsCount(filtered.length);
          setTotalPages(1);
          setPage(1);
        })
        .catch(() => toast.error("Failed to filter products"))
        .finally(() => setLoading(false));
    } else {
      // Normal paginated mode
      fetchPaginatedProducts(page)
        .then((res) => {
          if (res.data.res_code === "200") {
            setProducts(res.data.item_list);
            setTotalPages(res.data.total_pages);
            
            // Guessing/Computing total count based on average items per page (approx 10 per page)
            const count = res.data.item_list?.length || 0;
            setTotalItemsCount(res.data.total_pages > 1 ? res.data.total_pages * 10 : count);
          }
        })
        .catch(() => toast.error("Failed to load products"))
        .finally(() => setLoading(false));
    }
  };

  useEffect(() => {
    loadProducts();
  }, [debouncedSearch, selectedCategory, selectedStatus, page, userId]);

  /* ---------------- SORT PRODUCTS DRAG & DROP ---------------- */

  const loadSortProductsForCategory = async (categoryName: string) => {
    if (!categoryName || !userId) return;

    setLoadingModalProducts(true);
    try {
      const formData = new FormData();
      formData.append("user_id", String(userId));
      formData.append("category_name", categoryName);

      const res = await axios.post(`${BASE_URL}/getProductsByCategory.php`, formData);
      const parsed = extractJson(res.data);
      const list = Array.isArray(parsed?.product_list)
        ? parsed.product_list
        : Array.isArray(parsed?.item_list)
          ? parsed.item_list
          : [];

      const sorted = [...list].sort((a: any, b: any) => {
        const orderA = a.sort_order !== null && a.sort_order !== undefined ? Number(a.sort_order) : 99999;
        const orderB = b.sort_order !== null && b.sort_order !== undefined ? Number(b.sort_order) : 99999;
        return orderA - orderB;
      });

      setModalProducts(sorted);
    } catch (err) {
      console.error("Failed to load category products", err);
      setModalProducts([]);
    } finally {
      setLoadingModalProducts(false);
    }
  };

  const handleModalCategoryChange = (categoryName: string) => {
    setModalCategory(categoryName);
    loadSortProductsForCategory(categoryName);
  };

  useEffect(() => {
    if (isSortingMode) {
      if (categories.length > 0) {
        const defaultCat = categories[0].category_name;
        setModalCategory(defaultCat);
        loadSortProductsForCategory(defaultCat);
      } else {
        toast.error("Please add a category first");
        setIsSortingMode(false);
      }
    } else {
      setModalProducts([]);
      setModalSearch("");
    }
  }, [isSortingMode, categories]);

  const filteredModalProducts = modalProducts.filter((item) =>
    item.item_name?.toLowerCase().includes(modalSearch.toLowerCase())
  );

  const handleProductDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIdx(index);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", String(index));
  };

  const handleProductDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIdx === null || draggedIdx === index) return;

    const originalDraggedItem = filteredModalProducts[draggedIdx];
    const originalTargetItem = filteredModalProducts[index];

    const originalDraggedIndex = modalProducts.indexOf(originalDraggedItem);
    const originalTargetIndex = modalProducts.indexOf(originalTargetItem);

    if (originalDraggedIndex === -1 || originalTargetIndex === -1) return;

    const updated = [...modalProducts];
    updated.splice(originalDraggedIndex, 1);
    updated.splice(originalTargetIndex, 0, originalDraggedItem);

    setDraggedIdx(index);
    setModalProducts(updated);
  };

  const handleProductDragEnd = () => {
    setDraggedIdx(null);
  };

  const handleSaveProductOrder = async () => {
    setSavingProductOrder(true);
    try {
      const params = new URLSearchParams();
      params.append("user_id", String(userId));
      params.append("action_type", "SORT");
      params.append("item_category", modalCategory);
      
      const sortedIds = modalProducts.map((p) => p.id).join(",");
      params.append("sorted_ids", sortedIds);

      const res = await axios.post(
        `${BASE_URL}/saveproducts.php`,
        params,
        { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
      );

      const parsed = extractJson(res.data);
      if (parsed?.res_code === "200") {
        toast.success("Product order updated successfully");
        setIsSortingMode(false);
        loadProducts();
      } else {
        toast.error(parsed?.message || "Failed to save product order");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to save product order");
    } finally {
      setSavingProductOrder(false);
    }
  };

  const handleResetOrder = () => {
    loadSortProductsForCategory(modalCategory);
  };

  const getCategoryIcon = (catName: string) => {
    const name = catName.toUpperCase();
    if (name.includes("CABEL") || name.includes("CABLE")) {
      return (
        <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      );
    }
    if (name.includes("CHARGER")) {
      return (
        <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M11 11V9a2 2 0 00-2-2m2 4v4a2 2 0 104 0v-1m-4-3H9m2 0h4m6 1a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    }
    if (name.includes("PHONE") || name.includes("MOBILE")) {
      return (
        <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      );
    }
    if (name.includes("LAPTOP") || name.includes("COMPUTER")) {
      return (
        <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      );
    }
    if (name.includes("SPEAKER") || name.includes("AUDIO") || name.includes("SOUND")) {
      return (
        <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
        </svg>
      );
    }
    if (name.includes("AIRPOD") || name.includes("HEADPHONE") || name.includes("EARPHONE") || name.includes("NECKBAND")) {
      return (
        <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
        </svg>
      );
    }
    if (name.includes("POWER BANK") || name.includes("BATTERY")) {
      return (
        <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      );
    }
    return (
      <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    );
  };

  /* ---------------- RESET FILTERS ---------------- */

  const handleReset = () => {
    setSearch("");
    setSelectedCategory("All Categories");
    setSelectedStatus("All Status");
    setPage(1);
  };

  const getStatusBadgeClass = (status: string) => {
    if (status === "Active") {
      return "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400";
    }
    return "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400";
  };

  const itemsPerPage = products.length;
  const startItem = (page - 1) * 10 + 1;
  const endItem = startItem + itemsPerPage - 1;

  /* ---------------- UI ---------------- */
  return (
    <>
      <PageMeta
        title="All Products | Digital Catalog Maker"
        description="View and manage all your digital catalog products."
      />

      {!isSortingMode ? (
        /* ================= ALL PRODUCTS (NORMAL VIEW) ================= */
        <div className="space-y-4 px-4 py-2 sm:px-6 lg:px-8">
          
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-950 dark:text-white">All Products</h1>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Manage all your products, update details and availability.
              </p>
            </div>
            <div className="flex gap-3 self-start sm:self-center">
              <button
                onClick={() => setIsSortingMode(true)}
                className="px-4 py-2 border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-850/50 text-xs font-semibold rounded-xl flex items-center gap-2 shadow-sm transition-all cursor-pointer bg-white dark:bg-gray-900"
              >
                {/* Outlined Sort Products button with sort sliders icon */}
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
                Sort Products
              </button>
              <button
                onClick={() => navigate("/addproducts")}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl flex items-center gap-2 shadow-sm transition-all cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                Add Product
              </button>
            </div>
          </div>

          {/* Filters Toolbar */}
          <div className="bg-white dark:bg-white/[0.03] border border-gray-100 dark:border-gray-800 rounded-xl p-3 flex flex-col md:flex-row gap-3 items-center justify-between shadow-sm">
            {/* Search box */}
            <div className="relative w-full md:flex-1">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by product name..."
                className="w-full pl-3.5 pr-9 py-1.5 border border-gray-200 dark:border-gray-850 rounded-lg bg-transparent text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 placeholder-gray-400 text-xs"
              />
              <div className="absolute right-3 inset-y-0 flex items-center text-gray-400 pointer-events-none">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            {/* Select Category */}
            <div className="relative w-full md:w-44">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full pl-3.5 pr-8 py-1.5 border border-gray-200 dark:border-gray-800 rounded-lg bg-white dark:bg-gray-900 text-gray-705 dark:text-gray-300 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 appearance-none cursor-pointer"
              >
                <option value="All Categories">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.category_name}>
                    {cat.category_name}
                  </option>
                ))}
              </select>
              <div className="absolute right-3 inset-y-0 flex items-center text-gray-400 pointer-events-none">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {/* Select Status */}
            <div className="relative w-full md:w-44">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full pl-3.5 pr-8 py-1.5 border border-gray-200 dark:border-gray-800 rounded-lg bg-white dark:bg-gray-900 text-gray-705 dark:text-gray-300 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 appearance-none cursor-pointer"
              >
                <option value="All Status">All Status</option>
                <option value="Active">Active</option>
                <option value="In-active">In-active</option>
                <option value="Out of stock">Out of stock</option>
              </select>
              <div className="absolute right-3 inset-y-0 flex items-center text-gray-400 pointer-events-none">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {/* Reset button */}
            <button
              onClick={handleReset}
              className="w-full md:w-auto px-4 py-2 border border-gray-200 dark:border-gray-800 text-gray-707 dark:text-gray-300 hover:bg-gray-55 dark:hover:bg-gray-800/50 text-xs font-semibold rounded-lg transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer bg-white dark:bg-gray-900"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 8H18.5" />
              </svg>
              Reset
            </button>
          </div>

          {/* Product Table View */}
          <div className="bg-white dark:bg-white/[0.03] border border-gray-100 dark:border-gray-800 rounded-xl p-4 shadow-sm">
            {loading ? (
              <div className="py-20 text-center text-gray-500 dark:text-gray-400">
                <svg className="animate-spin h-8 w-8 text-brand-500 mx-auto mb-3" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Loading products...</span>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="text-xs font-semibold text-gray-400 uppercase tracking-wider border-b border-gray-100 dark:border-gray-800/80">
                      <th className="pb-3 pt-1">Product</th>
                      <th className="pb-3 pt-1">Category</th>
                      <th className="pb-3 pt-1">Price</th>
                      <th className="pb-3 pt-1">Quantity</th>
                      <th className="pb-3 pt-1">Status</th>
                      {/* <th className="pb-3 pt-1">Order</th> */}
                      <th className="pb-3 pt-1">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 dark:divide-gray-800/30 text-sm">
                    {products.length > 0 ? (
                      products.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/10">
                          
                          {/* Product Column */}
                          <td className="py-2.5 flex items-center gap-3">
                            <img
                              src={`${BASE_URL}/${item.item_image}`}
                              alt={item.item_name}
                              className="w-12 h-9 object-cover rounded-lg border border-gray-100 dark:border-gray-800 shrink-0"
                              onError={(e) => {
                                e.currentTarget.src = "/placeholder.png";
                              }}
                            />
                            <div>
                              <h4 className="font-bold text-gray-900 dark:text-white text-sm">{item.item_name}</h4>
                              <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">Added on 20 May 2024</p>
                              <span className="inline-flex mt-1 px-1.5 py-0.5 bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400 text-[9px] font-bold rounded-md">
                                ID: #PRD{item.id}
                              </span>
                            </div>
                          </td>

                          {/* Category Column */}
                          <td className="py-2.5 text-gray-655 dark:text-gray-300 font-medium">{item.item_category}</td>

                          {/* Price Column */}
                          <td className="py-2.5 text-gray-800 dark:text-gray-200 font-semibold">₹{item.item_price}</td>

                          {/* Quantity Column */}
                          <td className="py-2.5 text-gray-655 dark:text-gray-300 font-medium">{item.item_quantity}</td>

                          {/* Status Column */}
                          <td className="py-2.5">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${getStatusBadgeClass(item.product_status)}`}>
                              {item.product_status}
                            </span>
                          </td>

                          {/* Order Column */}
                          {/* <td className="py-2.5 text-gray-755 dark:text-gray-300 font-semibold">
                            {startItem + idx}
                          </td> */}

                          {/* Actions Column */}
                          <td className="py-2.5">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => setEditId(item.id)}
                                className="px-2.5 py-1 bg-brand-50 text-brand-505 dark:bg-brand-500/10 dark:text-brand-400 text-[11px] font-bold rounded-lg flex items-center gap-1 hover:bg-brand-100 transition-colors cursor-pointer"
                              >
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                </svg>
                                Update
                              </button>
                              
                              {/* Three dot actions */}
                              <button className="p-1.5 text-gray-405 hover:text-gray-650 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg cursor-pointer">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                                </svg>
                              </button>
                            </div>
                          </td>

                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="py-16 text-center text-gray-450 dark:text-gray-500">
                          No products found matching the filters.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Footer Pagination */}
          {!search && totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4">
              <span className="text-sm text-gray-505 dark:text-gray-400">
                Showing {startItem} to {endItem} of {totalItemsCount} products
              </span>

              <div className="flex items-center gap-1.5">
                {/* Prev */}
                <button
                  disabled={page === 1}
                  onClick={() => setPage((p) => Math.max(p - 1, 1))}
                  className="p-2 border border-gray-205 dark:border-gray-800 rounded-xl disabled:opacity-40 text-gray-505 hover:bg-gray-50 dark:hover:bg-gray-850/50 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                {/* Page numbers */}
                {Array.from({ length: totalPages }).map((_, idx) => {
                  const pageNo = idx + 1;
                  return (
                    <button
                      key={pageNo}
                      onClick={() => setPage(pageNo)}
                      className={`w-9 h-9 text-sm font-semibold rounded-xl transition-all ${
                        page === pageNo
                          ? "bg-brand-500 text-white shadow-sm"
                          : "border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-850/50"
                      }`}
                    >
                      {pageNo}
                    </button>
                  );
                })}

                {/* Next */}
                <button
                  disabled={page === totalPages}
                  onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                  className="p-2 border border-gray-205 dark:border-gray-800 rounded-xl disabled:opacity-40 text-gray-550 hover:bg-gray-55 dark:hover:bg-gray-850/50 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          )}

        </div>
      ) : (
        /* ================= SORT PRODUCTS (INLINE VIEW) ================= */
        <div className="space-y-6 px-4 py-2 sm:px-6 lg:px-8">
          
          {/* Breadcrumb & Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              {/* Breadcrumb links */}
              <nav className="text-xs text-gray-400 font-semibold mb-1 flex items-center gap-1.5">
                <span className="hover:text-gray-605 cursor-pointer" onClick={() => setIsSortingMode(false)}>Products</span>
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
                <span className="text-gray-605 dark:text-gray-300">Sort Products</span>
              </nav>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-955 dark:text-white">Sort Products</h1>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Drag and drop products to change the order within the selected category.
              </p>
            </div>
            
            <button
              onClick={() => setIsSortingMode(false)}
              className="flex items-center gap-2 px-5 py-2.5 border border-gray-200 dark:border-gray-800 text-gray-707 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50 text-sm font-semibold rounded-xl transition-all shadow-sm cursor-pointer bg-white dark:bg-gray-900 self-start sm:self-center"
            >
              {/* Left back arrow */}
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Products
            </button>
          </div>

          {/* Top Selector & Summary Bar */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            {/* Category Select card */}
            <div className="md:col-span-2 bg-white dark:bg-white/[0.03] border border-gray-100 dark:border-gray-805 rounded-2xl p-5 shadow-sm">
              <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase mb-2">
                Select Category
              </label>
              <div className="relative">
                <select
                  value={modalCategory}
                  onChange={(e) => handleModalCategoryChange(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-202 dark:border-gray-800 rounded-xl bg-white dark:bg-gray-900 text-gray-705 dark:text-gray-300 text-base font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500 appearance-none cursor-pointer"
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.category_name}>
                      {cat.category_name}
                    </option>
                  ))}
                </select>
                <div className="absolute right-4 inset-y-0 flex items-center text-gray-400 pointer-events-none">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Total Products Summary Card */}
            <div className="bg-white dark:bg-white/[0.03] border border-gray-100 dark:border-gray-805 rounded-2xl p-5 shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-50 dark:bg-blue-500/10 rounded-2xl text-blue-500">
                  {/* Cube icon */}
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-400 dark:text-gray-500">Total Products</p>
                  <p className="text-3xl font-bold text-gray-905 dark:text-white mt-1">
                    {modalProducts.length}
                  </p>
                </div>
              </div>
            </div>
          </div>          {/* Custom Sleek Scrollbar Styles */}
          <style>{`
            .custom-scrollbar::-webkit-scrollbar {
              width: 6px;
            }
            .custom-scrollbar::-webkit-scrollbar-track {
              background: transparent;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb {
              background-color: rgba(156, 163, 175, 0.25);
              border-radius: 20px;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb:hover {
              background-color: rgba(156, 163, 175, 0.45);
            }
          `}</style>

          {/* Unified Sorting Workspace */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm overflow-hidden flex flex-col md:flex-row min-h-[580px]">
            
            {/* Left Sidebar - Categories Card */}
            <div className="w-full md:w-72 border-r border-gray-200 dark:border-gray-800 flex flex-col bg-gray-50/50 dark:bg-gray-950/20 shrink-0">
              <div className="p-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex items-center justify-between">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">Categories</h3>
                <span className="text-xs text-gray-400 font-semibold">{categories.length} total</span>
              </div>
              
              <div className="flex-1 overflow-y-auto p-3 space-y-1 max-h-[500px] custom-scrollbar">
                {categories.map((cat) => {
                  const isActive = modalCategory.trim() === cat.category_name.trim();
                  return (
                    <div
                      key={cat.id}
                      onClick={() => handleModalCategoryChange(cat.category_name)}
                      className={`flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-all ${
                        isActive
                          ? "bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-semibold shadow-sm border border-blue-100/50 dark:border-blue-900/30"
                          : "text-gray-700 dark:text-gray-300 hover:bg-gray-100/60 dark:hover:bg-gray-800/40 hover:text-gray-900 dark:hover:text-white font-medium border border-transparent"
                      }`}
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        <span className={`shrink-0 ${isActive ? "text-blue-500" : "text-gray-400"}`}>
                          {getCategoryIcon(cat.category_name)}
                        </span>
                        <span className="text-sm truncate uppercase">{cat.category_name}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="p-3 border-t border-gray-200 dark:border-gray-800 text-center bg-white dark:bg-gray-900">
                <p className="text-[11px] text-gray-400 dark:text-gray-500 font-medium">
                  Select a category to sort products.
                </p>
              </div>
            </div>

            {/* Right Panel - Draggable Products Panel */}
            <div className="flex-1 flex flex-col bg-white dark:bg-gray-900 min-h-[400px]">
              
              {/* Product list header */}
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between bg-white dark:bg-gray-900">
                <div className="flex items-center gap-3">
                  <h3 className="text-base font-bold text-gray-950 dark:text-white">
                    Products in <span className="text-blue-600 dark:text-blue-400">{modalCategory}</span>
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                    {filteredModalProducts.length} products
                  </span>
                </div>
                <button
                  onClick={() => loadSortProductsForCategory(modalCategory)}
                  className="flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-404 hover:text-blue-700 dark:hover:text-blue-300 transition-colors cursor-pointer"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 8H18.5" />
                  </svg>
                  Reset List
                </button>
              </div>

              {/* Work Area Body */}
              <div className="flex-1 p-6 flex flex-col">
                
                {/* Draggable items notice */}
                <div className="flex items-center gap-2.5 px-4 py-3 bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30 text-blue-700 dark:text-blue-400 rounded-xl mb-5 text-xs font-medium">
                  <svg className="w-4 h-4 shrink-0 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Drag and drop products to change their order in the catalog.</span>
                </div>

                {/* Products list area */}
                <div className="space-y-2 overflow-y-auto flex-1 max-h-[380px] pr-1 custom-scrollbar min-h-[200px]">
                  {loadingModalProducts ? (
                    <div className="py-20 text-center text-gray-500 dark:text-gray-400">
                      <svg className="animate-spin h-8 w-8 text-blue-600 mx-auto mb-3" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span className="text-sm font-semibold">Loading products...</span>
                    </div>
                  ) : filteredModalProducts.length === 0 ? (
                    <div className="py-20 text-center text-gray-400 dark:text-gray-500 border border-dashed border-gray-200 dark:border-gray-800 rounded-2xl bg-gray-50/20 dark:bg-gray-950/5">
                      <svg className="w-8 h-8 mx-auto text-gray-300 dark:text-gray-700 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                      <span className="text-xs font-semibold">No products found in this category.</span>
                    </div>
                  ) : (
                    filteredModalProducts.map((item, idx) => (
                      <div
                        key={item.id}
                        draggable
                        onDragStart={(e) => handleProductDragStart(e, idx)}
                        onDragOver={(e) => handleProductDragOver(e, idx)}
                        onDragEnd={handleProductDragEnd}
                        className={`flex items-center justify-between p-3 border rounded-xl bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 transition-all select-none ${
                          draggedIdx === idx 
                            ? "opacity-25 border-blue-500 bg-blue-50/5 dark:bg-blue-950/5 scale-[0.99]" 
                            : "hover:border-gray-300 dark:hover:border-gray-700 hover:shadow-sm"
                        }`}
                      >
                        <div className="flex items-center gap-3.5 overflow-hidden">
                          <div className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1 shrink-0">
                            {/* grab handle ⠿ (6-dot) icon */}
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 16 16">
                              <path d="M7 2a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zM7 6a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm-3 4a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm-3 4a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0z"/>
                            </svg>
                          </div>
                          <img
                            src={`${BASE_URL}/${item.item_image}`}
                            alt={item.item_name}
                            className="w-11 h-11 object-cover rounded-lg border border-gray-100 dark:border-gray-800 shrink-0 pointer-events-none"
                            onError={(e) => {
                              e.currentTarget.src = "/placeholder.png";
                            }}
                          />
                          <div className="flex flex-col overflow-hidden pr-2">
                            <span className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">
                              {item.item_name}
                            </span>
                            <span className="text-xs text-gray-400 dark:text-gray-500 truncate mt-0.5">
                              Price: {item.item_price}
                            </span>
                          </div>
                        </div>
                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-gray-50 dark:bg-gray-800 text-xs font-bold text-gray-500 dark:text-gray-400 border border-gray-100 dark:border-gray-700 shrink-0">
                          {idx + 1}
                        </span>
                      </div>
                    ))
                  )}
                </div>

                {/* Footer Save actions (Inside the right workspace panel) */}
                <div className="flex items-center justify-end gap-3 pt-5 border-t border-gray-200 dark:border-gray-800 mt-auto">
                  <button
                    onClick={handleResetOrder}
                    className="px-5 py-2.5 border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-semibold hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors cursor-pointer bg-white dark:bg-gray-900 flex items-center gap-1.5"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 8H18.5" />
                    </svg>
                    Reset Order
                  </button>
                  <button
                    onClick={handleSaveProductOrder}
                    disabled={savingProductOrder || loadingModalProducts}
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-50 cursor-pointer flex items-center gap-1.5 shadow-sm"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                    </svg>
                    {savingProductOrder ? "Saving..." : "Save Order"}
                  </button>
                </div>

              </div>
            </div>

          </div>
        </div>
      )}

      {/* Edit modal */}
      <EditProductModal
        productId={editId}
        isOpen={!!editId}
        onClose={() => setEditId(null)}
        onUpdated={() => {
          setEditId(null);
          loadProducts();
        }}
      />
    </>
  );
}
