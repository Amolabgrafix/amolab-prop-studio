import { useMemo, useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { generatePropertyAssistantReply } from "../lib/aiAssistant";

export default function AIPropertyAssistant({ property }) {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const chatRef = useRef(null);

  const suggestedQuestions = useMemo(
    () => [
      "Is this property worth the price?",
      "Can I negotiate this price?",
      "What rental income can I expect?",
      "Is this a good investment?",
      "Who is this property best for?",
      "What are the risks?",
    ],
    []
  );

  useEffect(() => {
    chatRef.current?.scrollTo({
      top: chatRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, loading]);

  async function askAI(customQuestion) {
    const userQuestion = customQuestion || question.trim();
    if (!userQuestion || loading) return;

    const userMessage = {
      role: "user",
      text: userQuestion,
    };

    setMessages((prev) => [...prev, userMessage]);
    setQuestion("");
    setLoading(true);

    setTimeout(() => {
      const reply = generatePropertyAssistantReply(property, userQuestion);

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          ...reply,
        },
      ]);

      setLoading(false);
    }, 900);
  }

  if (!property) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="relative overflow-hidden rounded-3xl border border-purple-200 bg-white/90 p-5 shadow-xl dark:border-purple-800 dark:bg-slate-950/90 md:p-7"
    >
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-purple-600 via-fuchsia-500 to-indigo-600" />

      <div className="flex items-start gap-4">
        <motion.div
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-700 text-2xl text-white shadow-lg"
        >
          🤖
        </motion.div>

        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">
            AI Property Assistant
          </h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            Ask smart questions about price, investment value, negotiation,
            rental potential and buyer suitability.
          </p>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {suggestedQuestions.map((item) => (
          <button
            key={item}
            onClick={() => askAI(item)}
            className="rounded-full border border-purple-200 bg-purple-50 px-4 py-2 text-sm font-semibold text-purple-700 transition hover:bg-purple-700 hover:text-white dark:border-purple-700 dark:bg-purple-950 dark:text-purple-200"
          >
            {item}
          </button>
        ))}
      </div>

      <div
        ref={chatRef}
        className="mt-6 max-h-[420px] space-y-4 overflow-y-auto rounded-2xl bg-slate-50 p-4 dark:bg-slate-900"
      >
        {messages.length === 0 && (
          <div className="rounded-2xl border border-dashed border-purple-300 bg-white p-5 text-sm text-slate-600 dark:border-purple-700 dark:bg-slate-950 dark:text-slate-300">
            Start by asking:{" "}
            <span className="font-bold text-purple-700 dark:text-purple-300">
              “Is this property worth buying?”
            </span>
          </div>
        )}

        <AnimatePresence>
          {messages.map((msg, index) =>
            msg.role === "user" ? (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                className="ml-auto max-w-[85%] rounded-2xl bg-purple-700 px-4 py-3 text-sm font-medium text-white shadow"
              >
                {msg.text}
              </motion.div>
            ) : (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                className="max-w-[92%] rounded-2xl border border-slate-200 bg-white p-5 shadow dark:border-slate-700 dark:bg-slate-950"
              >
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-black text-slate-900 dark:text-white">
                    🤖 AI Property Insight
                  </h3>
                  <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700 dark:bg-green-950 dark:text-green-300">
                    {msg.confidence}% Confidence
                  </span>
                </div>

                <p className="mt-3 text-sm leading-6 text-slate-700 dark:text-slate-300">
                  {msg.summary}
                </p>

                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <div className="rounded-xl bg-green-50 p-4 dark:bg-green-950/40">
                    <h4 className="font-bold text-green-700 dark:text-green-300">
                      Pros
                    </h4>
                    <ul className="mt-2 space-y-1 text-sm text-slate-700 dark:text-slate-300">
                      {msg.pros.map((pro, i) => (
                        <li key={i}>✓ {pro}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="rounded-xl bg-amber-50 p-4 dark:bg-amber-950/40">
                    <h4 className="font-bold text-amber-700 dark:text-amber-300">
                      Watch Points
                    </h4>
                    <ul className="mt-2 space-y-1 text-sm text-slate-700 dark:text-slate-300">
                      {msg.cons.map((con, i) => (
                        <li key={i}>• {con}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-4 rounded-xl bg-purple-50 p-4 dark:bg-purple-950/40">
                  <p className="text-sm font-bold text-purple-700 dark:text-purple-300">
                    Recommended Action
                  </p>
                  <p className="mt-1 text-lg font-black text-slate-900 dark:text-white">
                    {msg.action}
                  </p>
                </div>
              </motion.div>
            )
          )}
        </AnimatePresence>

        {loading && (
          <div className="flex items-center gap-2 rounded-2xl bg-white p-4 text-sm font-semibold text-slate-600 shadow dark:bg-slate-950 dark:text-slate-300">
            🤖 Thinking
            <span className="animate-bounce">.</span>
            <span className="animate-bounce delay-150">.</span>
            <span className="animate-bounce delay-300">.</span>
          </div>
        )}
      </div>

      <div className="mt-5 flex flex-col gap-3 md:flex-row">
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              askAI();
            }
          }}
          placeholder="Ask anything about this property..."
          rows={2}
          className="min-h-[58px] flex-1 resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-purple-500 focus:ring-4 focus:ring-purple-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:ring-purple-950"
        />

        <button
          onClick={() => askAI()}
          disabled={loading || !question.trim()}
          className="rounded-2xl bg-purple-700 px-7 py-3 font-black text-white shadow-lg transition hover:bg-purple-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Ask AI
        </button>
      </div>
    </motion.section>
  );
}