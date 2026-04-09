import { useState, useEffect, useMemo } from "react";
import { message, Spin } from "antd";
import { motion, AnimatePresence } from "framer-motion";
import { Wallet, Calendar, Home, CheckCircle, ArrowUpRight, ReceiptText } from "lucide-react";
import ResidentLayout from "@/components/Layout/ResidentLayout";
import { getMyBills, createRazorpayOrder, verifyPayment } from "@/api/residentBillApi";
import CountUp from "react-countup";
import confetti from "canvas-confetti";
import { loadRazorpayScript } from "@/utils/razorpay";
import { useTheme } from "@/context/ThemeContext";

const baseStyles = {
  page: {
    width: "100%",
    minHeight: "100%",
    background: "rgba(248, 250, 252, 0.5)",
    borderRadius: 16,
    padding: 24,
    boxSizing: "border-box",
  },
  container: {
    maxWidth: 1280,
    margin: "0 auto",
  },
  headerWrap: {
    width: "100%",
    background: "#ffffff",
    borderBottom: "1px solid #e2e8f0",
    borderRadius: 12,
  },
  headerInner: {
    maxWidth: 1280,
    margin: "0 auto",
    padding: "24px 28px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 24,
    flexWrap: "wrap",
  },
  titleBlock: { display: "flex", flexDirection: "column", gap: 4 },
  titleRow: { display: "flex", alignItems: "center", gap: 12 },
  titleIcon: {
    padding: 10,
    background: "#4f46e5",
    borderRadius: 12,
    color: "#ffffff",
    boxShadow: "0 8px 20px rgba(99, 102, 241, 0.25)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    margin: 0,
    fontSize: 40,
    lineHeight: 1.05,
    fontWeight: 800,
    color: "#0f172a",
    letterSpacing: "-0.02em",
  },
  subtitle: {
    margin: 0,
    color: "#64748b",
    fontSize: 16,
    lineHeight: 1.1,
  },
  statCard: {
    display: "flex",
    alignItems: "center",
    gap: 20,
    background: "#4f46e5",
    color: "#ffffff",
    padding: "16px 24px",
    borderRadius: 18,
    boxShadow: "0 10px 25px rgba(99, 102, 241, 0.25)",
    minWidth: 260,
  },
  statIcon: {
    background: "rgba(255,255,255,0.2)",
    padding: 12,
    borderRadius: 9999,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  statLabel: {
    margin: 0,
    color: "#e0e7ff",
    fontSize: 10,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.1em",
    lineHeight: 1,
  },
  statValue: {
    fontSize: 36,
    lineHeight: 1,
    fontWeight: 900,
    marginTop: 2,
  },
  main: {
    maxWidth: 1280,
    margin: "0 auto",
    padding: "20px 28px 30px",
  },
  loadingWrap: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "120px 0",
    gap: 16,
  },
  loadingText: { color: "#94a3b8", fontWeight: 500, fontSize: 14, margin: 0 },
  emptyCard: {
    background: "#ffffff",
    borderRadius: 24,
    border: "1px dashed #cbd5e1",
    padding: 48,
    textAlign: "center",
    boxShadow: "0 2px 8px rgba(15, 23, 42, 0.05)",
  },
  emptyIcon: {
    width: 80,
    height: 80,
    background: "#ecfdf5",
    color: "#10b981",
    borderRadius: 9999,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 24px",
  },
  emptyTitle: { margin: 0, fontSize: 32, fontWeight: 700, color: "#1e293b" },
  emptyText: {
    color: "#64748b",
    margin: "8px auto 0",
    maxWidth: 420,
    fontSize: 14,
    lineHeight: 1.4,
  },
  billGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
    gap: 24,
  },
  billCard: {
    display: "flex",
    flexDirection: "column",
    background: "#ffffff",
    borderRadius: 24,
    border: "1px solid #e2e8f0",
    padding: 24,
  },
  billTop: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18 },
  billMonth: { fontSize: 11, fontWeight: 900, color: "#6366f1", letterSpacing: "0.06em", textTransform: "uppercase", lineHeight: 1 },
  billTitle: { margin: "8px 0 0", fontSize: 28, fontWeight: 700, color: "#0f172a", lineHeight: 1 },
  statusBase: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    padding: "4px 12px",
    borderRadius: 9999,
    fontSize: 10,
    fontWeight: 900,
    letterSpacing: "0.04em",
    lineHeight: 1,
  },
  amountBlock: { marginBottom: 18 },
  amountLabel: { margin: 0, fontSize: 12, color: "#94a3b8", fontWeight: 600, lineHeight: 1 },
  amountRow: { display: "flex", alignItems: "baseline", gap: 4, marginTop: 2 },
  amountSymbol: { fontSize: 32, fontWeight: 700, color: "#0f172a", lineHeight: 1 },
  amountValue: { fontSize: 56, fontWeight: 900, color: "#0f172a", lineHeight: 1 },
  infoWrap: { borderTop: "1px solid #e2e8f0", paddingTop: 10, marginBottom: 10, display: "flex", flexDirection: "column", gap: 10 },
  infoRow: { display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 14, lineHeight: 1 },
  infoLeft: { display: "flex", alignItems: "center", gap: 8, color: "#64748b", fontWeight: 500 },
  infoRight: { color: "#334155", fontWeight: 700 },
  actionWrap: { marginTop: "auto" },
  paidBox: {
    width: "100%",
    padding: "10px 0",
    background: "#f8fafc",
    borderRadius: 9999,
    color: "#94a3b8",
    fontWeight: 700,
    fontSize: 12,
    textAlign: "center",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    border: "1px solid #f1f5f9",
    lineHeight: 1,
  },
  payBtn: {
    width: "100%",
    padding: "10px 0",
    background: "#0f172a",
    color: "#ffffff",
    borderRadius: 9999,
    fontWeight: 700,
    fontSize: 14,
    border: "none",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    lineHeight: 1,
  },
};

