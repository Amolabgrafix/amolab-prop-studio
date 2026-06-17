import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const reference = searchParams.get("reference");

  const [status, setStatus] = useState("Verifying your payment...");
  const [success, setSuccess] = useState(false);
  const [backLink, setBackLink] = useState("/dashboard/seller/properties");
  const [backText, setBackText] = useState("Back to My Properties");

  useEffect(() => {
    async function verifyPayment() {
      if (!reference) {
        setStatus("No payment reference found.");
        return;
      }

      let functionName;
      let successMessage;

      if (reference.startsWith("BOOST-")) {
        functionName = "verify-boost-payment";
        successMessage = "Your property boost has been activated successfully.";
        setBackLink("/dashboard/seller/properties");
        setBackText("Back to My Properties");
      } else if (reference.startsWith("FEATURE-")) {
        functionName = "verify-featured-payment";
        successMessage = "Your property feature has been activated successfully.";
        setBackLink("/dashboard/seller/properties");
        setBackText("Back to My Properties");
      } else if (reference.startsWith("SUB-")) {
        functionName = "verify-subscription-payment";
        successMessage = "Your subscription has been activated successfully.";
        setBackLink("/dashboard/seller/subscription");
        setBackText("Back to Subscription Plans");
      } else {
        setStatus("Unknown payment type.");
        return;
      }

      const { data, error } = await supabase.functions.invoke(functionName, {
        body: { reference },
      });

      if (error || !data?.success) {
        setStatus(data?.error || error?.message || "Payment verification failed.");
        setSuccess(false);
        return;
      }

      setSuccess(true);
      setStatus(successMessage);
    }

    verifyPayment();
  }, [reference]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <div className="max-w-lg rounded-2xl bg-white p-8 text-center shadow">
        <h1
          className={`text-3xl font-bold ${
            success ? "text-green-600" : "text-purple-700"
          }`}
        >
          {success ? "Payment Successful" : "Processing Payment"}
        </h1>

        <p className="mt-4 text-slate-600">{status}</p>

        {reference && (
          <p className="mt-4 rounded-lg bg-slate-100 p-3 text-sm text-slate-600">
            Reference: {reference}
          </p>
        )}

        <Link
        to={backLink}
        replace
        className="mt-6 inline-block rounded-xl bg-purple-700 px-6 py-3 font-semibold text-white hover:bg-purple-800"
      >
        {backText}
      </Link>
      </div>
    </div>
  );
}