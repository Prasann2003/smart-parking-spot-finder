import { Routes, Route } from "react-router-dom"

import Home from "./pages/Home"
import AuthPage from "./pages/AuthPage"
import AdminLogin from "./pages/AdminLogin"
import Dashboard from "./pages/Dashboard"
import BecomeProvider from "./pages/BecomeProvider"
import Payment from "./pages/Payment"
import BookingDetails from "./pages/BookingDetails"
import AddParking from "./pages/AddParking"
import EditParking from "./pages/EditParking"
import ForgotPassword from "./pages/ForgotPassword"
import ProviderDashboard from "./pages/ProviderDashboard"
import ProviderBookings from "./pages/ProviderBookings"
import ProviderApplications from "./pages/ProviderApplications"
import AdminUsers from "./pages/AdminUsers"

import Profile from "./pages/Profile"
import MyBookings from "./pages/MyBookings"
import Notifications from "./pages/Notifications"
import Settings from "./pages/Settings"
import ReviewsPage from "./pages/ReviewsPage"
import SpotDetails from "./pages/SpotDetails"
import SavedSpots from "./pages/SavedSpots"
import SearchResults from "./pages/SearchResults"

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
        <Route path="/provider/dashboard" element={<ProviderDashboard />} />
        <Route path="/provider/bookings" element={<ProviderBookings />} />
        <Route path="/admin/applications" element={<ProviderApplications />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/add-parking" element={<AddParking />} />
        <Route path="/edit-parking/:id" element={<EditParking />} />
        <Route path="/spot/:id/reviews" element={<ReviewsPage />} />
        <Route path="/spot/:id" element={<SpotDetails />} />
        <Route path="/search-results" element={<SearchResults />} />
        <Route path="/saved-spots" element={<SavedSpots />} />
      </Route>

    </Routes>
  )
}
