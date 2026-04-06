import { motion } from "framer-motion";

export default function VisitorManagement() {
  return (
    <section className="py-18 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <motion.h2
          initial={{ opacity: 0, y: -25 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center text-3xl md:text-4xl font-bold text-blue-600"
        >
          Visitor & Delivery Management System
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.25, duration: 0.6 }}
          viewport={{ once: true }}
          className="mt-4 max-w-4xl mx-auto text-center text-gray-600"
        >
          Guard panel workflow for handling visitors and deliveries without
          showing live data.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mt-12 overflow-hidden"
        >
          <div className="grid lg:grid-cols-1 gap-6">
            <div className="lg:col-span-2 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Guard Panel Workflow
                  </h3>
                  <p className="text-sm text-gray-500">
                    Visual overview of how visitors and deliveries are handled.
                  </p>
                </div>
                <div className="rounded-full bg-blue-50 px-4 py-2 text-xs font-semibold text-blue-700">
                  Live Guard Actions
                </div>
              </div>

              <div className="mt-6 grid md:grid-cols-2 gap-6">
                <div className="rounded-xl border border-gray-200 p-5">
                  <p className="text-sm font-semibold text-gray-900">
                    Visitor Flow
                  </p>
                  <div className="mt-4 space-y-3">
                    {[
                      "Request created by resident",
                      "Guard verifies ID and purpose",
                      "Resident approval or rejection",
                      "Entry logged with timestamp",
                      "Exit recorded for audit",
                    ].map((step, index) => (
                      <div key={step} className="flex items-start gap-3">
                        <div className="mt-0.5 h-7 w-7 rounded-full bg-blue-600 text-white text-xs font-semibold flex items-center justify-center">
                          {index + 1}
                        </div>
                        <p className="text-sm text-gray-600">{step}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-xl border border-gray-200 p-5">
                  <p className="text-sm font-semibold text-gray-900">
                    Delivery Flow
                  </p>
                  <div className="mt-4 space-y-3">
                    {[
                      "Courier arrives at gate",
                      "Package scanned and logged",
                      "Resident notified instantly",
                      "Collect or authorize drop-off",
                      "Proof of delivery captured",
                    ].map((step, index) => (
                      <div key={step} className="flex items-start gap-3">
                        <div className="mt-0.5 h-7 w-7 rounded-full bg-green-600 text-white text-xs font-semibold flex items-center justify-center">
                          {index + 1}
                        </div>
                        <p className="text-sm text-gray-600">{step}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-6 grid sm:grid-cols-3 gap-4">
                {[
                  {
                    title: "ID Verification",
                    text: "Aadhaar or QR scan at the gate.",
                    tone: "bg-gray-50",
                  },
                  {
                    title: "Resident Approval",
                    text: "OTP or in-app confirmation.",
                    tone: "bg-blue-50",
                  },
                  {
                    title: "Audit Trail",
                    text: "Every entry and exit is logged.",
                    tone: "bg-green-50",
                  },
                ].map((card) => (
                  <div
                    key={card.title}
                    className={`rounded-xl border border-gray-200 p-4 ${card.tone}`}
                  >
                    <p className="text-sm font-semibold text-gray-900">
                      {card.title}
                    </p>
                    <p className="mt-1 text-xs text-gray-600">{card.text}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900">
                Guard Actions
              </h3>
              <p className="text-sm text-gray-500">
                These buttons represent what the guard can do in the panel.
              </p>

              <div className="mt-5 grid gap-4">
                {[
                  {
                    title: "Approve Visitor",
                    text: "Allow entry and notify resident.",
                    badge: "Approved",
                    badgeStyle: "bg-green-100 text-green-700",
                    buttonStyle: "border-green-200 text-green-700",
                  },
                  {
                    title: "Reject Visitor",
                    text: "Block access and log reason.",
                    badge: "Rejected",
                    badgeStyle: "bg-red-100 text-red-700",
                    buttonStyle: "border-red-200 text-red-700",
                  },
                  {
                    title: "Mark Visited",
                    text: "Entry confirmed with timestamp.",
                    badge: "Visited",
                    badgeStyle: "bg-blue-100 text-blue-700",
                    buttonStyle: "border-blue-200 text-blue-700",
                  },
                  {
                    title: "Accept Delivery",
                    text: "Log package and notify resident.",
                    badge: "Received",
                    badgeStyle: "bg-purple-100 text-purple-700",
                    buttonStyle: "border-purple-200 text-purple-700",
                  },
                  {
                    title: "Return to Sender",
                    text: "Delivery refused and recorded.",
                    badge: "Returned",
                    badgeStyle: "bg-yellow-100 text-yellow-700",
                    buttonStyle: "border-yellow-200 text-yellow-700",
                  },
                ].map((action) => (
                  <div
                    key={action.title}
                    className="rounded-xl border border-gray-200 p-4"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-gray-800">
                        {action.title}
                      </p>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${action.badgeStyle}`}
                      >
                        {action.badge}
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-gray-500">{action.text}</p>
                    <button
                      type="button"
                      disabled
                      className={`mt-3 w-full rounded-lg border px-4 py-2 text-sm font-semibold ${action.buttonStyle} bg-gray-50 cursor-not-allowed`}
                    >
                      Demo Action
                    </button>
                  </div>
                ))}
              </div>

              <div className="mt-6 rounded-xl bg-gray-900 p-4 text-white">
                <p className="text-sm font-semibold">Realtime Sync</p>
                <p className="mt-1 text-xs text-gray-300">
                  Guard actions sync to resident app, reports, and security logs.
                </p>
              </div>
            </div> */}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