const darkOverrides = {
  page: {
    background: "rgba(2, 6, 23, 0.6)",
  },
  headerWrap: {
    background: "#0f172a",
    borderBottom: "1px solid rgba(148, 163, 184, 0.22)",
  },
  title: { color: "#e2e8f0" },
  subtitle: { color: "#94a3b8" },
  statCard: {
    background: "linear-gradient(135deg, #1d4ed8, #4f46e5)",
    boxShadow: "0 10px 25px rgba(59, 130, 246, 0.25)",
  },
  emptyCard: {
    background: "#0f172a",
    border: "1px dashed rgba(148, 163, 184, 0.3)",
  },
  emptyTitle: { color: "#e2e8f0" },
  emptyText: { color: "#94a3b8" },
  billCard: {
    background: "#0f172a",
    border: "1px solid rgba(148, 163, 184, 0.22)",
  },
  billTitle: { color: "#e2e8f0" },
  amountSymbol: { color: "#e2e8f0" },
  amountValue: { color: "#e2e8f0" },
  infoWrap: { borderTop: "1px solid rgba(148, 163, 184, 0.22)" },
  infoLeft: { color: "#94a3b8" },
  infoRight: { color: "#e2e8f0" },
  paidBox: {
    background: "rgba(148, 163, 184, 0.12)",
    border: "1px solid rgba(148, 163, 184, 0.22)",
    color: "#cbd5e1",
  },
  payBtn: {
    background: "linear-gradient(135deg, #2563eb, #4f46e5)",
    boxShadow: "0 10px 18px rgba(37, 99, 235, 0.28)",
  },
};

const mergeStyles = (base, overrides) =>
  Object.keys(base).reduce((acc, key) => {
    acc[key] = { ...base[key], ...(overrides[key] || {}) };
    return acc;
  }, {});

