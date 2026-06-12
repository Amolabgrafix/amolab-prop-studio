import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function ProtectedAdminRoute({ children }) {
  const [loading, setLoading] = useState(true);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    async function checkAdminAccess() {
      setLoading(true);

      const { data: authData, error: authError } = await supabase.auth.getUser();

      console.log("AUTH DATA:", authData);
      console.log("AUTH ERROR:", authError);

      if (authError || !authData?.user) {
        setAllowed(false);
        setLoading(false);
        return;
      }

      const userId = authData.user.id;

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id, email, role")
        .eq("id", userId)
        .maybeSingle();

      console.log("PROFILE DATA:", profile);
      console.log("PROFILE ERROR:", profileError);

      if (profile?.role === "admin") {
        setAllowed(true);
      } else {
        setAllowed(false);
      }

      setLoading(false);
    }

    checkAdminAccess();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Checking admin access...
      </div>
    );
  }

  if (!allowed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
        <div className="bg-white p-8 rounded-xl shadow text-center max-w-md">
          <h1 className="text-3xl font-bold text-red-600 mb-4">
            Access Denied
          </h1>
          <p className="text-gray-600">
            You are not allowed to access this admin page.
          </p>
        </div>
      </div>
    );
  }

  return children;
}