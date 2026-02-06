import { Routes, Route } from "react-router-dom"

import Home from "./pages/Home"
import AuthPage from "./pages/AuthPage"
import Dashboard from "./pages/Dashboard"
import BecomeProvider from "./pages/BecomeProvider"
import Payment from "./pages/Payment"

import Profile from "./pages/Profile"
import MyBookings from "./pages/MyBookings"
import Notifications from "./pages/Notifications"
import Settings from "./pages/Settings"

import ProtectedRoute from "./components/ProtectedRoute"

export default function App() {
  return (
    <Routes>

      {/* =========================
           🌍 PUBLIC ROUTES
      ========================= */}
      <Route path="/" element={<Home />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/become-provider" element={<BecomeProvider />} />

      {/* =========================
           🔐 PROTECTED ROUTES
      ========================= */}

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/payment"
        element={
          <ProtectedRoute>
            <Payment />
          </ProtectedRoute>
        }
      />

      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />

      <Route
        path="/bookings"
        element={
          <ProtectedRoute>
            <MyBookings />
          </ProtectedRoute>
        }
      />

      <Route
        path="/notifications"
        element={
          <ProtectedRoute>
            <Notifications />
          </ProtectedRoute>
        }
      />

      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        }
      />

    </Routes>
  )
}
