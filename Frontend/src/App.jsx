import { useEffect, useState } from "react";
import api from "./api/axios";
import Login from "./pages/Login";
import CropsMarket from "./pages/CropsMarket";

import FarmerDashboard from "./pages/FarmerDashboard";
import TransporterDashboard from "./pages/TransporterDashboard";
import HelperDashboard from "./pages/HelperDashboard";
import CustomerDashboard from "./pages/CustomerDashboard";

export default function App() {
  const [user, setUser] = useState(null);
  const [bootDone, setBootDone] = useState(false);
  // default to "login" as requested
  const [currentPage, setCurrentPage] = useState("login"); // "login" | "app" | "crops"

  useEffect(() => {
    const raw = localStorage.getItem("agriapp:user");
    if (!raw) {
      setBootDone(true);
      return;
    }
    // validate token/session
    api.get("/auth/me").then((res) => {
      setUser(res.data);
      setCurrentPage("app");
      setBootDone(true);
    }).catch(() => {
      localStorage.removeItem("agriapp:user");
      setBootDone(true);
    });
  }, []);

  const logout = () => {
    localStorage.removeItem("agriapp:user");
    setUser(null);
    // go back to login page on logout
    setCurrentPage("login");
  };

  if (!bootDone) return <div className="p-10">Loading...</div>;

  // If showing the crops page explicitly (only reachable after login by farmer button),
  // render the CropsMarket and allow it to return to dashboard via onClose.
  if (currentPage === "crops") {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* show topbar when logged in */}
        {user && (
          <div className="w-full flex justify-between items-center px-4 py-3 border-b bg-white">
            <div className="font-semibold">AgriApp</div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600">{user.name} • {user.role}</span>
              <button onClick={logout} className="text-sm px-3 py-1 rounded bg-gray-200 hover:bg-gray-300">
                Logout
              </button>
            </div>
          </div>
        )}
        <CropsMarket onClose={() => setCurrentPage("app")} />
      </div>
    );
  }

  // Show login if not logged in or explicit login page
  if (!user || currentPage === "login") {
    return (
      <div>
        <Login onLogin={(userData) => {
          localStorage.setItem("agriapp:user", JSON.stringify(userData));
          setUser(userData);
          setCurrentPage("app");
        }} />
      </div>
    );
  }

  // When logged in and on the app page, show topbar + role dashboard
  const TopBar = () => (
    <div className="w-full flex justify-between items-center px-4 py-3 border-b bg-white">
      <div className="font-semibold">AgriApp</div>
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-600">{user.name} • {user.role}</span>
        <button onClick={logout} className="text-sm px-3 py-1 rounded bg-gray-200 hover:bg-gray-300">
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <TopBar />
      {user.role === "farmer" && <FarmerDashboard user={user} setCurrentPage={setCurrentPage} />}
      {user.role === "transporter" && <TransporterDashboard user={user} />}
      {user.role === "helper" && <HelperDashboard user={user} />}
      {user.role === "customer" && <CustomerDashboard user={user} />}
    </div>
  );
}
