import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { supabase } from "../../lib/supabase";

function formatDate(value) {
  if (!value) return "No date";
  return new Date(value).toLocaleString();
}

function formatPhoneForWhatsApp(phone) {
  const clean = String(phone || "").replace(/\D/g, "");

  if (!clean) return "";

  if (clean.startsWith("234")) return clean;
  if (clean.startsWith("0")) return `234${clean.slice(1)}`;

  return clean;
}

function statusClass(status) {
  const clean = String(status || "pending").toLowerCase();

  if (clean === "completed") return "bg-green-100 text-green-700";
  if (clean === "in_progress") return "bg-blue-100 text-blue-700";
  if (clean === "cancelled") return "bg-red-100 text-red-700";

  return "bg-yellow-100 text-yellow-700";
}

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
      toast.error(error.message);
    } else {
      setRequests(data || []);
    }

    setLoading(false);
  }

  useEffect(() => {
    async function loadRequests() {
      await fetchRequests();
    }

    loadRequests();
  }, []);

  async function updateStatus(id, status) {
    const { error } = await supabase
      .from("design_requests")
      .update({ status })
      .eq("id", id);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success(`Design request marked as ${status.replace("_", " ")}.`);
    fetchRequests();
  }

  if (loading) {
    return (
      <div className="rounded-[2rem] bg-white p-8 shadow-xl dark:bg-slate-900">
        <p className="font-bold text-slate-600 dark:text-slate-300">
          Loading design requests...
        </p>
      </div>
    );
  }

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 22 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-slate-950 via-purple-900 to-indigo-900 p-8 text-white shadow-2xl"
      >
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-purple-400/20 blur-3xl" />
        <div className="absolute -bottom-24 left-8 h-72 w-72 rounded-full bg-blue-400/20 blur-3xl" />

        <div className="relative z-10">
          <p className="text-sm font-bold uppercase tracking-[0.35em] text-purple-200">
            Admin Design Desk
          </p>

          <h1 className="mt-4 text-4xl font-black tracking-tight">
            Design Requests
          </h1>

          <p className="mt-3 max-w-2xl text-purple-100">
            Manage client design requests, contact customers, and update job
            progress.
          </p>

          <div className="mt-6 rounded-2xl bg-white/10 px-5 py-3 font-black backdrop-blur">
            Total Design Requests: {requests.length}
          </div>
        </div>
      </motion.div>

      {message && (
        <div className="mt-6 rounded-2xl bg-red-100 p-4 font-bold text-red-700">
          {message}
        </div>
      )}

      {requests.length === 0 ? (
        <div className="mt-8 rounded-[2rem] bg-white p-8 shadow-xl dark:bg-slate-900">
          <p className="font-bold text-slate-600 dark:text-slate-300">
            No design requests yet.
          </p>
        </div>
      ) : (
        <div className="mt-8 grid gap-6">
          {requests.map((request) => {
            const whatsappNumber = formatPhoneForWhatsApp(
              request.whatsapp || request.phone
            );

            return (
              <motion.div
                key={request.id}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="mb-5 flex flex-col justify-between gap-4 md:flex-row md:items-start">
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                      {request.service || "Design Service"}
                    </h2>

                    <p className="mt-1 text-sm font-semibold text-slate-500 dark:text-slate-400">
                      Submitted: {formatDate(request.created_at)}
                    </p>

                    <p className="mt-2 text-lg font-black text-purple-700 dark:text-purple-300">
                      Budget: ₦
                      {request.budget
                        ? Number(request.budget).toLocaleString()
                        : "Not specified"}
                    </p>
                  </div>

                  <span
                    className={`rounded-full px-4 py-2 text-sm font-black capitalize ${statusClass(
                      request.status
                    )}`}
                  >
                    {(request.status || "pending").replace("_", " ")}
                  </span>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <InfoCard label="Client Name" value={request.client_name || "N/A"} />
                  <InfoCard label="Phone" value={request.phone || "N/A"} />
                  <InfoCard label="WhatsApp" value={request.whatsapp || "N/A"} />
                  <InfoCard label="Deadline" value={request.deadline || "Not specified"} />
                  <InfoCard label="User ID" value={request.user_id || "N/A"} />
                  <InfoCard label="Request ID" value={request.id || "N/A"} />
                </div>

                <div className="mt-5 rounded-2xl bg-slate-50 p-5 dark:bg-slate-950">
                  <p className="font-black text-slate-900 dark:text-white">
                    Description
                  </p>
                  <p className="mt-2 whitespace-pre-wrap text-slate-700 dark:text-slate-300">
                    {request.description || "No description"}
                  </p>
                </div>

                <div className="mt-5 flex flex-wrap gap-3">
                  {request.phone && (
                    <a
                      href={`tel:${request.phone}`}
                      className="rounded-xl bg-slate-900 px-4 py-2 font-bold text-white transition hover:bg-black"
                    >
                      📞 Call Client
                    </a>
                  )}

                  {whatsappNumber && (
                    <a
                      href={`https://wa.me/${whatsappNumber}`}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-xl bg-green-600 px-4 py-2 font-bold text-white transition hover:bg-green-700"
                    >
                      💬 WhatsApp
                    </a>
                  )}

                  <button
                    onClick={() => updateStatus(request.id, "pending")}
                    className="rounded-xl bg-yellow-500 px-4 py-2 font-bold text-white hover:bg-yellow-600"
                  >
                    Pending
                  </button>

                  <button
                    onClick={() => updateStatus(request.id, "in_progress")}
                    className="rounded-xl bg-blue-600 px-4 py-2 font-bold text-white hover:bg-blue-700"
                  >
                    In Progress
                  </button>

                  <button
                    onClick={() => updateStatus(request.id, "completed")}
                    className="rounded-xl bg-green-700 px-4 py-2 font-bold text-white hover:bg-green-800"
                  >
                    Completed
                  </button>

                  <button
                    onClick={() => updateStatus(request.id, "cancelled")}
                    className="rounded-xl bg-red-600 px-4 py-2 font-bold text-white hover:bg-red-700"
                  >
                    Cancelled
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function InfoCard({ label, value }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-950">
      <p className="text-xs font-black uppercase tracking-wider text-slate-400">
        {label}
      </p>
      <p className="mt-1 break-words font-bold text-slate-800 dark:text-slate-200">
        {value}
      </p>
    </div>
  );
}