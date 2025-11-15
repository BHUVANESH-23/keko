// frontend/src/pages/Login.jsx
import { useState } from "react";
import api from "../api/axios";

const ROLES = [
  { key: "farmer", label: "Farmer", blurb: "Manage plots, crops & link transporter vehicles." },
  { key: "transporter", label: "Transporter", blurb: "Offer vehicles and manage assignments." },
  { key: "customer", label: "Customer", blurb: "See demand & pricing to source efficiently." },
  { key: "helper", label: "Helper", blurb: "Assist farmers and manage tasks." },
];

export default function Login({ onLogin }) {
  const [selectedRole, setSelectedRole] = useState(null);
  const [form, setForm] = useState({ name: "", phone: "" });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  // Optional: keep only digits in state while typing
  const setPhone = (val) => {
    const digitsOnly = val.replace(/\D/g, '');
    setForm((f) => ({ ...f, phone: digitsOnly }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    if (!selectedRole) return setErr("Please choose a role card first.");
    if (!form.name || !form.phone) return setErr("Name and phone are required.");
    try {
      setLoading(true);
      const res = await api.post("/auth/register", {
        name: form.name.trim(),
        phone: form.phone.trim(),
        role: selectedRole,
      });
      localStorage.setItem("agriapp:user", JSON.stringify(res.data));
      onLogin(res.data);
    } catch (error) {
      console.error(error);
      setErr(error?.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-5xl">
        <h1 className="text-3xl font-bold text-center mb-8">AgriApp Login</h1>

        {/* Role Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {ROLES.map((r) => (
            <button
              key={r.key}
              onClick={() => setSelectedRole(r.key)}
              className={`rounded-2xl p-5 border shadow-sm text-left transition
                ${selectedRole === r.key ? "ring-2 ring-blue-500 border-blue-400" : "hover:shadow-md"}`}
            >
              <div className="text-xl font-semibold">{r.label}</div>
              <p className="text-sm text-gray-600 mt-2">{r.blurb}</p>
              <div className={`mt-4 inline-block text-xs px-2 py-1 rounded
                  ${selectedRole === r.key ? "bg-blue-600 text-white" : "bg-gray-200"}`}>
                {selectedRole === r.key ? "Selected" : "Choose"}
              </div>
            </button>
          ))}
        </div>

        {/* Simple Name/Phone Form */}
        <form onSubmit={submit} className="bg-white rounded-2xl border p-6 max-w-xl mx-auto">
          <div className="grid gap-4">
            <div>
              <label className="block text-sm font-medium">Name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="mt-1 w-full border rounded px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Raju"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Phone</label>
              <input
                type="tel"
                inputMode="numeric"
                pattern="[0-9]*"
                value={form.phone}
                onChange={(e) => setPhone(e.target.value)}
                className="mt-1 w-full border rounded px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="9876543210"
              />
            </div>
            {err && <div className="text-red-600 text-sm">{err}</div>}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl py-2 font-semibold bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Signing in..." : selectedRole ? `Continue as ${selectedRole}` : "Select a role to continue"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
