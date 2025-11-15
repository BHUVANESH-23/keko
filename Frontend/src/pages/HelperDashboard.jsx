import { useState, useEffect } from "react";
import axios from "axios";

export default function HelperDashboard({ user }) {
  const [available, setAvailable] = useState(false);
  const [note, setNote] = useState('');
  const [myHires, setMyHires] = useState([]);

  useEffect(() => {
    // load existing availability if any
    axios.get(`http://localhost:3001/api/helpers/${user._id}`).then(res => {
      if (res.data) {
        setAvailable(res.data.available);
        setNote(res.data.note || '');
      }
    }).catch(()=>{});
    fetchMyHires();
  }, []);

  const setAvailability = async () => {
    await axios.post('http://localhost:3001/api/helpers/setAvailability', {
      helperId: user._id,
      available,
      note
    });
    alert('Availability updated');
  };

  const fetchMyHires = async () => {
    const res = await axios.get(`http://localhost:3001/api/hires/byUser/${user._id}`);
    setMyHires(res.data);
  };

  const updateStatus = async (hireId, newStatus) => {
    await axios.post('http://localhost:3001/api/hires/updateStatus', { hireId, newStatus });
    fetchMyHires();
  };

  return (
    <div className="p-8">
      <h2 className="text-xl font-bold mb-4">Welcome {user.name} (Helper)</h2>

      <div className="bg-white p-4 shadow rounded mb-6">
        <h3 className="font-semibold mb-2">Set your willingness to work</h3>
        <label className="block mb-2">
          <input type="checkbox" checked={available} onChange={(e)=>setAvailable(e.target.checked)} />
          <span className="ml-2">I am available to work</span>
        </label>
        <textarea
          placeholder="Tell farmers what you're good at / preferred tasks"
          value={note}
          onChange={(e)=>setNote(e.target.value)}
          className="w-full border p-2 rounded"
        />
        <button onClick={setAvailability} className="mt-2 bg-blue-600 text-white px-4 py-2 rounded">
          Save Availability
        </button>
      </div>

      <div className="bg-white p-4 shadow rounded">
        <h3 className="font-semibold mb-2">Your Hire Requests</h3>
        {myHires.length === 0 ? <p>No hire requests yet.</p> : (
          <ul className="space-y-2">
            {myHires.map(h => (
              <li key={h._id} className="border p-2 rounded">
                <div><strong>Farmer:</strong> {h.farmerId?.name}</div>
                <div><strong>Status:</strong> {h.status}</div>
                <div><strong>Notes:</strong> {h.notes}</div>
                <div className="mt-2 space-x-2">
                  {h.status === 'requested' && (
                    <>
                      <button onClick={()=>updateStatus(h._id, 'accepted')} className="px-3 py-1 bg-green-600 text-white rounded">Accept</button>
                      <button onClick={()=>updateStatus(h._id, 'rejected')} className="px-3 py-1 bg-red-500 text-white rounded">Reject</button>
                    </>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
