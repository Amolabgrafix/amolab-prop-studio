import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { createNotification } from "../../lib/createNotification";

export default function SellerOffers() {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [message, setMessage] = useState("");
  const [counterValues, setCounterValues] = useState({});
  const [sellerNotes, setSellerNotes] = useState({});

  function formatMoney(value) {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      maximumFractionDigits: 0,
    }).format(Number(value || 0));
  }

  async function loadOffers() {
    setLoading(true);
    setMessage("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setMessage("Please login to view your offers.");
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("property_offers")
      .select(
        `
        *,
        properties (
          id,
          title,
          price,
          city,
          state,
          location,
          image_url
        )
      `
      )
      .eq("seller_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      setMessage(error.message);
    } else {
      setOffers(data || []);
    }

    setLoading(false);
  }

async function updateOffer(offer, updates) {
  setUpdatingId(offer.id);
  setMessage("");

  const { error } = await supabase
    .from("property_offers")
    .update(updates)
    .eq("id", offer.id);

  if (error) {
    setMessage(error.message);
  } else {
    let notificationTitle = "Offer Updated";
    let notificationMessage = "Your property offer has been updated.";

    if (updates.status === "accepted") {
      notificationTitle = "🎉 Offer Accepted";
      notificationMessage = `Your offer for "${offer.properties?.title}" has been accepted by the seller.`;
    }

    if (updates.status === "rejected") {
      notificationTitle = "❌ Offer Rejected";
      notificationMessage = `Your offer for "${offer.properties?.title}" was rejected by the seller.`;
    }

    if (updates.status === "countered") {
      notificationTitle = "💰 Counter Offer";
      notificationMessage = `The seller sent you a counter offer for "${offer.properties?.title}".`;
    }

    await createNotification({
      userId: offer.buyer_id,
      title: notificationTitle,
      message: notificationMessage,
      type: "offer",
      link: "/dashboard/my-offers",
    });

    await loadOffers();
    setMessage("Offer updated successfully.");
  }

  setUpdatingId(null);
}

  async function submitCounter(offer) {
    const counterAmount = counterValues[offer.id];
    const sellerNote = sellerNotes[offer.id] || "";

    if (!counterAmount || Number(counterAmount) <= 0) {
      setMessage("Enter a valid counter offer amount.");
      return;
    }

    await updateOffer(offer, {
      status: "countered",
      counter_amount: Number(counterAmount),
      seller_note: sellerNote,
    });

    setCounterValues((prev) => ({ ...prev, [offer.id]: "" }));
    setSellerNotes((prev) => ({ ...prev, [offer.id]: "" }));
  }

  function badge(status) {
    const base =
      "rounded-full px-3 py-1 text-xs font-black capitalize tracking-wide";

    if (status === "accepted")
      return `${base} bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300`;

    if (status === "rejected")
      return `${base} bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300`;

    if (status === "countered")
      return `${base} bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300`;

    return `${base} bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300`;
  }

  useEffect(() => {
    async function initializeOffers() {
      await loadOffers();
    }

    initializeOffers();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 dark:bg-slate-950 md:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="rounded-3xl bg-gradient-to-r from-purple-700 to-indigo-700 p-8 text-white shadow-xl">
          <p className="text-sm font-bold uppercase tracking-[0.25em] text-purple-100">
            Seller CRM
          </p>
          <h1 className="mt-2 text-3xl font-black md:text-4xl">
            Offers Received
          </h1>
          <p className="mt-3 max-w-2xl text-purple-100">
            Review buyer offers, accept serious deals, reject weak offers, or
            send a professional counter offer.
          </p>
        </div>

        {message && (
          <div className="mt-6 rounded-2xl bg-white p-4 text-sm font-semibold text-slate-700 shadow dark:bg-slate-900 dark:text-slate-300">
            {message}
          </div>
        )}

        {loading ? (
          <div className="mt-8 rounded-3xl bg-white p-8 text-center font-bold text-slate-600 shadow dark:bg-slate-900 dark:text-slate-300">
            Loading offers...
          </div>
        ) : offers.length === 0 ? (
          <div className="mt-8 rounded-3xl bg-white p-8 text-center shadow dark:bg-slate-900">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">
              No offers yet
            </h2>
            <p className="mt-2 text-slate-600 dark:text-slate-300">
              When buyers submit offers on your properties, they will appear
              here.
            </p>
          </div>
        ) : (
          <div className="mt-8 grid gap-6">
            {offers.map((offer) => {
              const property = offer.properties || {};

              return (
                <div
                  key={offer.id}
                  className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-900"
                >
                  <div className="grid gap-0 md:grid-cols-[260px_1fr]">
                    <div className="h-56 bg-slate-200 md:h-full dark:bg-slate-800">
                      {property.image_url ? (
                        <img
                          src={property.image_url}
                          alt={property.title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-sm font-bold text-slate-500">
                          No Image
                        </div>
                      )}
                    </div>

                    <div className="p-6">
                      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                        <div>
                          <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                            {property.title || "Property Offer"}
                          </h2>
                          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                            {[property.city || property.location, property.state]
                              .filter(Boolean)
                              .join(", ") || "Location not specified"}
                          </p>
                        </div>

                        <span className={badge(offer.status)}>
                          {offer.status || "pending"}
                        </span>
                      </div>

                      <div className="mt-6 grid gap-4 md:grid-cols-3">
                        <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-950">
                          <p className="text-xs font-bold uppercase text-slate-500">
                            Listed Price
                          </p>
                          <p className="mt-1 text-lg font-black text-slate-900 dark:text-white">
                            {formatMoney(property.price)}
                          </p>
                        </div>

                        <div className="rounded-2xl bg-purple-50 p-4 dark:bg-purple-950/40">
                          <p className="text-xs font-bold uppercase text-purple-600 dark:text-purple-300">
                            Buyer Offer
                          </p>
                          <p className="mt-1 text-lg font-black text-purple-800 dark:text-purple-200">
                            {formatMoney(offer.offer_amount)}
                          </p>
                        </div>

                        <div className="rounded-2xl bg-blue-50 p-4 dark:bg-blue-950/40">
                          <p className="text-xs font-bold uppercase text-blue-600 dark:text-blue-300">
                            Counter Offer
                          </p>
                          <p className="mt-1 text-lg font-black text-blue-800 dark:text-blue-200">
                            {offer.counter_amount
                              ? formatMoney(offer.counter_amount)
                              : "Not sent"}
                          </p>
                        </div>
                      </div>

                      {offer.message && (
                        <div className="mt-5 rounded-2xl bg-slate-50 p-4 dark:bg-slate-950">
                          <p className="text-xs font-bold uppercase text-slate-500">
                            Buyer Message
                          </p>
                          <p className="mt-2 text-sm leading-6 text-slate-700 dark:text-slate-300">
                            {offer.message}
                          </p>
                        </div>
                      )}

                      {offer.seller_note && (
                        <div className="mt-5 rounded-2xl bg-blue-50 p-4 dark:bg-blue-950/40">
                          <p className="text-xs font-bold uppercase text-blue-600 dark:text-blue-300">
                            Seller Note
                          </p>
                          <p className="mt-2 text-sm leading-6 text-slate-700 dark:text-slate-300">
                            {offer.seller_note}
                          </p>
                        </div>
                      )}

                      <div className="mt-6 grid gap-3 md:grid-cols-3">
                        <button
                         onClick={() =>
                            updateOffer(offer, { status: "accepted" })
                          }
                          disabled={updatingId === offer.id}
                          className="rounded-2xl bg-green-600 px-4 py-3 font-black text-white hover:bg-green-700 disabled:opacity-50"
                        >
                          Accept
                        </button>

                        <button
                          onClick={() =>
                            updateOffer(offer, { status: "rejected" })
                          }
                          disabled={updatingId === offer.id}
                          className="rounded-2xl bg-red-600 px-4 py-3 font-black text-white hover:bg-red-700 disabled:opacity-50"
                        >
                          Reject
                        </button>

                        <button
                          onClick={() => submitCounter(offer)}
                          disabled={updatingId === offer.id}
                          className="rounded-2xl bg-purple-700 px-4 py-3 font-black text-white hover:bg-purple-800 disabled:opacity-50"
                        >
                          Send Counter
                        </button>
                      </div>

                      <div className="mt-4 grid gap-3 md:grid-cols-2">
                        <input
                          type="number"
                          value={counterValues[offer.id] || ""}
                          onChange={(e) =>
                            setCounterValues((prev) => ({
                              ...prev,
                              [offer.id]: e.target.value,
                            }))
                          }
                          placeholder="Counter offer amount"
                          className="rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-purple-600 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                        />

                        <input
                          value={sellerNotes[offer.id] || ""}
                          onChange={(e) =>
                            setSellerNotes((prev) => ({
                              ...prev,
                              [offer.id]: e.target.value,
                            }))
                          }
                          placeholder="Seller note"
                          className="rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-purple-600 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}