import { Navigate, Outlet } from "react-router-dom"
import { isLoggedIn } from "../utils/auth"

export default function ProtectedRoute() {
  if (!isLoggedIn()) {
    return <Navigate to="/auth" replace />
  }

  return <Outlet />
}
