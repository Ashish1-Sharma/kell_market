import { useState } from "react";
import PageMeta from "../../components/common/PageMeta";

export default function Settings() {
  const userData = JSON.parse(localStorage.getItem("userData") || "{}");

  const [username, setUsername] = useState(userData.username || "Sagar Kaliya");
  const [email, setEmail] = useState(userData.email || "sagar.kaliya@email.com");
  const [phone, setPhone] = useState(userData.phone_number || "N/A");

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = {
      ...userData,
      username,
      email,
      phone_number: phone,
    };
    localStorage.setItem("userData", JSON.stringify(updated));
    alert("Settings saved successfully!");
  };

  return (
    <>
      <PageMeta
        title="Settings | Digital Catalog Maker"
        description="Configure your digital catalog maker settings."
      />
      <div className="space-y-4 max-w-4xl mx-auto px-4 py-1.5 sm:px-6 lg:px-8">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-955 dark:text-white">Settings</h1>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Customize your account profile and catalog preferences.
          </p>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          {/* Profile Card */}
          <div className="bg-white dark:bg-white/[0.03] border border-gray-100 dark:border-gray-800 rounded-xl p-4 shadow-sm space-y-3">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">Profile Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">Name</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="mt-1 block w-full h-[38px] px-3 border border-gray-200 dark:border-gray-800 rounded-lg bg-transparent text-gray-955 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 transition-shadow text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 block w-full h-[38px] px-3 border border-gray-200 dark:border-gray-800 rounded-lg bg-transparent text-gray-955 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 transition-shadow text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">Phone Number</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="mt-1 block w-full h-[38px] px-3 border border-gray-200 dark:border-gray-800 rounded-lg bg-transparent text-gray-955 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 transition-shadow text-sm"
                />
              </div>

              {/* <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Membership validity</label>
                <input
                  type="text"
                  value={userData.validity || "Valid till 25 Sep 2028"}
                  disabled
                  className="mt-1 block w-full px-4 py-2 border border-gray-150 dark:border-gray-850 rounded-xl bg-gray-50 dark:bg-gray-800/40 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                />
              </div> */}
            </div>
          </div>

          {/* Preferences Card */}
          {/* <div className="bg-white dark:bg-white/[0.03] border border-gray-100 dark:border-gray-800 rounded-2xl p-6 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Catalog Preferences</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Default Currency</label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="mt-1 block w-full px-4 py-2 border border-gray-200 dark:border-gray-800 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 transition-shadow"
                >
                  <option>INR (₹)</option>
                  <option>USD ($)</option>
                  <option>EUR (€)</option>
                  <option>GBP (£)</option>
                </select>
              </div>

              <div className="flex items-center justify-between md:pt-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">Email Notifications</h3>
                  <p className="text-xs text-gray-400 dark:text-gray-500">Receive weekly catalog visitor reports.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setNotifications(!notifications)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                    notifications ? "bg-brand-500" : "bg-gray-200 dark:bg-gray-850"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      notifications ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            </div>
          </div> */}

          {/* Form Actions */}
          <div className="flex justify-end gap-2">
            <button
              type="submit"
              className="px-4 py-1.5 h-[38px] bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold rounded-lg shadow-sm hover:shadow transition-all"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
