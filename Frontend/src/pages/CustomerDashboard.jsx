// frontend/src/pages/CustomerDashboard.jsx
import { useEffect, useMemo, useState } from "react";
import axios from "axios";

/**
 * CustomerDashboard
 *
 * - Fetches market pricing trends (/api/market)
 * - Fetches all crops (/api/crops/all)
 * - Fetches aggregated demand (/api/crops/demand) [optional if backend provides]
 *
 * Simple UX:
 * - Left: Pricing trends (market)
 * - Center: Crop marketplace (search + filters + list)
 * - Right: Demand summary / quick actions
 *
 * No external chart libs used (small inline SVG bars for tiny charts).
 */

function TinyBar({ values = [], height = 24, width = 80 }) {
  if (!values || values.length === 0) return <div style={{ width, height }} />;
  const max = Math.max(...values, 1);
  const barWidth = width / values.length;
  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className="inline-block align-middle"
    >
      {values.map((v, i) => {
        const h = (v / max) * height;
        const x = i * barWidth;
        return (
          <rect
            key={i}
            x={x + 1}
            y={height - h}
            width={Math.max(1, barWidth - 2)}
            height={h}
            rx="1"
            ry="1"
          />
        );
      })}
    </svg>
  );
}

export default function CustomerDashboard({ user }) {
  const [crops, setCrops] = useState([]);
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [buyForm, setBuyForm] = useState({
    cropName: "",
    quantity: "",
    comments: "",
  });

  useEffect(() => {
    const base = "http://localhost:3001/api";
    axios
      .get(`${base}/crops/all`)
      .then((r) => setCrops(r.data || []))
      .catch(() => setCrops([]));
  }, []);

  const buyCrop = async (crop) => {
    if (user._id === crop.farmerId._id) {
      alert("Cannot purchase your own Crops!");
      return;
    }
    try {
      const payload = {
        farmerId: crop.farmerId._id,
        customerId: user._id,
        cropId: crop._id,
        notes: buyForm.comments,
        quantity: buyForm.quantity,
      };
      await axios.post("http://localhost:3001/api/crops/buy", payload);
      alert("Purchase request created!");
    } catch (e) {
      alert("Failed to Purchase");
    }
  };

  return (
    <>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Customer Dashboard</h1>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600">Welcome, {user.name}!</p>
          <p className="text-gray-500 mt-2">
            View available crops and market pricing here.
          </p>
        </div>
      </div>
      <div className="p-6">
        <table className="w-full text-left border-separate border-spacing-y-3">
          <thead>
            <tr className="text-gray-600 text-sm">
              <th className="px-4 py-2">Crop Name</th>
              <th className="px-4 py-2">Quantity</th>
              <th className="px-4 py-2">Price</th>
              <th className="px-4 py-2">Farmer Name</th>
              <th className="px-4 py-2">Area</th>
              <th className="px-4 py-2">Action</th>
            </tr>
          </thead>

          <tbody>
            {crops.map((crop) => (
              <tr
                key={crop.id}
                className="bg-white shadow-sm rounded-xl overflow-hidden"
              >
                <td className="px-4 py-3">{crop.cropName}</td>
                <td className="px-4 py-3">{crop.quantity}</td>
                <td className="px-4 py-3">₹{crop.price}</td>
                <td className="px-4 py-3">{crop.farmerId.name}</td>
                <td className="px-4 py-3">{crop.area || "-"}</td>

                <td className="px-4 py-3">
                  {user._id != crop.farmerId._id && (
                    <button
                      onClick={() => {
                        setBuyForm({
                          crop: crop,
                          quantity: "",
                          comments: "",
                        });
                        setShowBuyModal(true);
                      }}
                      className="bg-green-600 text-white px-4 py-1 rounded-lg shadow hover:bg-green-700 transition"
                    >
                      Buy
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Buy crop Modal */}
        {showBuyModal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
              <h3 className="text-xl font-semibold mb-4">
                Buy Crops – {buyForm.crop.cropName}
              </h3>

              <div className="space-y-3">
                {/* Quantity */}
                <input
                  type="number"
                  placeholder="Quantity"
                  value={buyForm.quantity}
                  onChange={(e) =>
                    setBuyForm({ ...buyForm, quantity: e.target.value })
                  }
                  className="w-full border px-3 py-2 rounded"
                />

                {/* Comments */}
                <textarea
                  placeholder="Comments (optional)"
                  value={buyForm.comments}
                  onChange={(e) =>
                    setBuyForm({ ...buyForm, comments: e.target.value })
                  }
                  className="w-full border px-3 py-2 rounded h-24"
                />
              </div>

              {/* Buttons */}
              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => setShowBuyModal(false)}
                  className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400"
                >
                  Cancel
                </button>

                <button
                  onClick={() => {
                    buyCrop(buyForm.crop);
                    setShowBuyModal(false);
                  }}
                  className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700"
                >
                  Confirm Purchase
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
