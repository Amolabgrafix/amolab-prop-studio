import { useState } from "react";
import { supabase } from "../lib/supabase";

export default function PropertyOfferBox({ property }) {
  const [offerAmount, setOfferAmount] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState("");

  async function submitOffer(e) {
    e.preventDefault();
    setNotice("");

    if (!property?.id || !property?.owner_id) {
      setNotice("Property information is incomplete.");
      return;
    }

    if (!offerAmount || Number(offerAmount) <= 0) {
      setNotice("Enter a valid offer amount.");
      return;
    }

    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setNotice("Please login before submitting an offer.");
      setLoading(false);
      return;
    }

    const { error } = await supabase.from("property_offers").insert({
      property_id: property.id,
      buyer_id: user.id,
      seller_id: property.owner_id,
      offer_amount: Number(offerAmount),
      message,
      status: "pending",
    });

    if (error) {
      setNotice(error.message);
    } else {
      setOfferAmount("");
      setMessage("");
      setNotice("Offer submitted successfully.");
    }

    setLoading(false);
  }

  return (
    <div className="rounded-3xl border border-purple-100 bg-white p-6 shadow-xl dark:border-purple-900 dark:bg-slate-950">
      <h2 className="text-2xl font-black text-slate-900 dark:text-white">
        Make an Offer
      </h2>

      <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
        Submit a serious offer directly to the seller.
      </p>

      <form onSubmit={submitOffer} className="mt-5 space-y-4">
        <input
          type="number"
          value={offerAmount}
          onChange={(e) => setOfferAmount(e.target.value)}
          placeholder="Offer amount e.g. 120000000"
          className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-purple-600 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
        />

        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={4}
          placeholder="Message to seller..."
          className="w-full resize-none rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-purple-600 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
        />

        {notice && (
          <p className="rounded-xl bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-700 dark:bg-slate-900 dark:text-slate-300">
            {notice}
          </p>
        )}

        <button
          disabled={loading}
          className="w-full rounded-2xl bg-purple-700 px-5 py-3 font-black text-white shadow-lg hover:bg-purple-800 disabled:opacity-50"
        >
          {loading ? "Submitting..." : "Submit Offer"}
        </button>
      </form>
    </div>
  );
}