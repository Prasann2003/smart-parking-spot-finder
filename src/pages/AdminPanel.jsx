import { useEffect, useState } from "react"
import api from "../utils/api"
import Navbar from "../components/Navbar"

export default function AdminPanel() {
  const [applications, setApplications] = useState([])

  useEffect(() => {
    api.get("/admin/providers")
      .then(res => setApplications(res.data))
  }, [])

  const handleAction = (id, action) => {
    api.post(`/admin/provider/${id}/${action}`)
      .then(() => {
        setApplications(prev =>
          prev.map(app =>
            app.id === id ? { ...app, status: action } : app
          )
        )
      })
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="pt-28 px-10">
        <h2 className="text-3xl font-bold mb-8">
          Provider Applications
        </h2>

        {applications.map(app => (
          <div key={app.id} className="bg-white p-6 rounded-xl shadow mb-4">
            <h3 className="font-semibold">{app.ownerName}</h3>
            <p>Status: {app.status}</p>

            {app.status === "Pending" && (
              <div className="mt-4 flex gap-4">
                <button
                  onClick={() => handleAction(app.id, "Approved")}
                  className="px-4 py-2 bg-green-600 text-white rounded"
                >
                  Approve
                </button>

                <button
                  onClick={() => handleAction(app.id, "Rejected")}
                  className="px-4 py-2 bg-red-600 text-white rounded"
                >
                  Reject
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
