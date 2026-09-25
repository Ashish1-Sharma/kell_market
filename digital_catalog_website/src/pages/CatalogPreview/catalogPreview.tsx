import { useEffect, useState } from "react";
import axios from "axios";
// import {
//   BoxIconLine,
//   GroupIcon,
// } from "../../icons";
import { BASE_URL } from "../../utils/constants";

interface Counts {
  item_master_count: number;
  product_category_count: number;
}

const userData = JSON.parse(localStorage.getItem("userData") || "{}");

export default function CatalogPreview() {
  const [counts, setCounts] = useState<Counts>({
    item_master_count: 0,
    product_category_count: 0,
  });

  /* 🔹 FETCH COUNTS (NO DESIGN CHANGE) */
  useEffect(() => {
    if (!userData.user_id) return;

    axios
      .get(`${BASE_URL}/getPrductAndCategoryCount.php`, {
        params: { user_id: userData.user_id },
      })
      .then((res) => {
        if (res.data?.res_code === "200") {
          setCounts(res.data.counts);
        }
      })
      .catch(() => console.error("Failed to load counts"));
  }, []);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-1 md:gap-6 w-full">

      {/* CATEGORY */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex flex-row pb-2">
          <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800 mr-4">
            <img
              src={`${import.meta.env.BASE_URL}Iconss/report.png`}
              alt="Category"
              className="w-7 h-7 object-contain"
            />
          </div>
          <div>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              {counts.product_category_count}
            </h4>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Category
            </span>
          </div>
        </div>

        <div className="flex flex-row pt-2">
          <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800 mr-4">
            <img
              src={`${import.meta.env.BASE_URL}Iconss/features.png`}
              alt="Category"
              className="w-7 h-7 object-contain"
            />
          </div>
          <div>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              {counts.item_master_count}
            </h4>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Products
            </span>
          </div>
        </div>
      </div>

    </div>
  );
}
