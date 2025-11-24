// frontend/src/pages/CropsMarket.jsx
import { useEffect, useState } from "react";
import api from "../api/axios";

export default function CropsMarket({ onClose = null }) {
  const [crops, setCrops] = useState([]); // will hold server objects: { key, name, totalYield, allocated, remaining, unit, price }
  const [selections, setSelections] = useState({}); // { [key]: number }
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Helper: read farmerId from localStorage (if attachUser middleware doesn't populate req.user)
  const getFarmerIdFromStorage = () => {
    try {
      const raw = localStorage.getItem("agriapp:user");
      if (!raw) return null;
      const u = JSON.parse(raw);
      return u?._id || u?.id || null;
    } catch {
      return null;
    }
  };

  // Load market from server
  useEffect(() => {
    let mounted = true;
    setLoading(true);
    api.get("/market")
      .then((res) => {
        if (!mounted) return;
        const data = res.data || [];
        setCrops(data);
        // initialize selections to 0 for each crop key if not already set
        const init = {};
        data.forEach(c => {
          init[c.key] = selections[c.key] || 0;
        });
        setSelections(init);
      })
      .catch((err) => {
        console.error("Failed to load market:", err);
        setError("Failed to load market data");
      })
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run once on mount

  // helper to compute totals
  const totalSelected = Object.values(selections).reduce((s, n) => s + (Number(n) || 0), 0);
  const totalAvailable = crops.reduce((s, c) => s + (Number(c.totalYield) || 0), 0);
  const totalAllocated = crops.reduce((s, c) => s + (Number(c.allocated) || 0), 0);
  const remainingOverall = Math.max(0, totalAvailable - totalAllocated);

  // When user edits a number, validate against server-provided remaining for that crop
  const handleQuantityChange = (cropKey, quantity) => {
    // Ensure number
    const q = Number(quantity) || 0;
    const crop = crops.find(c => c.key === cropKey);
    if (!crop) return;

    // allowedMax = crop.remaining + (current selection for this crop)
    // Reason: server's remaining doesn't include this farmer's previous selection,
    // but server handles replacing previous selection on submit. This logic prevents
    // overshooting the global remaining from the UI side.
    const currentSel = Number(selections[cropKey] || 0);
    const serverRemaining = Number(crop.remaining || 0);
    const maxAllowed = serverRemaining + currentSel;

    if (q < 0) return; // ignore negatives
    if (q <= maxAllowed) {
      setSelections(prev => ({ ...prev, [cropKey]: q }));
    } else {
      // If user tries to exceed, clamp to maxAllowed
      setSelections(prev => ({ ...prev, [cropKey]: maxAllowed }));
    }
  };

  const submitSelections = async () => {
    setError("");
    // don't submit if nothing selected
    if (totalSelected === 0) {
      setError("Select at least one crop quantity before submitting.");
      return;
    }

    // build payload: server expects { selections: { key: number } } and optionally farmerId
    const payload = { selections: {} };
    for (const k of Object.keys(selections)) {
      const v = Number(selections[k]) || 0;
      if (v > 0) payload.selections[k] = v;
    }

    // include farmerId when available (attachUser middleware may make it unnecessary)
    const farmerId = getFarmerIdFromStorage();
    if (farmerId) payload.farmerId = farmerId;

    setSubmitting(true);
    try {
      const res = await api.post("/market/market-selections", payload);
      // response contains updated market in res.data.market per backend above
      if (res.data && res.data.market) {
        setCrops(res.data.market);
      } else if (res.data && res.data.message) {
        // fallback: reload market
        const r = await api.get("/market");
        setCrops(r.data || []);
      }
      alert("Selections saved");
      // Optionally clear selections (keep them so farmer sees what they submitted)
      // setSelections({});
    } catch (err) {
      console.error("Submit failed:", err);
      // Show useful message from server if present
      const msg = err?.response?.data?.message || err?.message || "Failed to submit selections";
      const details = err?.response?.data?.details;
      setError(msg + (details ? " — " + details.join("; ") : ""));
    } finally {
      setSubmitting(false);
      // Refresh latest market state
      try {
        const r = await api.get("/market");
        setCrops(r.data || []);
      } catch (_) { /* ignore */ }
    }
  };

  if (loading) {
    return <div className="p-6">Loading market…</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold mb-1">Available Crops for Production</h1>
            <p className="text-gray-600">Select how much you can produce this year</p>
          </div>
          {onClose && (
            <div>
              <button
                onClick={onClose}
                className="bg-gray-200 px-3 py-2 rounded hover:bg-gray-300"
              >
                ← Back to Dashboard
              </button>
            </div>
          )}
        </div>

        {error && <div className="mb-4 text-red-600">{error}</div>}

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-600">Total Available</div>
            <div className="text-2xl font-bold text-blue-600">{totalAvailable} tons</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-600">Your Selection</div>
            <div className="text-2xl font-bold text-green-600">{totalSelected} tons</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-600">Remaining (global)</div>
            <div className="text-2xl font-bold text-orange-600">{remainingOverall} tons</div>
          </div>
        </div>

        {/* Crops Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {crops.map(crop => {
            const curSel = Number(selections[crop.key] || 0);
            const serverRemaining = Number(crop.remaining || 0);
            return (
              <div key={crop.key} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold">{crop.name}</h3>
                    <p className="text-sm text-gray-500">Available: {crop.totalYield} {crop.unit}</p>
                    <p className="text-sm text-green-600 font-semibold">Remaining (global): {serverRemaining} {crop.unit}</p>
                  </div>
                  <div className="text-lg font-bold text-green-600">₹{Number(crop.price).toLocaleString()}</div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">
                    How many {crop.unit} can you produce?
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={crop.totalYield}
                    value={curSel}
                    onChange={(e) => handleQuantityChange(crop.key, e.target.value)}
                    className="w-full border rounded px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0"
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    Tip: you can allocate up to the global remaining ({serverRemaining}) plus your current value ({curSel}).
                  </div>
                </div>

                <div className="bg-gray-100 rounded p-3 text-sm">
                  <div className="text-gray-600">Your production value:</div>
                  <div className="text-lg font-bold text-blue-600">
                    ₹{(curSel * Number(crop.price || 0)).toLocaleString()}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Submit Button */}
        <div className="flex justify-center">
          <button
            onClick={submitSelections}
            disabled={totalSelected === 0 || submitting}
            className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? "Saving…" : "Submit Production Plan"}
          </button>
        </div>
      </div>
    </div>
  );
}
