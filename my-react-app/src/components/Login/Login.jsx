import { useState, useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./LampLogin.css";
import lampSoundFile from "../../assets/toggle.mp3";
import api from "../../api/api";

export default function Login() {
  const { signIn } = useAuth();
  const [lightOn, setLightOn] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [authView, setAuthView] = useState("login");
  const [resetEmail, setResetEmail] = useState("");
  const [resetOtp, setResetOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const navigate = useNavigate();
  const lampSound = new Audio(lampSoundFile);

  useEffect(() => {
    const prefersLight = window.matchMedia("(prefers-color-scheme: light)").matches;
    setLightOn(prefersLight);
  }, []);

  const handleLampClick = () => {
    setLightOn(!lightOn);
    lampSound.play();
  };

  const resetForgotPasswordState = () => {
    setResetEmail("");
    setResetOtp("");
    setNewPassword("");
    setConfirmPassword("");
    setOtpSent(false);
    setOtpVerified(false);
  };

  const handleLogin = async () => {
    if (!username || !password) {
      toast.error("Enter credentials");
      return;
    }

    try {
      const res = await api.post("/auth/login", {
        usernameOrEmail: username,
        password,
      });

      const { user, token } = res.data;
      signIn(user, token);
      toast.success("Login successful");

      if (user.role === "admin") {
        navigate("/admin/dashboard");
      } else if (user.role === "society") {
        navigate("/society/dashboard");
      } else if (user.role === "resident") {
        navigate("/resident/dashboard");
      } else if (user.role === "wingadmin") {
        navigate("/wing/dashboard");
      } else if (user.role === "guard") {
        navigate("/guard/panel");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
    }
  };

  const handleRequestOtp = async () => {
    if (!resetEmail) {
      toast.error("Enter your email");
      return;
    }

    try {
      const res = await api.post("/auth/forgot-password/request-otp", {
        email: resetEmail,
      });
      setOtpSent(true);
      setOtpVerified(false);
      toast.success(res.data?.message || "OTP sent to email");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send OTP");
    }
  };

  const handleVerifyOtp = async () => {
    if (!resetEmail || !resetOtp) {
      toast.error("Enter email and OTP");
      return;
    }

    try {
      const res = await api.post("/auth/forgot-password/verify-otp", {
        email: resetEmail,
        otp: resetOtp,
      });
      setOtpVerified(true);
      toast.success(res.data?.message || "OTP verified");
    } catch (err) {
      setOtpVerified(false);
      toast.error(err.response?.data?.message || "OTP verification failed");
    }
  };

  const handleResetPassword = async () => {
    if (!otpVerified) {
      toast.error("Verify OTP first");
      return;
    }

    if (!newPassword || !confirmPassword) {
      toast.error("Enter new password");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      const res = await api.post("/auth/forgot-password/reset", {
        email: resetEmail,
        otp: resetOtp,
        newPassword,
      });
      toast.success(res.data?.message || "Password reset successful");
      setAuthView("login");
      resetForgotPasswordState();
    } catch (err) {
      toast.error(err.response?.data?.message || "Password reset failed");
    }
  };

  const switchToForgotPassword = () => {
    setAuthView("forgot");
    resetForgotPasswordState();
  };

  const switchToLogin = () => {
    setAuthView("login");
    resetForgotPasswordState();
  };

  return (
    <div className={`page ${lightOn ? "light" : ""}`}>
      <Toaster position="top-right" reverseOrder={false} />
      <div className="ambient-grid" />
      <div className="ambient-orb orb-a" />
      <div className="ambient-orb orb-b" />

      <div className={`lamp ${lightOn ? "on" : ""}`} onClick={handleLampClick}>
        <div className="wire"></div>
        <div className="lamp-core" />
        <div className="lamp-halo" />
        {lightOn && (
          <motion.div
            className="light-cone"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          />
        )}
      </div>

      <AnimatePresence>
        {lightOn && (
          <motion.div
            className="login-box"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ duration: 0.6 }}
          >
            {authView === "login" ? (
              <>
                <p className="eyebrow">RGMS Access</p>
                <h2>Welcome Back</h2>
                <p className="subtext">
                  Turn on the lamp and sign in to manage your society operations.
                </p>
                <div className="field-wrap">
                  <label>Username / Email / Phone</label>
                  <input
                    type="text"
                    placeholder="you@example.com"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
                <div className="field-wrap">
                  <label>Password</label>
                  <input
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <button className="primary-btn" onClick={handleLogin}>Login</button>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", marginTop: "1rem" }}>
                  <button
                    type="button"
                    className="text-link"
                    onClick={switchToForgotPassword}
                  >
                    Forgot Password?
                  </button>
                  <button
                    type="button"
                    className="text-link"
                    style={{ color: "var(--lamp-accent)", fontWeight: "bold" }}
                    onClick={() => window.open("http://localhost:5173", "_blank")}
                  >
                    Free Demo (Visitor)
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className="eyebrow">Recovery</p>
                <h2>Reset Password</h2>
                <p className="subtext">
                  Verify OTP from your registered email and set a new password.
                </p>
                <div className="field-wrap">
                  <label>Registered Email</label>
                  <input
                    type="email"
                    placeholder="name@domain.com"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                  />
                </div>
                <button className="primary-btn" onClick={handleRequestOtp}>
                  {otpSent ? "Resend OTP" : "Send OTP"}
                </button>

                {otpSent && (
                  <>
                    <div className="field-wrap">
                      <label>OTP</label>
                      <input
                        type="text"
                        placeholder="Enter OTP"
                        value={resetOtp}
                        onChange={(e) => setResetOtp(e.target.value)}
                      />
                    </div>
                    <button className="primary-btn" onClick={handleVerifyOtp}>
                      {otpVerified ? "OTP Verified" : "Verify OTP"}
                    </button>
                  </>
                )}

                {otpVerified && (
                  <>
                    <div className="field-wrap">
                      <label>New Password</label>
                      <input
                        type="password"
                        placeholder="New password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                      />
                    </div>
                    <div className="field-wrap">
                      <label>Confirm New Password</label>
                      <input
                        type="password"
                        placeholder="Confirm new password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                      />
                    </div>
                    <button className="primary-btn" onClick={handleResetPassword}>Reset Password</button>
                  </>
                )}

                <button type="button" className="text-link" onClick={switchToLogin}>
                  Back to Login
                </button>
              </>
            )}
            <p className="lamp-tip">Tip: click the lamp to toggle mood lighting.</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
