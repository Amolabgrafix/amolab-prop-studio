import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

export default function SellerVerification() {
  const [profile, setProfile] = useState(null);
  const [ninNumber, setNinNumber] = useState("");
  const [ninImage, setNinImage] = useState(null);
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
        verification_status: "pending",
        verification_note: null,
      });

      if (saveError) throw saveError;

      setMessage("Verification submitted successfully. Admin will review it.");
      await fetchProfile();
    } catch (error) {
      setMessage(error.message);
    }

    setSubmitting(false);
  }

  if (loading) {
    return <div className="p-10">Loading verification page...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-100 px-6 py-10">
      <div className="mx-auto max-w-3xl rounded-2xl bg-white p-6 shadow">
        <h1 className="text-3xl font-bold text-slate-900">
          Seller Verification
        </h1>

        <p className="mt-2 text-slate-600">
          Submit your NIN details so admin can verify your account.
        </p>

        <div className="mt-6 rounded-xl bg-slate-50 p-4">
          <p className="font-semibold">
            Current Status:{" "}
            <span className="capitalize text-purple-700">
              {profile?.verification_status || "unverified"}
            </span>
          </p>

          {profile?.verification_note && (
            <p className="mt-2 text-sm text-red-600">
              Note: {profile.verification_note}
            </p>
          )}
        </div>

        {message && (
          <div className="mt-5 rounded-xl bg-purple-100 p-4 text-purple-700">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <input
            type="text"
            value={ninNumber}
            onChange={(e) => setNinNumber(e.target.value)}
            placeholder="Enter your NIN number"
            required
            className="w-full rounded-lg border border-gray-300 px-4 py-3"
          />

          <input
            type="file"
            accept="image/*"
            onChange={(e) => setNinImage(e.target.files[0])}
            required={!profile?.nin_image_url}
            className="w-full rounded-lg border border-gray-300 px-4 py-3"
          />

          {profile?.nin_image_url && (
            <div>
              <p className="mb-2 font-semibold text-slate-700">
                Uploaded NIN Image:
              </p>
              <img
                src={profile.nin_image_url}
                alt="NIN document"
                className="h-48 rounded-xl border object-cover"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-purple-700 px-6 py-3 font-semibold text-white disabled:bg-gray-400"
          >
            {submitting ? "Submitting..." : "Submit Verification"}
          </button>
        </form>
      </div>
    </div>
  );
}