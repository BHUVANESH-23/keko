"use client";
import axios from "axios";
import { useEffect, useState } from "react";

export default function SeedsMarket({ user, onClose = null }) {
  const [seeds, setSeeds] = useState([]);

  useEffect(() => {
    const base = "http://localhost:3001/api";
    axios
      .get(`${base}/seeds/all`)
      .then((r) => setSeeds(r.data || []))
      .catch(() => setSeeds([]));
  }, []);

  const [showBuyModal, setShowBuyModal] = useState(false);
  const [buyForm, setBuyForm] = useState({
    seedName: "",
    quantity: "",
    comments: "",
  });

  const buySeed = async (seed) => {
    if (user._id === seed.farmerId._id) {
      alert("Cannot purchase your own Seeds!");
      return;
    }
    try {
      const payload = {
        farmerId: user._id,
        ownerId: seed.farmerId._id,
        seedId: seed._id,
        notes: buyForm.comments,
        quantity: buyForm.quantity,
      };
      await axios.post("http://localhost:3001/api/seeds/buy", payload);
      alert("Purchase request created!");
    } catch (e) {
      alert("Failed to Purchase");
    }
  };

  const handleDeleteSeed = async (_id) => {
    if (confirm("Are you sure you want to delete?")) {
      try {
        await axios.delete("http://localhost:3001/api/seeds/delete", _id);
        alert("Seed Deleted successfully!");
      } catch (e) {
        alert("Failed to delete seed!");
      }

      try {
        const r = await axios.get(`http://localhost:3001/api/seeds/all`);
        setSeeds(r?.data || []);
      } catch (e) {
        alert("Unable to load seed details!");
      }
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold">Seed Management</h2>
        <div className="flex items-center justify-between">
          {onClose && (
            <div>
              <button
                onClick={onClose}
                className="bg-gray-200 px-3 mr-[20px] py-2 rounded hover:bg-gray-300"
              >
                ← Back to Dashboard
              </button>
            </div>
          )}
        </div>
      </div>
      <table className="w-full text-left border-separate border-spacing-y-3">
        <thead>
          <tr className="text-gray-600 text-sm">
            <th className="px-4 py-2">Seed Name</th>
            <th className="px-4 py-2">Quantity</th>
            <th className="px-4 py-2">Price</th>
            <th className="px-4 py-2">Farmer Name</th>
            <th className="px-4 py-2">Farmer Location</th>
            <th className="px-4 py-2">Action</th>
          </tr>
        </thead>

        <tbody>
          {seeds.map((seed) => (
            <tr
              key={seed.id}
              className="bg-white shadow-sm rounded-xl overflow-hidden"
            >
              <td className="px-4 py-3">{seed.seedName}</td>
              <td className="px-4 py-3">{seed.quantity}</td>
              <td className="px-4 py-3">${seed.price}</td>
              <td className="px-4 py-3">{seed.farmerId.name}</td>
              <td className="px-4 py-3">{seed.farmerLocation || "-"}</td>

              <td className="px-4 py-3">
                {user._id != seed.farmerId._id && (
                  <button
                    onClick={() => {
                      setBuyForm({
                        seed: seed,
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

                {user._id === seed.farmerId._id && (
                  <button
                    onClick={() => {
                      handleDeleteSeed(seed._id);
                    }}
                    className="bg-red-600 text-white px-4 py-1 rounded-lg shadow hover:bg-red-700 transition"
                  >
                    Delete
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Buy Seed Modal */}
      {showBuyModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold mb-4">
              Buy Seeds – {buyForm.seed.seedName}
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
                  buySeed(buyForm.seed);
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
  );
}
