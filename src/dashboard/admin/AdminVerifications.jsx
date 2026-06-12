import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

export default function AdminVerifications() {
  const [users, setUsers] = useState([]);
  const [notes, setNotes] = useState({});
  const [loading, setLoading] = useState(true);
  const [errorText, setErrorText] = useState("");

  async function fetchVerifications() {
    setLoading(true);
    setErrorText("");

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .not("verification_status", "is", null)
      .order("created_at", { ascending: false });

    if (error) {
      setErrorText(error.message);
      setUsers([]);
    } else {
      setUsers(data || []);
    }

    setLoading(false);
  }

  async function approveUser(id) {
    const { error } = await supabase
      .from("profiles")
      .update({
        verification_status: "approved",
        verification_note: "Verification approved",
      })
      .eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    fetchVerifications();
  }

  async function rejectUser(id) {
    const note = notes[id] || "Verification rejected";

    const { error } = await supabase
      .from("profiles")
      .update({
        verification_status: "rejected",
        verification_note: note,
      })
      .eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    fetchVerifications();
  }

  useEffect(() => {
    (async () => {
      await fetchVerifications();
    })();
  }, []);

  if (loading) {
    return <div className="p-6">Loading verifications...</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-purple-700 mb-6">
        Admin Verifications
      </h1>

      {errorText && (
        <div className="mb-4 rounded-lg bg-red-100 p-4 text-red-700">
          Supabase Error: {errorText}
        </div>
      )}

      {users.length === 0 ? (
        <div className="rounded-xl bg-white p-6 shadow">
          <p className="text-gray-600">No verification submissions yet.</p>
          <p className="mt-2 text-sm text-gray-500">
            If profiles table has pending users, your admin account may not have
            permission to read all profiles.
          </p>
        </div>
      ) : (
        <div className="grid gap-5">
          {users.map((user) => (
            <div key={user.id} className="rounded-xl bg-white p-5 shadow">
              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    {user.fullname || user.username || "No name"}
                  </h2>

                  <p className="text-sm text-gray-600">{user.email}</p>
                  <p className="text-sm text-gray-600">{user.phone}</p>

                  <p className="mt-3">
                    <span className="font-semibold">NIN:</span>{" "}
                    {user.nin_number || "No NIN"}
                  </p>

                  <p className="mt-2">
                    <span className="font-semibold">Status:</span>{" "}
                    <span className="font-bold text-purple-700">
                      {user.verification_status || "unverified"}
                    </span>
                  </p>

                  {user.verification_note && (
                    <p className="mt-2 text-sm text-red-600">
                      Note: {user.verification_note}
                    </p>
                  )}
                </div>

                <div>
                  {user.nin_image_url ? (
                    <>
                      <a
                        href={user.nin_image_url}
                        target="_blank"
                        rel="noreferrer"
                        className="mb-3 inline-block font-semibold text-purple-700 underline"
                      >
                        Open NIN Image
                      </a>

                      <img
                        src={user.nin_image_url}
                        alt="NIN document"
                        className="mb-4 h-40 rounded-lg border object-cover"
                      />
                    </>
                  ) : (
                    <p className="text-gray-500">No NIN image uploaded</p>
                  )}

                  <textarea
                    placeholder="Rejection note"
                    value={notes[user.id] || ""}
                    onChange={(e) =>
                      setNotes({ ...notes, [user.id]: e.target.value })
                    }
                    className="w-full rounded-lg border p-3"
                    rows="3"
                  />

                  <div className="mt-4 flex gap-3">
                    <button
                      onClick={() => approveUser(user.id)}
                      className="rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700"
                    >
                      Approve
                    </button>

                    <button
                      onClick={() => rejectUser(user.id)}
                      className="rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}