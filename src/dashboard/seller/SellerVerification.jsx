import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { supabase } from "../../lib/supabase";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: "easeOut" } },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

function getStatusStyle(status) {
  const clean = String(status || "unverified").toLowerCase();

  if (clean === "approved") {
    return "bg-green-100 text-green-700 border-green-200";
  }

  if (clean === "pending") {
    return "bg-yellow-100 text-yellow-700 border-yellow-200";
  }

  if (clean === "rejected") {
    return "bg-red-100 text-red-700 border-red-200";
  }

  return "bg-slate-100 text-slate-700 border-slate-200";
}

function getStatusIcon(status) {
  const clean = String(status || "unverified").toLowerCase();

  if (clean === "approved") return "✅";
  if (clean === "pending") return "⏳";
  if (clean === "rejected") return "❌";

  return "🛡️";
}

export default function SellerVerification() {
  const [profile, setProfile] = useState(null);
  const [ninNumber, setNinNumber] = useState("");
  const [ninImage, setNinImage] = useState(null);

  const [whatsapp, setWhatsapp] = useState("");
  const [phone, setPhone] = useState("");
  const [agencyName, setAgencyName] = useState("");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchProfile();
  }, []);

  async function fetchProfile() {
    setLoading(true);

    const { data: userData } = await supabase.auth.getUser();
    const user = userData?.user;

    if (!user) {
      setMessage("Please login first.");
      setLoading(false);
      return;
    }

    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    setProfile(data);
    setNinNumber(data?.nin_number || "");
    setWhatsapp(data?.whatsapp || "");
    setPhone(data?.phone || "");
    setAgencyName(data?.agency_name || "");
    setLoading(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setMessage("");

    try {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData?.user;

      if (!user) {
        throw new Error("Please login first.");
      }

      let ninImageUrl = profile?.nin_image_url || "";

      if (ninImage) {
        const fileExt = ninImage.name.split(".").pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `${user.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("nin-documents")
          .upload(filePath, ninImage, {
            upsert: true,
          });

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from("nin-documents")
          .getPublicUrl(filePath);

        ninImageUrl = urlData.publicUrl;
      }

      const { error: saveError } = await supabase.from("profiles").upsert({
        id: user.id,
        email: user.email,
        nin_number: ninNumber,
        nin_image_url: ninImageUrl,
        whatsapp,
        phone,
        agency_name: agencyName,
        verification_status: "pending",
        verification_note: null,
      });

      if (saveError) throw saveError;

      setMessage("Profile and verification submitted successfully.");
      toast.success("Verification submitted successfully.");
      await fetchProfile();
    } catch (error) {
      setMessage(error.message);
      toast.error(error.message);
    }

    setSubmitting(false);
  }

  const status = profile?.verification_status || "unverified";

  if (loading) {
    return (
      <div className="min-h-screen">
        <div className="rounded-[2rem] bg-white p-8 shadow-xl">
          <div className="h-8 w-64 animate-pulse rounded bg-slate-200" />
          <div className="mt-4 h-4 w-96 max-w-full animate-pulse rounded bg-slate-200" />

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <div className="h-24 animate-pulse rounded-2xl bg-slate-100" />
            <div className="h-24 animate-pulse rounded-2xl bg-slate-100" />
            <div className="h-24 animate-pulse rounded-2xl bg-slate-100" />
          </div>

          <div className="mt-8 h-96 animate-pulse rounded-[2rem] bg-slate-100" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <motion.section
        variants={fadeUp}
        initial="hidden"
        animate="show"
        className="relative overflow-hidden rounded-[2.2rem] bg-gradient-to-br from-purple-800 via-slate-950 to-indigo-950 p-8 text-white shadow-2xl"
      >
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-purple-400/20 blur-3xl" />
        <div className="absolute -bottom-24 left-8 h-72 w-72 rounded-full bg-blue-400/20 blur-3xl" />

        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.3em] text-purple-200">
              Seller KYC Center
            </p>

            <h1 className="mt-3 text-4xl font-black md:text-5xl">
              Seller Profile & Verification
            </h1>

            <p className="mt-3 max-w-2xl text-purple-100">
              Add your contact details and submit your NIN document for admin verification.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <span
                className={`rounded-2xl border px-5 py-3 font-black capitalize ${getStatusStyle(
                  status
                )}`}
              >
                {getStatusIcon(status)} {status}
              </span>

              <span className="rounded-2xl bg-white/10 px-5 py-3 font-bold backdrop-blur">
                🏢 {agencyName || "No agency name yet"}
              </span>
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/20 bg-white/10 p-5 backdrop-blur">
            <p className="text-sm font-bold text-purple-100">
              Verification Progress
            </p>

            <div className="mt-4 grid gap-2 text-sm">
              <p>{agencyName ? "✅" : "○"} Agency/Seller name</p>
              <p>{phone ? "✅" : "○"} Phone number</p>
              <p>{whatsapp ? "✅" : "○"} WhatsApp number</p>
              <p>{ninNumber ? "✅" : "○"} NIN number</p>
              <p>{profile?.nin_image_url || ninImage ? "✅" : "○"} NIN document</p>
            </div>
          </div>
        </div>
      </motion.section>

      <motion.section
        variants={stagger}
        initial="hidden"
        animate="show"
        className="mt-8 grid gap-5 md:grid-cols-3"
      >
        <motion.div
          variants={fadeUp}
          className="rounded-[2rem] bg-white p-6 shadow-xl"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-100 text-2xl">
            🛡️
          </div>

          <p className="mt-5 text-sm font-bold text-slate-500">
            Current Status
          </p>

          <p className="mt-1 text-3xl font-black capitalize text-slate-950">
            {status}
          </p>
        </motion.div>

        <motion.div
          variants={fadeUp}
          className="rounded-[2rem] bg-white p-6 shadow-xl"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-100 text-2xl">
            📞
          </div>

          <p className="mt-5 text-sm font-bold text-slate-500">
            Contact Number
          </p>

          <p className="mt-1 text-xl font-black text-slate-950">
            {phone || "Not added"}
          </p>
        </motion.div>

        <motion.div
          variants={fadeUp}
          className="rounded-[2rem] bg-white p-6 shadow-xl"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-yellow-100 text-2xl">
            📄
          </div>

          <p className="mt-5 text-sm font-bold text-slate-500">
            Document Upload
          </p>

          <p className="mt-1 text-xl font-black text-slate-950">
            {profile?.nin_image_url ? "Uploaded" : "Not uploaded"}
          </p>
        </motion.div>
      </motion.section>

      {profile?.verification_note && (
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="mt-8 rounded-2xl bg-red-100 p-5 font-semibold text-red-700 shadow"
        >
          Admin Note: {profile.verification_note}
        </motion.div>
      )}

      {message && (
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="mt-8 rounded-2xl bg-purple-100 p-5 font-semibold text-purple-700 shadow"
        >
          {message}
        </motion.div>
      )}

      <motion.section
        variants={fadeUp}
        initial="hidden"
        animate="show"
        className="mt-8 grid gap-8 lg:grid-cols-[1.2fr_0.8fr]"
      >
        <form
          onSubmit={handleSubmit}
          className="rounded-[2rem] bg-white p-6 shadow-xl md:p-8"
        >
          <div className="mb-6">
            <p className="text-sm font-black uppercase tracking-[0.25em] text-purple-600">
              Verification Form
            </p>

            <h2 className="mt-2 text-3xl font-black text-slate-900">
              Submit Seller Details
            </h2>

            <p className="mt-2 text-slate-600">
              Fill all required information carefully. Admin will review your submission.
            </p>
          </div>

          <div className="grid gap-5">
            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">
                Agency name / Seller name
              </label>

              <input
                type="text"
                value={agencyName}
                onChange={(e) => setAgencyName(e.target.value)}
                placeholder="Agency name / Seller name"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 font-semibold outline-none transition focus:border-purple-500 focus:bg-white focus:ring-4 focus:ring-purple-100"
              />
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">
                  Phone number
                </label>

                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="08012345678"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 font-semibold outline-none transition focus:border-purple-500 focus:bg-white focus:ring-4 focus:ring-purple-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">
                  WhatsApp number
                </label>

                <input
                  type="text"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="2348012345678"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 font-semibold outline-none transition focus:border-purple-500 focus:bg-white focus:ring-4 focus:ring-purple-100"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">
                NIN number
              </label>

              <input
                type="text"
                value={ninNumber}
                onChange={(e) => setNinNumber(e.target.value)}
                placeholder="Enter your NIN number"
                required
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 font-semibold outline-none transition focus:border-purple-500 focus:bg-white focus:ring-4 focus:ring-purple-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">
                Upload NIN image
              </label>

              <input
                type="file"
                accept="image/*"
                onChange={(e) => setNinImage(e.target.files[0])}
                required={!profile?.nin_image_url}
                className="w-full rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-4 font-semibold text-slate-600 file:mr-4 file:rounded-xl file:border-0 file:bg-purple-700 file:px-4 file:py-2 file:font-bold file:text-white hover:bg-slate-100"
              />

              {ninImage && (
                <p className="mt-2 text-sm font-semibold text-purple-700">
                  Selected file: {ninImage.name}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="rounded-2xl bg-purple-700 px-6 py-4 font-black text-white shadow-lg shadow-purple-200 transition hover:bg-purple-800 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              {submitting
                ? "Submitting..."
                : "Save Profile & Submit Verification"}
            </button>
          </div>
        </form>

        <aside className="space-y-6">
          <div className="rounded-[2rem] bg-white p-6 shadow-xl">
            <h2 className="text-2xl font-black text-slate-900">
              Uploaded NIN Document
            </h2>

            <p className="mt-2 text-sm text-slate-600">
              Your uploaded document preview will appear here after submission.
            </p>

            <div className="mt-5 overflow-hidden rounded-2xl border bg-slate-100">
              {profile?.nin_image_url ? (
                <img
                  src={profile.nin_image_url}
                  alt="NIN document"
                  className="h-72 w-full object-cover"
                />
              ) : (
                <div className="flex h-72 items-center justify-center text-center text-slate-500">
                  No NIN document uploaded yet.
                </div>
              )}
            </div>
          </div>

          <div className="rounded-[2rem] bg-slate-950 p-6 text-white shadow-xl">
            <h2 className="text-2xl font-black">
              Verification Tips
            </h2>

            <div className="mt-5 space-y-4 text-sm leading-7 text-slate-300">
              <p>✅ Use a clear image of your NIN document.</p>
              <p>✅ Make sure your phone and WhatsApp numbers are correct.</p>
              <p>✅ Your profile becomes more trusted after approval.</p>
              <p>✅ Admin may add a note if your submission needs correction.</p>
            </div>
          </div>
        </aside>
      </motion.section>
    </div>
  );
}