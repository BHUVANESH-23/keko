import { useEffect, useState } from "react";
import axios from "axios";

export default function FarmerDashboard({ user, setCurrentPage }) {
  const [vehicles, setVehicles] = useState([]);
  const [myCrops, setMyCrops] = useState([]);
  const [mySeeds, setMySeeds] = useState([]);
  const [market, setMarket] = useState([]);
  const [demand, setDemand] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState("");
  const [crop, setCrop] = useState({ name: "", area: "", quantity: "" });
  const [seed, setSeed] = useState({
    name: "",
    type: "",
    price: "",
    quantity: "",
    location: "",
  });
  const [helpers, setHelpers] = useState([]);
  const [selectedHelper, setSelectedHelper] = useState("");
  const [hireNotes, setHireNotes] = useState("");
  const [myHires, setMyHires] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load initial data
  useEffect(() => {
    if (!user?._id) return;

    const base = "http://localhost:3001/api";
    const requests = [
      axios
        .get(`${base}/vehicles`)
        .then((r) => setVehicles(r.data || []))
        .catch(() => setVehicles([])),
      axios
        .get(`${base}/crops/byFarmer/${user._id}`)
        .then((r) => setMyCrops(r.data || []))
        .catch(() => setMyCrops([])),
      axios
        .get(`${base}/seeds/byFarmer/${user._id}`)
        .then((r) => setMySeeds(r.data || []))
        .catch(() => setMySeeds([])),
      axios
        .get(`${base}/market`)
        .then((r) => setMarket(r.data || []))
        .catch(() => setMarket([])),
      axios
        .get(`${base}/crops/demand`)
        .then((r) => setDemand(r.data || []))
        .catch(() => setDemand([])),
      axios
        .get(`${base}/helpers/all`)
        .then((r) => setHelpers(r.data || []))
        .catch(() => setHelpers([])),
      axios
        .get(`${base}/hires/byUser/${user._id}`)
        .then((r) => setMyHires(r.data || []))
        .catch(() => setMyHires([])),
    ];

    Promise.allSettled(requests).finally(() => setLoading(false));
  }, [user?._id]);

  // Register Vehicle
  const registerVehicle = async () => {
    if (!selectedVehicle) return alert("Select a vehicle");
    await axios.post(
      "http://localhost:3001/api/registrations/registerVehicle",
      {
        farmerId: user._id,
        vehicleId: selectedVehicle,
      }
    );
    alert("Vehicle registered successfully!");
  };

  // Add Crop
  const addCrop = async () => {
    const payload = {
      farmerId: user._id,
      cropName: crop.name,
      area: Number(crop.area || 0),
      quantity: Number(crop.quantity || 0),
    };
    await axios.post("http://localhost:3001/api/crops/add", payload);
    alert("Crop added successfully!");
    const r = await axios.get(
      `http://localhost:3001/api/crops/byFarmer/${user._id}`
    );
    setMyCrops(r.data || []);
    setCrop({ name: "", area: "", quantity: "" });
  };

  const addSeed = async () => {
    const payload = {
      farmerId: user._id,
      seedName: seed.name,
      price: seed.price,
      quantity: Number(seed.quantity || 0),
      location: seed.location,
    };
    await axios.post("http://localhost:3001/api/seeds/add", payload);
    alert("Seed added successfully!");
    const r = await axios.get(
      `http://localhost:3001/api/seeds/byFarmer/${user._id}`
    );
    setMySeeds(r.data || []);
    setSeed({ name: "", price: "", quantity: "", location: "" });
  };

  const handleDeleteSeed = async (_id) => {
    if (confirm("Are you sure you want to delete?")) {
      try {
        await axios.delete("http://localhost:3001/api/seeds/delete", _id);
        alert("Seed Deleted successfully!");
        const r = await axios.get(
          `http://localhost:3001/api/seeds/byFarmer/${user._id}`
        );
        setMySeeds(r.data || []);
        setSeed({ name: "", area: "", quantity: "" });
      } catch (e) {
        alert("Failed to delete seed!");
      }
    }
  };

  if (!user) return null;

  return (
    <div className="p-6 space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Welcome {user.name} (Farmer)</h2>

        {/* Button to open Crops Market / Management */}
        <div>
          <button
            onClick={() => setCurrentPage?.("seeds")}
            className="bg-yellow-500 m-[20px] text-white px-4 py-2 rounded hover:bg-yellow-600"
          >
            Seed Market
          </button>

          <button
            onClick={() => setCurrentPage?.("crops")}
            className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
          >
            Manage Market / Production
          </button>
        </div>
      </div>

      {/* Vehicle Registration */}
      <div className="bg-white p-4 shadow rounded">
        <h3 className="font-semibold text-lg mb-2">
          Register Vehicle from Transporter
        </h3>
        <select
          value={selectedVehicle}
          onChange={(e) => setSelectedVehicle(e.target.value)}
          className="border p-2 rounded w-full"
        >
          <option value="">Select Vehicle</option>
          {vehicles.map((v) => (
            <option key={v?._id} value={v?._id || ""}>
              {v?.registrationNumber || "Unknown Reg"} (
              {v?.transporterId?.name || "Unknown Transporter"})
            </option>
          ))}
        </select>
        <button
          onClick={registerVehicle}
          className="bg-green-600 text-white px-4 py-2 mt-2 rounded"
        >
          Register
        </button>
      </div>

      {/* Crop Management */}
      <div className="bg-white p-4 shadow rounded">
        <h3 className="font-semibold text-lg mb-2">Your Crops</h3>
        <div className="flex flex-wrap gap-2">
          <input
            type="text"
            value={crop.name}
            placeholder="Crop Name"
            className="border p-2 rounded"
            onChange={(e) => setCrop((c) => ({ ...c, name: e.target.value }))}
          />
          <input
            type="number"
            value={crop.area}
            placeholder="Area"
            className="border p-2 rounded"
            onChange={(e) => setCrop((c) => ({ ...c, area: e.target.value }))}
          />
          <input
            type="number"
            value={crop.quantity}
            placeholder="Quantity (kg)"
            className="border p-2 rounded"
            onChange={(e) =>
              setCrop((c) => ({ ...c, quantity: e.target.value }))
            }
          />
          <button
            onClick={addCrop}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Add Crop
          </button>
        </div>

        <ul className="list-disc ml-5 mt-3">
          {(myCrops || []).map((c) => (
            <li key={c?._id}>
              {c?.cropName || c?.name || "Unknown Crop"} — {c?.quantity ?? 0}kg
              ({c?.area ?? 0} acres)
            </li>
          ))}
        </ul>
      </div>

      {/* Seed Management */}

      <div className="bg-white p-4 shadow rounded">
        <h3 className="font-semibold text-lg mb-2">Your Seeds</h3>
        <div className="flex flex-wrap gap-2">
          <input
            type="text"
            value={seed.name}
            placeholder="Seed Name"
            className="border p-2 rounded"
            onChange={(e) => setSeed((c) => ({ ...c, name: e.target.value }))}
          />
          <input
            type="number"
            value={seed.price}
            placeholder="Price"
            className="border p-2 rounded"
            onChange={(e) => setSeed((c) => ({ ...c, price: e.target.value }))}
          />
          <input
            type="number"
            value={seed.quantity}
            placeholder="Quantity"
            className="border p-2 rounded"
            onChange={(e) =>
              setSeed((c) => ({ ...c, quantity: e.target.value }))
            }
          />
          <input
            type="text"
            value={seed.location}
            placeholder="Location"
            className="border p-2 rounded"
            onChange={(e) =>
              setSeed((c) => ({ ...c, location: e.target.value }))
            }
          />
          <button
            onClick={addSeed}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Add Seeds
          </button>
        </div>

        <ul className="list-disc ml-5 mt-3">
          {(mySeeds || []).map((c) => (
            <li key={c?._id} className="flex items-center pr-2">
              <span>
                {c?.seedName || c?.name || "Unknown Crop"} — {c?.quantity ?? 0}
                kg — ({c?.price ?? 0} rupees)
              </span>

              <span
                onClick={() => handleDeleteSeed(c?.id)}
                className="cursor-pointer ml-[10px] text-red-600 hover:text-red-800 text-lg"
              >
                ❌
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Helpers & Hiring */}
      <div className="bg-white p-4 shadow rounded">
        <h3 className="font-semibold text-lg mb-2">Helpers (Available)</h3>

        <div className="mb-3">
          <select
            className="border p-2 rounded w-full"
            value={selectedHelper}
            onChange={(e) => setSelectedHelper(e.target.value)}
          >
            <option value="">Select Helper to hire</option>
            {(helpers || [])
              .filter((h) => !!h && h.available && h.helperId)
              .map((h) => (
                <option key={h?._id} value={h?.helperId?._id || ""}>
                  {h?.helperId?.name || "Unknown Helper"} —{" "}
                  {h?.note || "No note"}
                </option>
              ))}
          </select>

          <textarea
            placeholder="Notes for helper (task description)"
            value={hireNotes}
            onChange={(e) => setHireNotes(e.target.value)}
            className="w-full border p-2 rounded mt-2"
          />

          <button
            onClick={async () => {
              if (!selectedHelper) return alert("Select a helper");
              await axios.post("http://localhost:3001/api/hires/request", {
                farmerId: user._id,
                helperId: selectedHelper,
                cropId: null,
                notes: hireNotes,
              });
              alert("Hire request sent");
              const r = await axios.get(
                `http://localhost:3001/api/hires/byUser/${user._id}`
              );
              setMyHires(r.data || []);
              setSelectedHelper("");
              setHireNotes("");
            }}
            className="mt-2 bg-green-600 text-white px-4 py-2 rounded"
          >
            Hire Helper
          </button>
        </div>

        <h4 className="font-semibold mt-4">Your Hire Requests</h4>
        {!myHires || myHires.length === 0 ? (
          <p>No hires yet</p>
        ) : (
          <ul className="list-disc ml-5">
            {(myHires || []).map((h) => (
              <li key={h?._id}>
                Helper: {h?.helperId?.name || "Unknown"} — Status:{" "}
                {h?.status || "pending"}
                {h?.status === "accepted" && (
                  <span className="ml-2 text-green-600"> (Accepted)</span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {loading && <div className="text-sm text-gray-500">Loading…</div>}
    </div>
  );
}
