import { Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import SignIn from "./pages/AuthPages/SignIn";
import SignUp from "./pages/AuthPages/SignUp";
import NotFound from "./pages/OtherPage/NotFound";

import UserProfiles from "./pages/UserProfiles";
import Videos from "./pages/UiElements/Videos";
import Images from "./pages/UiElements/Images";
import Alerts from "./pages/UiElements/Alerts";
import Badges from "./pages/UiElements/Badges";
import Avatars from "./pages/UiElements/Avatars";
import Buttons from "./pages/UiElements/Buttons";
import LineChart from "./pages/Charts/LineChart";
import BarChart from "./pages/Charts/BarChart";
import Calendar from "./pages/Calendar";
import BasicTables from "./pages/Tables/BasicTables";
import FormElements from "./pages/Forms/FormElements";
import Blank from "./pages/Blank";

import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import Home from "./pages/Dashboard/Home";
import ProtectedRoute from "./routes/protectedRoute";
import ProductList from "./pages/updatedelete/productlist";
import AddProduct from "./pages/Addproduct/addProduct";
import Updatedeletecategory from "./pages/productCategory/updatedeletecategory";
import Orders from "./pages/Orders/orders";
import Customers from "./pages/Customers/customers";
import CustomerOrders from "./pages/Customers/customerOrders";
import Settings from "./pages/Settings/settings";

import { isAuthenticated } from "./utils/auth"; // ✅ IMPORTANT
import AddCategory from "./pages/productCategory/addCategory";

export default function App() {
  return (
    <>
      <ScrollToTop />

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        draggable
        theme="colored"
        style={{ zIndex: 99999 }}
      />

      <Routes>
        {/* 🔑 ROOT (SMART REDIRECT) */}
        <Route
          path="/"
          element={
            isAuthenticated()
              ? <Navigate to="/home" replace />
              : <Navigate to="/signin" replace />
          }
        />

        {/* 🌐 PUBLIC */}
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />

        {/* 🔐 PROTECTED */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/home" element={<Home />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/customers/:id/orders" element={<CustomerOrders />} />
            <Route path="/products" element={<ProductList />} />
            <Route path="/addproducts" element={<AddProduct />} />
            <Route path="/category" element={<Updatedeletecategory />} />
            <Route path="/addCategory" element={<AddCategory />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/profile" element={<UserProfiles />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/blank" element={<Blank />} />
            <Route path="/form-elements" element={<FormElements />} />
            <Route path="/basic-tables" element={<BasicTables />} />
            <Route path="/alerts" element={<Alerts />} />
            <Route path="/avatars" element={<Avatars />} />
            <Route path="/badge" element={<Badges />} />
            <Route path="/buttons" element={<Buttons />} />
            <Route path="/images" element={<Images />} />
            <Route path="/videos" element={<Videos />} />
            <Route path="/line-chart" element={<LineChart />} />
            <Route path="/bar-chart" element={<BarChart />} />
          </Route>
        </Route>

        {/* ❌ FALLBACK */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}
