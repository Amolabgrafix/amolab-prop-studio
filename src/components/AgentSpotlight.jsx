import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "../lib/supabase";

export default function AgentSpotlight() {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAgents() {
      setLoading(true);

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("role", "seller")
        .order("created_at", { ascending: false })
        .limit(6);

      if (!error) {
        setAgents(data || []);
      }

      setLoading(false);
    }

    loadAgents();
  }, []);

  if (!loading && agents.length === 0) return null;

  return (
    <section className="bg-slate-50 py-24 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.35em] text-purple-600 dark:text-purple-300">
              Agent Spotlight
            </p>

            <h2 className="mt-3 text-4xl font-black text-slate-950 dark:text-white md:text-5xl">
              Meet Top Property Agents
            </h2>

            <p className="mt-4 max-w-2xl text-slate-600 dark:text-slate-400">
              Connect with trusted and verified agents helping buyers and
              sellers achieve better results.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="grid gap-8 md:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-80 animate-pulse rounded-3xl bg-slate-200 dark:bg-white/10"
              />
            ))}
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
            {agents.map((agent, index) => (
              <motion.div
                key={agent.id}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08 }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/80"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-purple-700 to-indigo-700 text-2xl font-black text-white">
                    {(agent.fullname || agent.username || "A")
                      .charAt(0)
                      .toUpperCase()}
                  </div>

                  <div>
                    <h3 className="text-xl font-black text-slate-950 dark:text-white">
                      {agent.fullname ||
                        agent.username ||
                        "Verified Agent"}
                    </h3>

                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {agent.email}
                    </p>

                    <span className="mt-2 inline-block rounded-full bg-green-100 px-3 py-1 text-xs font-black text-green-700 dark:bg-green-500/10 dark:text-green-300">
                      ✓ Verified Agent
                    </span>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-4">
                  <div className="rounded-2xl bg-slate-50 p-4 dark:bg-white/5">
                    <p className="text-xs font-black uppercase text-slate-500">
                      Role
                    </p>
                    <p className="mt-1 font-black capitalize">
                      {agent.role}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-slate-50 p-4 dark:bg-white/5">
                    <p className="text-xs font-black uppercase text-slate-500">
                      Status
                    </p>
                    <p className="mt-1 font-black capitalize">
                      {agent.status || "active"}
                    </p>
                  </div>
                </div>

                <Link
                  to={`/agent/${agent.id}`}
                  className="mt-6 block rounded-2xl bg-purple-700 px-5 py-3 text-center font-black text-white transition hover:bg-purple-800"
                >
                  View Agent Profile
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}