export default function ResidentBills() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const styles = useMemo(() => (isDark ? mergeStyles(baseStyles, darkOverrides) : baseStyles), [isDark]);
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [payingBillId, setPayingBillId] = useState(null);

  useEffect(() => {
    fetchBills();
  }, []);

  const fetchBills = async () => {
    try {
      setLoading(true);
      const res = await getMyBills();
      setBills(res.data || []);
    } catch (err) {
      message.error("Failed to load bills");
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async (bill) => {
    try {
      setPayingBillId(bill._id);
      const orderRes = await createRazorpayOrder({
        amount: bill.remainingAmount,
        billId: bill._id,
      });

      if (!orderRes.data.success) throw new Error("Order creation failed");

      const { order } = orderRes.data;
      const razorpayKey =
        import.meta.env.VITE_RAZORPAY_KEY_ID ||
        import.meta.env.REACT_APP_RAZORPAY_KEY_ID;

      if (!razorpayKey) {
        throw new Error("Razorpay key is not configured");
      }

      const razorpayReady = await loadRazorpayScript();
      if (!razorpayReady) {
        throw new Error("Failed to load Razorpay checkout");
      }

      const options = {
        key: razorpayKey,
        amount: order.amount,
        currency: order.currency,
        name: "Society Maintenance",
        description: `Bill for ${bill.month}`,
        order_id: order.id,
        handler: async (response) => {
          try {
            await verifyPayment({ ...response, billId: bill._id });
            message.success("Payment successful");
            confetti({ particleCount: 150, spread: 70, origin: { y: 0.7 } });
            fetchBills();
          } catch (err) {
            message.error("Verification failed");
          }
        },
        theme: { color: "#6366f1" },
      };
      new window.Razorpay(options).open();
    } catch (err) {
      message.error(err.message || "Payment failed");
    } finally {
      setPayingBillId(null);
    }
  };

  const pendingBills = bills.filter((b) => b.status !== "Paid");
  const totalDue = pendingBills.reduce((sum, b) => sum + (Number(b.remainingAmount) || 0), 0);

  return (
    <ResidentLayout>
      <div style={styles.page}>
        <div style={styles.container}>
          <div style={styles.headerWrap}>
            <div style={styles.headerInner}>
              <div style={styles.titleBlock}>
                <div style={styles.titleRow}>
                  <div style={styles.titleIcon}>
                    <ReceiptText size={24} />
                  </div>
                  <h1 style={styles.title}>Billing Center</h1>
                </div>
                <p style={styles.subtitle}>Track and settle your residency dues</p>
              </div>

              <div style={styles.statCard}>
                <div style={styles.statIcon}>
                  <Wallet size={24} />
                </div>
                <div>
                  <p style={styles.statLabel}>Total Outstanding</p>
                  <div style={styles.statValue}>
                    <CountUp end={totalDue} prefix="Rs " separator="," duration={1.2} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <main style={styles.main}>
            {loading ? (
              <div style={styles.loadingWrap}>
                <Spin size="large" />
                <p style={styles.loadingText}>Loading your financial records...</p>
              </div>
            ) : bills.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                style={styles.emptyCard}
              >
                <div style={styles.emptyIcon}>
                  <CheckCircle size={40} strokeWidth={2.5} />
                </div>
                <h2 style={styles.emptyTitle}>Clear Skies!</h2>
                <p style={styles.emptyText}>
                  All your maintenance bills have been settled. You are completely up to date.
                </p>
              </motion.div>
            ) : (
              <div style={styles.billGrid}>
                <AnimatePresence>
                  {bills.map((bill, index) => (
                    <BillCard
                      key={bill._id}
                      bill={bill}
                      index={index}
                      onPay={handlePayment}
                      isPaying={payingBillId === bill._id}
                      isDark={isDark}
                      styles={styles}
                    />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </main>
        </div>
      </div>
    </ResidentLayout>
  );
}

function BillCard({ bill, index, onPay, isPaying, isDark, styles }) {
  const isPaid = bill.status === "Paid";

  const statusStyle = isPaid
    ? { ...styles.statusBase, background: isDark ? "rgba(16, 185, 129, 0.2)" : "#dcfce7", color: isDark ? "#34d399" : "#047857" }
    : { ...styles.statusBase, background: isDark ? "rgba(249, 115, 22, 0.2)" : "#ffedd5", color: isDark ? "#fb923c" : "#c2410c" };

  const dotStyle = {
    width: 8,
    height: 8,
    borderRadius: "50%",
    background: isPaid ? "#10b981" : "#f97316",
  };

  const payBtnStyle = {
    ...styles.payBtn,
    opacity: isPaying ? 0.75 : 1,
    cursor: isPaying ? "not-allowed" : "pointer",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
      whileHover={{ y: -6 }}
      style={styles.billCard}
    >
      <div style={styles.billTop}>
        <div>
          <span style={styles.billMonth}>{bill.month}</span>
          <h3 style={styles.billTitle}>Maintenance</h3>
        </div>
        <div style={statusStyle}>
          <div style={dotStyle} />
          {isPaid ? "PAID" : "UNPAID"}
        </div>
      </div>

      <div style={styles.amountBlock}>
        <p style={styles.amountLabel}>Amount Due</p>
        <div style={styles.amountRow}>
          <span style={styles.amountSymbol}>Rs</span>
          <span style={styles.amountValue}>{(Number(bill.remainingAmount || bill.amount)).toLocaleString("en-IN")}</span>
        </div>
      </div>

      <div style={styles.infoWrap}>
        <div style={styles.infoRow}>
          <span style={styles.infoLeft}>
            <Home size={16} color="#94a3b8" /> Unit No
          </span>
          <span style={styles.infoRight}>{bill.flatNo}</span>
        </div>
        <div style={styles.infoRow}>
          <span style={styles.infoLeft}>
            <Calendar size={16} color="#94a3b8" /> Due Date
          </span>
          <span style={styles.infoRight}>{new Date(bill.dueDate).toLocaleDateString("en-GB")}</span>
        </div>
      </div>

      <div style={styles.actionWrap}>
        {isPaid ? (
          <div style={styles.paidBox}>
            <CheckCircle size={14} /> Settlement Complete
          </div>
        ) : (
          <button onClick={() => onPay(bill)} disabled={isPaying} style={payBtnStyle}>
            {isPaying ? (
              <Spin size="small" />
            ) : (
              <>
                Pay Now <ArrowUpRight size={16} />
              </>
            )}
          </button>
        )}
      </div>
    </motion.div>
  );
}
