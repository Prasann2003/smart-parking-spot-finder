import { Routes, Route } from "react-router-dom"

import Home from "./pages/Home"
import AuthPage from "./pages/AuthPage"
import AdminLogin from "./pages/AdminLogin"
import Dashboard from "./pages/Dashboard"
import BecomeProvider from "./pages/BecomeProvider"
import Payment from "./pages/Payment"
import BookingDetails from "./pages/BookingDetails"
import AddParking from "./pages/AddParking"
import ForgotPassword from "./pages/ForgotPassword"

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
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/become-provider" element={<BecomeProvider />} />
      <Route path="/admin-login" element={<AdminLogin />} />

      {/* =========================
           🔐 PROTECTED ROUTES
      ========================= */}

      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/payment" element={<Payment />} />
        <Route path="/booking/:id" element={<BookingDetails />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/bookings" element={<MyBookings />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/add-parking" element={<AddParking />} />
      </Route>

    </Routes>
  )
}
