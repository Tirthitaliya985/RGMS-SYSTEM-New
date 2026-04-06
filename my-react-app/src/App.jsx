import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { ConfigProvider, theme as antdTheme } from "antd";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { useTheme } from "./context/ThemeContext";
import Login from "./components/Login/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import { adminRoutes } from "./routes/adminRoutes";
import { societyRoutes } from "./routes/societyRoutes";
import ResidentDashboard from "./pages/User/ResidentDashboard";
import { ResidentRoutes } from "@/routes/ResidentRoutes";
import { wingRoutes } from "@/routes/wingRoutes";
import { guardRoutes } from "@/routes/guardRoutes";
import WingDashboard from "./pages/wingAdmin/wingDashboard";
import Register from "./components/Login/Register";
function AppRoutes() {
  const { user } = useAuth();
  const role = String(user?.role || "").toLowerCase();

  // If logged in, redirect to dashboard based on role
  if (role === "admin" || role === "super admin") return <Navigate to="/admin/dashboard" />;
  if (role === "society" || role === "society admin") return <Navigate to="/society/dashboard" />;
  if (role === "wingadmin" || role === "wing admin") return <Navigate to="/wing/dashboard" />;
  if (role === "resident") return <Navigate to="/resident/dashboard" />;
  if (role === "guard") return <Navigate to="/guard/panel" />;

  // If not logged in, show login page
  return <Login />;
}

function App() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const globalAntTheme = {
    algorithm: isDark ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
    token: {
      colorPrimary: isDark ? "#38bdf8" : "#0284c7",
      colorBgBase: isDark ? "#0b1220" : "#f8fbff",
      colorTextBase: isDark ? "#e2e8f0" : "#111827",
      colorBorder: isDark ? "#334155" : "#d1d5db",
      borderRadius: 12,
      wireframe: false,
    },
    components: {
      Layout: {
        bodyBg: "transparent",
        headerBg: "transparent",
        siderBg: isDark ? "#0f172a" : "#ffffff",
      },
      Card: {
        colorBgContainer: isDark ? "#111827" : "#ffffff",
      },
      Table: {
        headerBg: isDark ? "#1e293b" : "#f8fafc",
        headerColor: isDark ? "#e2e8f0" : "#111827",
        rowHoverBg: isDark ? "#1f2937" : "#edf6ff",
      },
      Input: {
        colorBgContainer: isDark ? "#0f172a" : "#ffffff",
      },
      Select: {
        colorBgContainer: isDark ? "#0f172a" : "#ffffff",
      },
      DatePicker: {
        colorBgContainer: isDark ? "#0f172a" : "#ffffff",
      },
      Modal: {
        contentBg: isDark ? "#111827" : "#ffffff",
        headerBg: isDark ? "#111827" : "#ffffff",
      },
      Drawer: {
        colorBgElevated: isDark ? "#111827" : "#ffffff",
      },
      Dropdown: {
        colorBgElevated: isDark ? "#111827" : "#ffffff",
      },
    },
  };

  return (
    <ConfigProvider theme={globalAntTheme}>
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            success: { duration: 3000 },
            error: { duration: 5000 },
            loading: { duration: Infinity },
          }}
        />

        <Routes>
          <Route path="/" element={<AppRoutes />} />
          <Route path="/register" element={<Register />} />
          <Route path="/test-tailwind" element={<div className="bg-red-500 text-white p-10 m-10 text-4xl font-bold">TAILWIND IS WORKING</div>} />
          
          {/* Admin routes */}
          {adminRoutes.map(({ path, component: Component, protected: isProtected }) => (
            <Route
              key={path}
              path={path}
              element={
                isProtected ? (
                  <ProtectedRoute>
                    <Component />
                  </ProtectedRoute>
                ) : (
                  <Component />
                )
              }
            />
          ))}

          {/* Society admin routes */}
          {societyRoutes.map(({ path, component: Component, protected: isProtected, allowedRoles }) => (
            <Route
              key={path}
              path={path}
              element={
                isProtected ? (
                  <ProtectedRoute allowedRoles={allowedRoles}>
                    <Component />
                  </ProtectedRoute>
                ) : (
                  <Component />
                )
              }
            />
          ))}
          {/* Wing admin routes */}
          {wingRoutes.map(({ path, component: Component, protected: isProtected, allowedRoles }) => (
            <Route
              key={path}
              path={path}
              element={
                isProtected ? (
                  <ProtectedRoute allowedRoles={allowedRoles}>
                    <Component />
                  </ProtectedRoute>
                ) : (
                  <Component />
                )
              }
            />
          ))}
          
          {/* Resident routes */}
          {ResidentRoutes.map(({ path, component: Component, protected: isProtected, allowedRoles }) => (
            <Route
              key={path}
              path={path}
              element={
                isProtected ? (
                  <ProtectedRoute allowedRoles={allowedRoles}>
                    <Component />
                  </ProtectedRoute>
                ) : (
                  <Component />
                )
              }
            />
          ))}

          {/* Guard routes */}
          {guardRoutes.map(({ path, component: Component, protected: isProtected, allowedRoles }) => (
            <Route
              key={path}
              path={path}
              element={
                isProtected ? (
                  <ProtectedRoute allowedRoles={allowedRoles}>
                    <Component />
                  </ProtectedRoute>
                ) : (
                  <Component />
                )
              }
            />
          ))}
        </Routes>
      </AuthProvider>
    </ConfigProvider>
  );
}

export default App;
