import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import axios from "axios";
import { toast } from "react-toastify";
import { BASE_URL } from "../../utils/constants";

interface Category {
  id: number;
  category_name: string;
}

const extractJson = (data: any) => {
  if (typeof data === "object") return data;
  try {
    const jsonStart = data.indexOf("{");
    return JSON.parse(data.slice(jsonStart));
  } catch {
    return null;
  }
};

export default function Updatedeletecategory() {
  const userId = JSON.parse(localStorage.getItem("userData") || "{}").user_id;
  const navigate = useNavigate();

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);

  // edit modal
  const [editCategory, setEditCategory] = useState<Category | null>(null);
  const [newName, setNewName] = useState("");


  // delete modal
  const [deleteCategory, setDeleteCategory] =
    useState<Category | null>(null);

  // sort screen state
  const [isSortingMode, setIsSortingMode] = useState(false);
  const [sortedCategories, setSortedCategories] = useState<Category[]>([]);
  const [savingOrder, setSavingOrder] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  /* ---------------- FETCH CATEGORIES ---------------- */
  const fetchCategories = () => {
    setLoading(true);

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
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  /* ---------------- UPDATE CATEGORY ---------------- */
  const handleUpdate = async () => {
    if (!editCategory || !newName.trim()) {
      toast.error("Category name required");
      return;
    }

    try {
      const params = new URLSearchParams();
      params.append("user_id", String(userId));
      params.append("category_name", editCategory.category_name);
      params.append("new_category_name", newName);
      params.append("action_type", "UPDATE");

      const res = await axios.post(
        `${BASE_URL}/categoryapi_new.php`,
        params,
        { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
      );

      const parsed = extractJson(res.data);

      if (parsed?.res_code === "200") {
        toast.success("Category updated");
        setEditCategory(null);
        setNewName("");
        fetchCategories();
      } else {
        toast.error(parsed?.message || "Update failed");
      }
    } catch {
      toast.error("Update failed");
    }
  };

  /* ---------------- DELETE CATEGORY ---------------- */
const confirmDelete = async () => {
  if (!deleteCategory) return;

  try {
    const params = new URLSearchParams();
    params.append("user_id", String(userId));
    params.append("cat_id", String(deleteCategory.id));

    const res = await axios.post(
      `${BASE_URL}/deletecategory_new.php`,
      params,
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );

    // ✅ FIX: parse response exactly like others
    const parsed = extractJson(res.data);

    if (parsed?.res_code === "200") {
      toast.success("Category deleted");
      setDeleteCategory(null);
      fetchCategories();
    } else {
      toast.error(parsed?.message || "Delete failed");
    }

  } catch (err) {
    console.error(err);
    toast.error("Delete failed");
  }
};

  /* ---------------- DRAG AND DROP HANDLERS ---------------- */
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", String(index));
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const updated = [...sortedCategories];
    const draggedItem = updated[draggedIndex];
    updated.splice(draggedIndex, 1);
    updated.splice(index, 0, draggedItem);

    setDraggedIndex(index);
    setSortedCategories(updated);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  /* ---------------- SAVE CATEGORY ORDER ---------------- */
  const handleSaveOrder = async () => {
    setSavingOrder(true);
    try {
      const params = new URLSearchParams();
      params.append("user_id", String(userId));
      params.append("action_type", "SORT");
      
      const sortedIds = sortedCategories.map((c) => c.id).join(",");
      params.append("sorted_ids", sortedIds);

      const res = await axios.post(
        `${BASE_URL}/categoryapi_new.php`,
        params,
        { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
      );

      const parsed = extractJson(res.data);
      if (parsed?.res_code === "200") {
        toast.success("Category order updated successfully");
        setIsSortingMode(false);
        fetchCategories();
      } else {
        toast.error(parsed?.message || "Failed to save category order");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to save category order");
    } finally {
      setSavingOrder(false);
    }
  };

  const handleResetOrder = () => {
    setSortedCategories([...categories]);
  };

  /* ---------------- UI ---------------- */
  return (
    <>
      {!isSortingMode ? (
        /* ================= NORMAL SCREEN ================= */
        <div className="space-y-4">
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-950 dark:text-white">Manage Categories</h1>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Manage all your product categories
              </p>
            </div>
            
            <div className="flex gap-3 w-full sm:w-auto shrink-0">
              <button
                onClick={() => {
                  setSortedCategories([...categories]);
                  setIsSortingMode(true);
                }}
                className="flex-1 sm:flex-initial px-4 py-2 border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-805/50 text-xs font-semibold rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {/* Outlined sort categories button with sorting sliders/lines icon */}
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                </svg>
                Sort Categories
              </button>
              <button
                onClick={() => navigate("/addCategory")}
                className="flex-1 sm:flex-initial px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                + Add Category
              </button>
            </div>
          </div>

          {/* Categories Grid */}
          <div className="bg-white dark:bg-white/[0.03] border border-gray-100 dark:border-gray-800 rounded-xl p-4 shadow-sm">
            {loading ? (
              <p className="text-center text-gray-500 py-12">Loading categories...</p>
            ) : categories.length === 0 ? (
              <p className="text-center text-gray-500 py-12">No categories found.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {categories.map((cat) => (
                  <div
                    key={cat.id}
                    className="flex items-center justify-between border border-gray-100 dark:border-gray-800/80 rounded-xl px-5 py-3.5 bg-white dark:bg-gray-900 shadow-sm"
                  >
                    <span className="font-semibold text-gray-800 dark:text-gray-200 text-base">
                      {cat.category_name}
                    </span>

                    <div className="flex items-center gap-4 shrink-0">
                      {/* EDIT */}
                      <button
                        onClick={() => {
                          setEditCategory(cat);
                          setNewName(cat.category_name);
                        }}
                        className="text-blue-600 dark:text-blue-400 hover:underline text-sm font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                        Edit
                      </button>

                      {/* DELETE */}
                      <button
                        onClick={() => setDeleteCategory(cat)}
                        className="text-red-600 dark:text-red-400 hover:underline text-sm font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Total categories count footer */}
            {!loading && (
              <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800 text-sm text-gray-500 dark:text-gray-400 font-medium">
                Total Categories: {categories.length}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* ================= SORT CATEGORIES SCREEN ================= */
        <div className="space-y-4">
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <button
                onClick={() => setIsSortingMode(false)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50 text-xs font-semibold rounded-xl transition-all shadow-sm cursor-pointer bg-white dark:bg-gray-900"
              >
                {/* Back Arrow */}
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Categories
              </button>
            </div>

            <div className="text-center sm:absolute sm:left-1/2 sm:-translate-x-1/2">
              <h1 className="text-xl font-bold text-gray-950 dark:text-white">Sort Categories</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Drag and drop categories to change the order
              </p>
            </div>

            <div className="flex gap-3 w-full sm:w-auto shrink-0 justify-end">
              <button
                onClick={handleResetOrder}
                className="flex-1 sm:flex-initial px-4 py-2 border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-850/50 text-xs font-semibold rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer bg-white dark:bg-gray-900"
              >
                {/* Reset Outlined button with refresh icon */}
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 8H18.5" />
                </svg>
                Reset
              </button>
              <button
                onClick={handleSaveOrder}
                disabled={savingOrder}
                className="flex-1 sm:flex-initial px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {/* Save Order solid button with floppy disk icon */}
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                </svg>
                {savingOrder ? "Saving..." : "Save Order"}
              </button>
            </div>
          </div>

          {/* Info Banner alert box */}
          <div className="flex items-center gap-2.5 px-4 py-3 bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 text-blue-700 dark:text-blue-400 rounded-xl text-xs font-medium">
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Drag and drop categories to reorder them. Changes will be saved when you click Save Order.</span>
          </div>

          {/* Sorting grid of categories (3 columns) */}
          <div className="bg-white dark:bg-white/[0.03] border border-gray-100 dark:border-gray-800 rounded-xl p-4 shadow-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {sortedCategories.map((cat, idx) => (
                <div
                  key={cat.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, idx)}
                  onDragOver={(e) => handleDragOver(e, idx)}
                  onDragEnd={handleDragEnd}
                  className={`flex items-center justify-between p-3.5 border rounded-xl bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 transition-all select-none ${
                    draggedIndex === idx 
                      ? "opacity-30 border-purple-500 bg-purple-50/10 scale-[0.98]" 
                      : "hover:border-gray-200 dark:hover:border-gray-800 hover:shadow-sm"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1">
                      {/* grab handle ⠿ (6-dot) icon */}
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M7 2a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zM7 6a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm-3 4a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm-3 4a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0z"/>
                      </svg>
                    </div>
                    <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                      {cat.category_name}
                    </span>
                  </div>
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-lg bg-gray-50 dark:bg-gray-800 text-xs font-bold text-gray-500 dark:text-gray-400 border border-gray-100 dark:border-gray-700">
                    {idx + 1}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ---------------- EDIT MODAL ---------------- */}
      {editCategory && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 w-full max-w-sm rounded-2xl p-6 shadow-xl border border-gray-100 dark:border-gray-800">
            <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">
              Update Category
            </h3>

            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="w-full border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 rounded-xl px-4 py-2.5 mb-5 focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-white"
              placeholder="New category name"
            />

            <div className="flex gap-3">
              <button
                onClick={handleUpdate}
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2.5 rounded-xl font-semibold transition-colors cursor-pointer"
              >
                Update
              </button>
              <button
                onClick={() => setEditCategory(null)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 py-2.5 rounded-xl font-semibold transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------------- DELETE MODAL ---------------- */}
      {deleteCategory && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 w-full max-w-sm rounded-2xl p-6 shadow-xl border border-gray-100 dark:border-gray-800">
            <h3 className="text-lg font-bold mb-3 text-red-600 dark:text-red-400">
              Delete Category
            </h3>

            <p className="mb-5 text-gray-600 dark:text-gray-300 text-sm">
              Are you sure you want to delete{" "}
              <strong className="text-gray-900 dark:text-white">{deleteCategory.category_name}</strong>?
              <br />
              This will also delete all products under it.
            </p>

            <div className="flex gap-3">
              <button
                onClick={confirmDelete}
                className="flex-1 bg-red-650 hover:bg-red-700 text-black hover:text-white bg-red-400 py-2.5 rounded-xl font-semibold transition-colors cursor-pointer"
              >
                Delete
              </button>
              <button
                onClick={() => setDeleteCategory(null)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 py-2.5 rounded-xl font-semibold transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
