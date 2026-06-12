import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

export default function AdminDesignRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  async function fetchRequests() {
    setLoading(true);

    const { data, error } = await supabase
      .from("design_requests")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      setMessage(error.message);
    } else {
      setRequests(data || []);
    }

    setLoading(false);
  }

  useEffect(() => {
    async function loadInitialRequests() {
      setLoading(true);

      const { data, error } = await supabase
        .from("design_requests")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        setMessage(error.message);
      } else {
        setRequests(data || []);
      }

      setLoading(false);
    }

    loadInitialRequests();
  }, []);

  async function updateStatus(id, status) {
    const { error } = await supabase
      .from("design_requests")
      .update({ status })
      .eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    fetchRequests();
  }

  if (loading) {
    return <div className="p-6">Loading design requests...</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-purple-700 mb-6">
        Admin Design Requests
      </h1>

      <div className="mb-6 rounded-xl bg-white p-5 shadow">
        <p className="font-semibold text-purple-700">
          Total Design Requests: {requests.length}
        </p>
      </div>

      {message && (
        <div className="mb-5 rounded-xl bg-red-100 p-4 text-red-700">
          {message}
        </div>
      )}

      {requests.length === 0 ? (
        <div className="rounded-xl bg-white p-6 shadow">
          <p className="text-gray-600">No design requests yet.</p>
        </div>
      ) : (
        <div className="grid gap-5">
          {requests.map((request) => (
            <div key={request.id} className="rounded-xl bg-white p-5 shadow">
              <div className="mb-3 flex flex-col justify-between gap-3 md:flex-row md:items-center">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Budget: ₦{request.budget || "Not specified"}
                  </h2>

                  <p className="text-sm text-gray-500">
                    Submitted:{" "}
                    {request.created_at
                      ? new Date(request.created_at).toLocaleString()
                      : "No date"}
                  </p>
                </div>

                <span className="rounded-full bg-purple-100 px-4 py-2 text-sm font-semibold text-purple-700">
                  {request.status || "pending"}
                </span>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <p>
                  <span className="font-semibold">User ID:</span>{" "}
                  {request.userid || "N/A"}
                </p>

                <p>
                  <span className="font-semibold">Deadline:</span>{" "}
                  {request.deadline || "Not specified"}
                </p>
              </div>

              <div className="mt-4 rounded-lg bg-slate-50 p-4">
                <p className="font-semibold">Description:</p>
                <p className="mt-1 text-gray-700">
                  {request.description || "No description"}
                </p>
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  onClick={() => updateStatus(request.id, "pending")}
                  className="rounded-lg bg-yellow-500 px-4 py-2 text-white hover:bg-yellow-600"
                >
                  Pending
                </button>

                <button
                  onClick={() => updateStatus(request.id, "in_progress")}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                >
                  In Progress
                </button>

                <button
                  onClick={() => updateStatus(request.id, "completed")}
                  className="rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700"
                >
                  Completed
                </button>

                <button
                  onClick={() => updateStatus(request.id, "cancelled")}
                  className="rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700"
                >
                  Cancelled
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}