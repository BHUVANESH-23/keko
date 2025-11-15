import { useState, useEffect } from "react";
import axios from "axios";

export default function TransporterDashboard({ user }) {
  const [vehicles, setVehicles] = useState([]);
  const [formData, setFormData] = useState({
    registrationNumber: "",
    type: "",
    capacity: "",
  });

  const fetchVehicles = () => {
    axios.get("http://localhost:3001/api/vehicles").then((res) => {
      const myVehicles = res.data.filter((v) => v.transporterId?._id === user._id);
      setVehicles(myVehicles);
    });
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const handleAddVehicle = async (e) => {
    e.preventDefault();
    if (!formData.registrationNumber) return alert("Enter registration number");
    const newVehicle = {
      transporterId: user._id,
      registrationNumber: formData.registrationNumber,
      type: formData.type,
      capacity: Number(formData.capacity),
    };
    await axios.post("http://localhost:3001/api/vehicles/add", newVehicle);
    setFormData({ registrationNumber: "", type: "", capacity: "" });
    fetchVehicles();
  };

  return (
    <div className="p-8">
      <h2 className="text-xl font-bold mb-4">
        Welcome {user.name} (Transporter)
      </h2>

      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <h3 className="text-lg font-semibold mb-2">Add a Vehicle</h3>
        <form
          onSubmit={handleAddVehicle}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          <input
            type="text"
            placeholder="Registration Number"
            value={formData.registrationNumber}
            onChange={(e) =>
              setFormData({ ...formData, registrationNumber: e.target.value })
            }
            className="border p-2 rounded"
          />
          <input
            type="text"
            placeholder="Vehicle Type"
            value={formData.type}
            onChange={(e) =>
              setFormData({ ...formData, type: e.target.value })
            }
            className="border p-2 rounded"
          />
          <input
            type="number"
            placeholder="Capacity (kg)"
            value={formData.capacity}
            onChange={(e) =>
              setFormData({ ...formData, capacity: e.target.value })
            }
            className="border p-2 rounded"
          />
          <button
            type="submit"
            className="bg-green-600 text-white rounded px-4 py-2 hover:bg-green-700 md:col-span-3"
          >
            Add Vehicle
          </button>
        </form>
      </div>

      <div className="bg-white rounded-lg shadow-md p-4">
        <h3 className="text-lg font-semibold mb-3">Your Vehicles</h3>
        {vehicles.length === 0 ? (
          <p>No vehicles added yet.</p>
        ) : (
          <ul className="list-disc ml-5">
            {vehicles.map((v) => (
              <li key={v._id}>
                {v.registrationNumber} – {v.type} ({v.capacity} kg)
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
