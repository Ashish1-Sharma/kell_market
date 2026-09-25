import { useEffect, useRef, useState } from "react";
import { useNavigate, Link } from "react-router";
import axios from "axios";
import { BASE_URL } from "../../utils/constants";
import { toast } from "react-toastify";

/* ================= TYPES ================= */

interface Category {
  id: number;
  category_name: string;
}

/* ================= HELPERS ================= */

const extractJson = (data: any) => {
  if (typeof data === "object") return data;
  try {
    const jsonStart = data.indexOf("{");
    return JSON.parse(data.slice(jsonStart));
  } catch {
    return null;
  }
};

/* ================= COMPONENT ================= */

export default function AddProduct() {
  const navigate = useNavigate();
  const userData = JSON.parse(localStorage.getItem("userData") || "{}");
  const userId = userData.user_id;
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [categorySearch, setCategorySearch] = useState("");
  const modalRef = useRef<HTMLDivElement | null>(null);

  /* ================= STATE ================= */

  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategory, setNewCategory] = useState("");
  const [images, setImages] = useState<string[]>([]);

  const [form, setForm] = useState({
    item_name: "",
    item_desc: "",
    item_price: "",
    item_quantity: "",
    item_category: "",
    product_status: "Active",
  });

  /* ================= LOAD CATEGORIES ================= */

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
      });
  };

  useEffect(() => {
    if (userId) loadCategories();
  }, [userId]);

  /* ================= ADD CATEGORY ================= */

  const handleAddCategory = () => {
    if (!newCategory.trim()) {
      toast.error("Please enter category name");
      return;
    }

    const params = new URLSearchParams();
    params.append("user_id", String(userId));
    params.append("category_name", newCategory);
    params.append("action_type", "NEW");

    axios
      .post(`${BASE_URL}/categoryapi_new.php`, params, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      })
      .then((res) => {
        const parsed = extractJson(res.data);
        if (parsed?.res_code === "200") {
          toast.success("Category created");
          setNewCategory("");
          loadCategories();
        } else {
          toast.error(parsed?.message || "Category already exists");
        }
      });
  };

  /* ================= IMAGE SELECT ================= */

  const handleImageChange = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const commaIdx = result.indexOf(",");
      if (commaIdx !== -1) {
        const base64 = result.slice(commaIdx + 1);
        setImages([base64]);
      }
    };
    reader.readAsDataURL(file);
  };

  /* ================= SUBMIT ================= */

  const handleSubmit = async () => {
    if (!form.item_name.trim()) return toast.error("Product name required");
    if (images.length === 0) return toast.error("Product image required");
    if (!form.item_category) return toast.error("Select category");

    const params = new URLSearchParams();
    params.append("user_id", String(userId));
    params.append("item_name", form.item_name);
    params.append("item_desc", form.item_desc);
    params.append("item_price", form.item_price);
    params.append("item_quantity", form.item_quantity);
    params.append("item_category", form.item_category);
    params.append("product_status", form.product_status);
    params.append("item_image", images[0]);

    try {
      const res = await axios.post(
        `${BASE_URL}/saveproducts.php`,
        params,
        { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
      );

      const parsed = extractJson(res.data);
      if (parsed?.res_code === "200") {
        toast.success("Product added successfully");

        setForm({
          item_name: "",
          item_desc: "",
          item_price: "",
          item_quantity: "",
          item_category: "",
          product_status: "Active",
        });
        setImages([]);
      } else {
        toast.error(parsed?.message || "Save failed");
      }
    } catch {
      toast.error("Something went wrong");
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  /* ================= UI ================= */

  return (
    <>
      {/* Inline Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4  px-4 sm:px-0">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-955 dark:text-white">Add Product</h1>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Add a new product to your catalog.</p>
        </div>
        <nav className="text-sm font-medium text-gray-500 dark:text-gray-400">
          <ol className="flex items-center gap-1.5">
            <li>
              <Link to="/home" className="hover:text-brand-500 transition-colors">Home</Link>
            </li>
            <li className="text-gray-300">/</li>
            <li>
              <Link to="/products" className="hover:text-brand-500 transition-colors">Products</Link>
            </li>
            <li className="text-gray-300">/</li>
            <li className="text-brand-500 font-semibold">Add Product</li>
          </ol>
        </nav>
      </div>

      <div className=" bg-white dark:bg-white/[0.03] border border-gray-150 dark:border-gray-800 p-4 sm:p-5 rounded-xl shadow-sm space-y-4">
        
        {/* Top Grid: Image Dropzone & Product Details */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          
          {/* Left Column: Image Dropzone */}
          <div className="md:col-span-5 space-y-2">
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">Product Image</label>
            
            <div className="relative border border-dashed border-purple-300 dark:border-purple-900/40 bg-purple-50/10 dark:bg-purple-950/5 rounded-xl p-4 flex flex-col items-center justify-center text-center h-[210px] transition-all hover:bg-purple-50/20">
              {images.length > 0 ? (
                <div className="relative w-full h-full group">
                  <img
                    src={`data:image/jpeg;base64,${images[0]}`}
                    className="w-full h-full object-contain rounded-lg"
                    alt="Product Preview"
                  />
                  <div className="absolute inset-0 bg-black/40 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                      type="button"
                      onClick={() => removeImage(0)}
                      className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg shadow transition-all"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) =>
                      e.target.files && handleImageChange(e.target.files[0])
                    }
                  />
                  
                  {/* Cloud Icon */}
                  <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-950/60 text-brand-500 dark:text-brand-400 flex items-center justify-center mb-2.5">
                    <svg className="w-5.5 h-5.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  
                  <p className="text-xs font-semibold text-gray-800 dark:text-gray-200">
                    Drag & drop an image here, or
                  </p>
                  <span className="mt-2 inline-flex px-4 py-1.5 bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold rounded-lg transition-all shadow-sm">
                    Choose Image
                  </span>
                  <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-2">
                    JPG, PNG or WEBP (Max. 2MB)
                  </p>
                </label>
              )}
            </div>
          </div>

          {/* Right Column: Name & Description */}
          <div className="md:col-span-7 flex flex-col justify-between gap-4">
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                Product Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className="w-full h-[38px] px-3 border border-gray-200 dark:border-gray-800 rounded-lg bg-transparent text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 placeholder-gray-400 text-sm"
                placeholder="Enter product name"
                value={form.item_name}
                onChange={(e) => setForm({ ...form, item_name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-1.5 flex-grow flex flex-col">
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                Description
              </label>
              <textarea
                className="w-full px-3 py-1.5 border border-gray-200 dark:border-gray-800 rounded-lg bg-transparent text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 placeholder-gray-400 text-sm flex-grow min-h-[100px]"
                placeholder="Enter product description"
                value={form.item_desc}
                onChange={(e) => setForm({ ...form, item_desc: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Price & Quantity Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
              Price <span className="text-red-500">*</span>
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3 text-gray-400 dark:text-gray-500 text-sm font-medium">₹</span>
              <input
                type="text"
                className="w-full pl-8 pr-3 h-[38px] border border-gray-200 dark:border-gray-800 rounded-lg bg-transparent text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 placeholder-gray-400 text-sm"
                placeholder="Enter price"
                value={form.item_price}
                onChange={(e) => setForm({ ...form, item_price: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
              Quantity <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              className="w-full px-3 h-[38px] border border-gray-200 dark:border-gray-800 rounded-lg bg-transparent text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 placeholder-gray-400 text-sm"
              placeholder="Enter quantity"
              value={form.item_quantity}
              onChange={(e) => setForm({ ...form, item_quantity: e.target.value })}
              required
            />
          </div>
        </div>

        {/* Category Required Container */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
            Category <span className="text-red-500">(Required)</span>
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex gap-2">
              <input
                type="text"
                className="flex-grow px-3 h-[38px] border border-gray-200 dark:border-gray-800 rounded-lg bg-transparent text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 placeholder-gray-400 text-sm"
                placeholder="Add New Category"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
              />
              <button
                type="button"
                onClick={handleAddCategory}
                className="px-4 h-[38px] bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg transition-all shadow-sm"
              >
                + Add
              </button>
            </div>

            <div className="relative">
              <button
                type="button"
                onClick={() => setShowCategoryModal(true)}
                className="w-full px-3 h-[38px] border border-gray-200 dark:border-gray-800 rounded-lg bg-white dark:bg-gray-900 text-left text-gray-700 dark:text-gray-300 flex items-center justify-between text-sm shadow-sm hover:border-gray-300 transition-colors"
              >
                <span>{form.item_category || "Select Category"}</span>
                <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Category Modal Popup */}
        {showCategoryModal && (
          <div
            className="fixed inset-0 z-[99999] bg-black/60 flex items-center justify-center p-4"
            onClick={() => setShowCategoryModal(false)}
          >
            <div
              ref={modalRef}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg bg-white dark:bg-gray-900 rounded-xl p-4 shadow-xl space-y-3"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                  Select Category
                </h3>
                <button
                  onClick={() => setShowCategoryModal(false)}
                  className="text-gray-400 hover:text-red-500 text-xl font-bold transition-colors"
                >
                  ✕
                </button>
              </div>

              <input
                type="text"
                placeholder="Search..."
                className="w-full border border-gray-200 dark:border-gray-800 rounded-full px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-transparent text-gray-900 dark:text-white"
                value={categorySearch}
                onChange={(e) => setCategorySearch(e.target.value)}
                autoFocus
              />

              <div className="max-h-64 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-800 rounded-xl border border-gray-200 dark:border-gray-800">
                {categories
                  .filter((c) =>
                    c.category_name
                      .toLowerCase()
                      .includes(categorySearch.toLowerCase())
                  )
                  .map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 text-gray-700 dark:text-gray-300 text-sm transition-colors"
                      onClick={() => {
                        setForm({ ...form, item_category: c.category_name });
                        setShowCategoryModal(false);
                        setCategorySearch("");
                      }}
                    >
                      {c.category_name}
                    </button>
                  ))}

                <button
                  type="button"
                  className="w-full text-left px-4 py-3 font-semibold hover:bg-gray-50 dark:hover:bg-gray-800/50 text-brand-500 transition-colors text-sm"
                  onClick={() => {
                    setForm({ ...form, item_category: "Others" });
                    setShowCategoryModal(false);
                    setCategorySearch("");
                  }}
                >
                  Others
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Status */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
            Status <span className="text-red-500">*</span>
          </label>
          
          <div className="relative max-w-xs">
            <select
              className="w-full px-3 h-[38px] border border-gray-200 dark:border-gray-800 rounded-lg bg-white dark:bg-gray-900 text-gray-905 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm appearance-none shadow-sm cursor-pointer"
              value={form.product_status}
              onChange={(e) => setForm({ ...form, product_status: e.target.value })}
            >
              <option value="Active">🟢 Active</option>
              <option value="In-active">🔴 In-active</option>
              <option value="Out of stock">🟡 Out of stock</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="pt-4 border-t border-gray-150 dark:border-gray-800/80 flex justify-end gap-2">
          <button
            type="button"
            onClick={() => navigate("/products")}
            className="px-4 h-[38px] border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 text-gray-700 dark:text-gray-300 text-sm font-semibold rounded-lg transition-all"
          >
            Cancel
          </button>
          
          <button
            type="button"
            onClick={handleSubmit}
            className="px-4 h-[38px] bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold rounded-lg flex items-center gap-2 transition-all shadow-sm hover:shadow"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
            </svg>
            Save Product
          </button>
        </div>

      </div>
    </>
  );
}
