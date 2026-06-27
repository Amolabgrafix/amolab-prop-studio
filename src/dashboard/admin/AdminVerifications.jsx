import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { supabase } from "../../lib/supabase";

const STATUS_OPTIONS = ["all", "pending", "approved", "rejected"];

export default function AdminVerifications() {
  const [verifications, setVerifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [selectedUser, setSelectedUser] = useState(null);
  const [note, setNote] = useState("");
  const [modalAction, setModalAction] = useState(null);

  async function loadVerifications(showLoading = true) {
    if (showLoading) {
      setLoading(true);
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .not("nin_number", "is", null)
      .order("created_at", { ascending: false });

    if (error) {
      toast.error(error.message);
      setVerifications([]);
    } else {
      setVerifications(data || []);
    }

    setLoading(false);
  }

  useEffect(() => {
    async function fetchVerifications() {
      await loadVerifications(false);
    }

    fetchVerifications();
  }, []);

  const filteredVerifications = useMemo(() => {
    return verifications.filter((user) => {
      const keyword = search.toLowerCase();

      const matchesSearch =
        user.fullname?.toLowerCase().includes(keyword) ||
        user.username?.toLowerCase().includes(keyword) ||
        user.email?.toLowerCase().includes(keyword) ||
        user.phone?.toLowerCase().includes(keyword) ||
        user.nin_number?.toLowerCase().includes(keyword);

      const status = user.verification_status || "pending";
      const matchesStatus = statusFilter === "all" || status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [verifications, search, statusFilter]);

  function openNoteModal(user, action) {
    setSelectedUser(user);
    setModalAction(action);
    setNote(user.verification_note || "");
  }

  function closeModal() {
    setSelectedUser(null);
    setModalAction(null);
    setNote("");
  }

  async function updateVerification(user, status, adminNote = "") {
    setUpdatingId(user.id);

    const { error } = await supabase
      .from("profiles")
      .update({
        verification_status: status,
        verification_note: adminNote,
      })
      .eq("id", user.id);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success(
        status === "approved"
          ? "Seller verification approved"
          : "Seller verification rejected"
      );

      setVerifications((prev) =>
        prev.map((item) =>
          item.id === user.id
            ? {
                ...item,
                verification_status: status,
                verification_note: adminNote,
              }
            : item
        )
      );

      closeModal();
    }

    setUpdatingId(null);
  }

  const stats = {
    total: verifications.length,
    pending: verifications.filter(
      (u) => !u.verification_status || u.verification_status === "pending"
    ).length,
    approved: verifications.filter((u) => u.verification_status === "approved")
      .length,
    rejected: verifications.filter((u) => u.verification_status === "rejected")
      .length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50 px-4 py-6 md:px-8">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="mx-auto max-w-7xl"
      >
        <div className="mb-8 rounded-3xl border border-white/70 bg-white/70 p-6 shadow-xl shadow-purple-100/50 backdrop-blur-xl">
          <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-purple-600">
                Admin Premium Phase
              </p>
              <h1 className="mt-2 text-3xl font-black text-slate-950 md:text-4xl">
                KYC Review Center
              </h1>
              <p className="mt-2 max-w-2xl text-slate-600">
                Review seller identity submissions, preview NIN documents,
                approve trusted agents, or reject with admin notes.
              </p>
            </div>

            <button
              onClick={loadVerifications}
              className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-bold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-purple-700"
            >
              Refresh Reviews
            </button>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Total Reviews" value={stats.total} />
            <StatCard label="Pending" value={stats.pending} />
            <StatCard label="Approved" value={stats.approved} />
            <StatCard label="Rejected" value={stats.rejected} />
          </div>
        </div>

        <div className="mb-6 rounded-3xl border border-white/70 bg-white/70 p-4 shadow-lg backdrop-blur-xl">
          <div className="grid gap-4 lg:grid-cols-[1fr_auto]">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, phone, username or NIN..."
              className="w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm outline-none transition focus:border-purple-500 focus:ring-4 focus:ring-purple-100"
            />

            <div className="flex flex-wrap gap-2">
              {STATUS_OPTIONS.map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`rounded-2xl px-4 py-3 text-sm font-bold capitalize transition ${
                    statusFilter === status
                      ? "bg-purple-700 text-white shadow-lg shadow-purple-200"
                      : "bg-white text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="grid gap-5 lg:grid-cols-2">
            {[1, 2, 3, 4].map((item) => (
              <SkeletonCard key={item} />
            ))}
          </div>
        ) : filteredVerifications.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded-3xl border border-dashed border-slate-300 bg-white/70 p-12 text-center shadow-lg backdrop-blur-xl"
          >
            <h2 className="text-xl font-black text-slate-900">
              No verification found
            </h2>
            <p className="mt-2 text-slate-500">
              Try changing your search keyword or status filter.
            </p>
          </motion.div>
        ) : (
          <motion.div layout className="grid gap-5 lg:grid-cols-2">
            <AnimatePresence>
              {filteredVerifications.map((user, index) => (
                <VerificationCard
                  key={user.id}
                  user={user}
                  index={index}
                  updatingId={updatingId}
                  onApprove={() => updateVerification(user, "approved")}
                  onReject={() => openNoteModal(user, "rejected")}
                  onNote={() =>
                    openNoteModal(
                      user,
                      user.verification_status === "approved"
                        ? "approved"
                        : "rejected"
                    )
                  }
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </motion.div>

      <AnimatePresence>
        {selectedUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0, y: 24 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 24 }}
              className="w-full max-w-lg rounded-3xl border border-white/20 bg-white p-6 shadow-2xl"
            >
              <h2 className="text-2xl font-black text-slate-950">
                Admin Note
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Add a note for {selectedUser.fullname || selectedUser.email}.
              </p>

              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows="5"
                placeholder="Write verification note..."
                className="mt-5 w-full rounded-2xl border border-slate-200 p-4 text-sm outline-none transition focus:border-purple-500 focus:ring-4 focus:ring-purple-100"
              />

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <button
                  onClick={closeModal}
                  className="flex-1 rounded-2xl bg-slate-100 px-5 py-3 font-bold text-slate-700 transition hover:bg-slate-200"
                >
                  Cancel
                </button>

                <button
                  onClick={() =>
                    updateVerification(selectedUser, modalAction, note)
                  }
                  disabled={updatingId === selectedUser.id}
                  className={`flex-1 rounded-2xl px-5 py-3 font-bold text-white shadow-lg transition disabled:cursor-not-allowed disabled:opacity-60 ${
                    modalAction === "approved"
                      ? "bg-emerald-600 hover:bg-emerald-700"
                      : "bg-rose-600 hover:bg-rose-700"
                  }`}
                >
                  {updatingId === selectedUser.id
                    ? "Saving..."
                    : modalAction === "approved"
                    ? "Save Approval"
                    : "Reject Seller"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function VerificationCard({
  user,
  index,
  updatingId,
  onApprove,
  onReject,
  onNote,
}) {
  const status = user.verification_status || "pending";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.35, delay: index * 0.04 }}
      className="overflow-hidden rounded-3xl border border-white/70 bg-white/80 shadow-xl shadow-slate-200/60 backdrop-blur-xl"
    >
      <div className="flex flex-col gap-5 p-5 md:flex-row">
        <div className="h-48 w-full overflow-hidden rounded-3xl bg-slate-100 md:h-auto md:w-48">
          {user.nin_image_url ? (
            <a href={user.nin_image_url} target="_blank" rel="noreferrer">
              <img
                src={user.nin_image_url}
                alt="NIN document"
                className="h-full w-full object-cover transition duration-500 hover:scale-110"
              />
            </a>
          ) : (
            <div className="flex h-full w-full items-center justify-center text-sm font-bold text-slate-400">
              No Document
            </div>
          )}
        </div>

        <div className="flex-1">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className="text-xl font-black text-slate-950">
                {user.fullname || user.username || "Unnamed Seller"}
              </h3>
              <p className="mt-1 text-sm text-slate-500">{user.email}</p>
            </div>

            <StatusBadge status={status} />
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <Info label="Phone" value={user.phone || "Not provided"} />
            <Info label="Role" value={user.role || "seller"} />
            <Info label="NIN Number" value={user.nin_number || "Not provided"} />
            <Info
              label="Submitted"
              value={
                user.created_at
                  ? new Date(user.created_at).toLocaleDateString()
                  : "Unknown"
              }
            />
          </div>

          {user.verification_note && (
            <div className="mt-4 rounded-2xl bg-slate-50 p-3 text-sm text-slate-600">
              <span className="font-bold text-slate-800">Admin note:</span>{" "}
              {user.verification_note}
            </div>
          )}

          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            {user.nin_image_url && (
              <a
                href={user.nin_image_url}
                target="_blank"
                rel="noreferrer"
                className="flex-1 rounded-2xl bg-slate-950 px-4 py-3 text-center text-sm font-bold text-white transition hover:bg-purple-700"
              >
                Preview Document
              </a>
            )}

            <button
              onClick={onApprove}
              disabled={updatingId === user.id}
              className="flex-1 rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {updatingId === user.id ? "Updating..." : "Approve"}
            </button>

            <button
              onClick={onReject}
              disabled={updatingId === user.id}
              className="flex-1 rounded-2xl bg-rose-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Reject
            </button>

            <button
              onClick={onNote}
              className="rounded-2xl bg-purple-100 px-4 py-3 text-sm font-bold text-purple-700 transition hover:bg-purple-200"
            >
              Note
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function StatCard({ label, value }) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="rounded-3xl border border-white/80 bg-white/80 p-5 shadow-lg backdrop-blur-xl"
    >
      <p className="text-sm font-bold text-slate-500">{label}</p>
      <h3 className="mt-2 text-3xl font-black text-slate-950">{value}</h3>
    </motion.div>
  );
}

function Info({ label, value }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-3">
      <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
        {label}
      </p>
      <p className="mt-1 break-words text-sm font-bold text-slate-800">
        {value}
      </p>
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = {
    pending: "bg-amber-100 text-amber-700",
    approved: "bg-emerald-100 text-emerald-700",
    rejected: "bg-rose-100 text-rose-700",
  };

  return (
    <span
      className={`rounded-full px-4 py-2 text-xs font-black uppercase tracking-wider ${
        styles[status] || styles.pending
      }`}
    >
      {status}
    </span>
  );
}

function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-3xl border border-white/70 bg-white/70 p-5 shadow-xl backdrop-blur-xl">
      <div className="flex flex-col gap-5 md:flex-row">
        <div className="h-48 rounded-3xl bg-slate-200 md:w-48" />
        <div className="flex-1 space-y-4">
          <div className="h-6 w-2/3 rounded-full bg-slate-200" />
          <div className="h-4 w-1/2 rounded-full bg-slate-200" />
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="h-16 rounded-2xl bg-slate-200" />
            <div className="h-16 rounded-2xl bg-slate-200" />
            <div className="h-16 rounded-2xl bg-slate-200" />
            <div className="h-16 rounded-2xl bg-slate-200" />
          </div>
          <div className="h-12 rounded-2xl bg-slate-200" />
        </div>
      </div>
    </div>
  );
}