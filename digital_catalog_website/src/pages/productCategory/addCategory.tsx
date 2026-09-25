import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { BASE_URL } from "../../utils/constants";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";

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

export default function AddCategory() {
  const userId = JSON.parse(localStorage.getItem("userData") || "{}").user_id;

  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategory, setNewCategory] = useState("");
  const [loading, setLoading] = useState(false);

  /* ================= FETCH CATEGORIES ================= */
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
    if (userId) fetchCategories();
  }, [userId]);

  /* ================= ADD CATEGORY ================= */
  const handleAddCategory = async () => {
    if (!newCategory.trim()) {
      toast.error("Please enter category name");
      return;
    }

    const params = new URLSearchParams();
    params.append("user_id", String(userId));
    params.append("category_name", newCategory);
    params.append("action_type", "NEW");

    try {
      const res = await axios.post(
        `${BASE_URL}/categoryapi_new.php`,
        params,
        { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
      );

      const parsed = extractJson(res.data);

      if (parsed?.res_code === "200") {
        toast.success("Category added");
        setNewCategory("");
        fetchCategories();
      } else {
        toast.error(parsed?.message || "Category already exists");
      }
    } catch {
      toast.error("Failed to add category");
    }
  };

  /* ================= UI ================= */
  return (
    <>
      <PageBreadcrumb pageTitle="Add Category" />

      <div className="max-w-4xl mx-auto bg-white p-4 rounded-lg shadow space-y-4">
        
        {/* ADD CATEGORY INPUT */}
        <div className="flex gap-3">
          <input
            className="flex-1 border rounded-lg px-3.5 py-1.5 h-[38px] text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            placeholder="Enter category name"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
          />
          <button
            onClick={handleAddCategory}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 h-[38px] rounded-lg text-sm font-semibold transition cursor-pointer"
          >
            + Add
          </button>
        </div>

        {/* CATEGORY LIST */}
        <div>
          <h3 className="text-base font-semibold mb-3">All Categories</h3>

          {loading ? (
            <p className="text-sm text-gray-500">Loading...</p>
          ) : categories.length === 0 ? (
            <p className="text-sm text-gray-500">No categories found</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {categories.map((cat) => (
                <div
                  key={cat.id}
                  className="border rounded-lg px-3.5 py-2 text-sm text-gray-800 bg-gray-50"
                >
                  {cat.category_name}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
