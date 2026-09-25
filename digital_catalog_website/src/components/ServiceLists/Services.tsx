import { useNavigate } from "react-router";
// import { FileIcon } from "../../icons";
// import { authConstants } from "../../utils/constants";

const serviceSet = [
   {
    id:1 ,
    name: "Add Category",
    description: "Add New Category .",
    icon: "/Iconss/application.png",
    pathTo: "/addCategory",
  },
   {
    id:2 ,
    name: "Update  Category",
    description: "Update and Delete Category .",
    icon: "/Iconss/add.png",
    pathTo: "/category",
  },
   {
    id: 3,
    name: "Add Product",
    description: "Add New Products.",
    icon:"/Iconss/add-product.png",
    pathTo: "/addproducts",
  },
  {
    id: 4,
    name: "Update Product",
    description: "Update and Delete Product",
    icon: "/Iconss/product-development.png",
    pathTo: "/products",
  },
 
  // {
  //   id:3 ,
  //   name: "Update Product Category",
  //   description: "Update and Delete Category .",
  //   icon: "/admin/Iconss/add.png",
  //   pathTo: "/category",
  // },
  // {
  //   id: 2,
  //   name: "Bulk Stock Upload ",
  //   description: "Add new bulk stock items to the inventory.",
  //   icon: <FileIcon className="text-gray-800 w-6 h-6 dark:text-white/90" />,
  //   pathTo: "/bulk-stock",
  // },
  // {
  //   id: 3,
  //   name: "View All Stock",
  //   description: "View, update, and manage all stock items in one place.",
  //   icon: <FileIcon className="text-gray-800 w-6 h-6 dark:text-white/90" />,
  //   pathTo: "/view-stock",
  // },
  // {
  //   id: 4,
  //   name: "Sale / Stock Out",
  //   description: "Process sales and manage stock reductions efficiently.",
  //   icon: <FileIcon className="text-gray-800 w-6 h-6 dark:text-white/90" />,
  //   pathTo: "/stock-out",
  // },
  // {
  //   id: 5,
  //   name: "Saved Invoices",
  //   description: "Access all your sales invoices for quick reference.",
  //   icon: <FileIcon className="text-gray-800 w-6 h-6 dark:text-white/90" />,
  //   pathTo: "/saved-invoices",
  // },
  // {
  //   id: 12,
  //   name: "Due Reminder",
  //   description: "Manage customer invoices and send reminders.",
  //   icon: <FileIcon className="text-gray-800 w-6 h-6 dark:text-white/90" />,
  //   pathTo: "/remainders",
  // },
  // {
  //   id: 6,
  //   name: "Expiry Alert",
  //   description: "Monitor medicines near expiration as per settings.",
  //   icon: <FileIcon className="text-gray-800 w-6 h-6 dark:text-white/90" />,
  //   pathTo: "/expiry-alerts",
  // },
  // {
  //   id: 7,
  //   name: "Expired Alerts",
  //   description: "Monitor medicines which are already exipred.",
  //   icon: <FileIcon className="text-gray-800 w-6 h-6 dark:text-white/90" />,
  //   pathTo: "/expired-alerts",
  // },
  // {
  //   id: 8,
  //   name: "Low Stock Alerts",
  //   description: "Stay informed about items running low on stock.",
  //   icon: <FileIcon className="text-gray-800 w-6 h-6 dark:text-white/90" />,
  //   pathTo: "/low-stock-alerts",
  // },
  // {
  //   id: 9,
  //   name: "Manage Orders",
  //   description: "Generate order lists and invoices for efficient procurement.",
  //   icon: <FileIcon className="text-gray-800 w-6 h-6 dark:text-white/90" />,
  //   pathTo: "/manage-order",
  // },
  // {
  //   id: 10,
  //   name: "Order List Report",
  //   description: "Review and manage order reports seamlessly.",
  //   icon: <FileIcon className="text-gray-800 w-6 h-6 dark:text-white/90" />,
  //   pathTo: "/order-report",
  // },
  // {
  //   id: 11,
  //   name: "Refund Orders",
  //   description: "Handle refunds and manage return orders effectively.",
  //   icon: <FileIcon className="text-gray-800 w-6 h-6 dark:text-white/90" />,
  //   pathTo: "/refund-orders",
  // },
  // ...(localStorage.getItem(authConstants.USER_TYPE) === parentUser
  //   ? [
  //       {
  //         id: 10,
  //         name: "Log History",
  //         description: "Track and review the history of all past orders.",
  //         icon: (
  //           <FileIcon className="text-gray-800 w-6 h-6 dark:text-white/90" />
  //         ),
  //         pathTo: "/order-history",
  //       },
  //     ]
  //   : []),
];

export default function ServicesLists() {
  const navigate = useNavigate();

  const handleCardClick = (pathTo: any) => {
    navigate(pathTo);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
      {serviceSet.map((service) => (
        <div
          key={service.id}
          className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6 cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => handleCardClick(service.pathTo)}
        >
          <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
            <img
  src={service.icon}
  alt={service.name}
  className="w-8 h-8 object-contain"
/>
          </div>
          <div className="flex items-start flex-col mt-5">
            <h4 className="mt-2 font-bold text-gray-800 text-lg dark:text-white/90">
              {service.name}
            </h4>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              {service.description}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
