import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabase";

export default function AdminInspections() {
  const [inspections, setInspections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  async function loadInspections() {
    setLoading(true);
    setMessage("");

    const { data, error } = await supabase
      .from("property_inspections")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      setMessage(error.message);
      setInspections([]);
      setLoading(false);
      return;
    }

    const propertyIds = [...new Set((data || []).map((item) => item.property_id))];

    let propertyMap = {};

    if (propertyIds.length > 0) {
      const { data: propertiesData } = await supabase
        .from("properties")
        .select("id, title")
        .in("id", propertyIds);

      (propertiesData || []).forEach((property) => {
        propertyMap[property.id] = property.title;
      });
    }

    const formatted = (data || []).map((item) => ({
      ...item,
      property_title: propertyMap[item.property_id] || "Property",
    }));

    setInspections(formatted);
    setLoading(false);
  }

  async function updateStatus(id, status) {
    setMessage("");

    const { error } = await supabase
      .from("property_inspections")
      .update({ status })
      .eq("id", id);

    if (error) {
      setMessage(error.message);
    } else {
      setMessage(`Inspection ${status} successfully.`);
      loadInspections();
    }
  }

  useEffect(() => {
    let isMounted = true;
    
    const fetchInspections = async () => {
      setLoading(true);
      setMessage("");

      const { data, error } = await supabase
        .from("property_inspections")
        .select("*")
        .order("created_at", { ascending: false });

      if (!isMounted) return;

      if (error) {
        setMessage(error.message);
        setInspections([]);
        setLoading(false);
        return;
      }

      const propertyIds = [...new Set((data || []).map((item) => item.property_id))];

      let propertyMap = {};

      if (propertyIds.length > 0) {
        const { data: propertiesData } = await supabase
          .from("properties")
          .select("id, title")
          .in("id", propertyIds);

        (propertiesData || []).forEach((property) => {
          propertyMap[property.id] = property.title;
        });
      }

      const formatted = (data || []).map((item) => ({
        ...item,
        property_title: propertyMap[item.property_id] || "Property",
      }));

      if (isMounted) {
        setInspections(formatted);
        setLoading(false);
      }
    };

    fetchInspections();
    
    return () => {
      isMounted = false;
    };
  }, []);

  const stats = useMemo(() => {
    return {
      total: inspections.length,
      pending: inspections.filter((item) => item.status === "pending").length,
      approved: inspections.filter((item) => item.status === "approved").length,
      rejected: inspections.filter((item) => item.status === "rejected").length,
    };
  }, [inspections]);

  const filteredInspections = useMemo(() => {
    return inspections.filter((item) => {
      const matchesStatus =
        statusFilter === "all" || item.status === statusFilter;

      const matchesSearch =
        item.name?.toLowerCase().includes(search.toLowerCase()) ||
        item.phone?.toLowerCase().includes(search.toLowerCase()) ||
        item.property_title?.toLowerCase().includes(search.toLowerCase());

      return matchesStatus && matchesSearch;
    });
  }, [inspections, search, statusFilter]);

  if (loading) {
    return <p className="p-6">Loading inspections...</p>;
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Admin Inspections
          </h1>
          <p className="mt-2 text-slate-600">
            View and manage all property inspection requests.
          </p>
        </div>

        <button
          onClick={loadInspections}
          className="rounded-lg bg-purple-700 px-5 py-3 font-semibold text-white hover:bg-purple-800"
        >
          Refresh
        </button>
      </div>

      {message && (
        <div className="mb-5 rounded-lg bg-blue-100 p-4 text-blue-700">
          {message}
        </div>
      )}

      <div className="mb-6 grid gap-4 md:grid-cols-4">
        <div className="rounded-2xl bg-white p-5 shadow">
          <p className="text-sm text-slate-500">Total</p>
          <h2 className="mt-2 text-3xl font-bold">{stats.total}</h2>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow">
          <p className="text-sm text-slate-500">Pending</p>
          <h2 className="mt-2 text-3xl font-bold">{stats.pending}</h2>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow">
          <p className="text-sm text-slate-500">Approved</p>
          <h2 className="mt-2 text-3xl font-bold">{stats.approved}</h2>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow">
          <p className="text-sm text-slate-500">Rejected</p>
          <h2 className="mt-2 text-3xl font-bold">{stats.rejected}</h2>
        </div>
      </div>

      <div className="mb-6 grid gap-4 md:grid-cols-2">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by client, phone, or property..."
          className="w-full rounded-xl border bg-white p-3"
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full rounded-xl border bg-white p-3"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {filteredInspections.length === 0 ? (
        <div className="rounded-2xl bg-white p-8 text-center shadow">
          <p className="text-slate-600">No inspections found.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl bg-white shadow">
          <table className="w-full border-collapse text-left">
            <thead className="bg-slate-100">
              <tr>
                <th className="p-4">Property</th>
                <th className="p-4">Client</th>
                <th className="p-4">Phone</th>
                <th className="p-4">Inspection Date</th>
                <th className="p-4">Status</th>
                <th className="p-4">Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredInspections.map((item) => (
                <tr key={item.id} className="border-t">
                  <td className="p-4 font-semibold">{item.property_title}</td>
                  <td className="p-4">{item.name}</td>
                  <td className="p-4">{item.phone}</td>
                  <td className="p-4">
                    {item.inspection_date
                      ? new Date(item.inspection_date).toLocaleString()
                      : "Not set"}
                  </td>
                  <td className="p-4 capitalize">
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold">
                      {item.status}
                    </span>
                  </td>
                  <td className="space-x-2 p-4">
                    <button
                      onClick={() => updateStatus(item.id, "approved")}
                      className="rounded-lg bg-green-600 px-3 py-2 text-sm font-semibold text-white hover:bg-green-700"
                    >
                      Approve
                    </button>

                    <button
                      onClick={() => updateStatus(item.id, "rejected")}
                      className="rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white hover:bg-red-700"
                    >
                      Reject
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}