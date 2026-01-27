import { motion } from "framer-motion"
import Navbar from "../components/Navbar"
import { useState } from "react"
import indiaData from "../utils/indiaData"

export default function Dashboard() {
  const [search, setSearch] = useState({
    state: "",
    district: "",
    area: "",
  })

  const [showResults, setShowResults] = useState(false)

  // 🗺️ MAP QUERY STRING (STEP 1)
  const mapQuery =
    search.state && search.district
      ? `${search.district}, ${search.state}, India`
      : "India"

  const parkingSpots = [
    {
      name: "City Mall Parking",
      distance: "1.2 km",
      price: 30,
      slots: 12,
      rating: 4.5,
      cctv: true,
      guarded: true,
    },
    {
      name: "Railway Station Parking",
      distance: "2.5 km",
      price: 20,
      slots: 0,
      rating: 3.8,
      cctv: true,
      guarded: false,
    },
    {
      name: "Airport Zone Parking",
      distance: "5 km",
      price: 50,
      slots: 4,
      rating: 4.8,
      cctv: true,
      guarded: true,
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100">
      <Navbar />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto pt-28 px-6 space-y-14"
      >
        {/* HERO */}
        <div>
          <h1 className="text-4xl font-extrabold text-gray-800">
            Smart Parking Dashboard
          </h1>
          <p className="text-gray-600 mt-2">
            Find, book, and manage parking spots in real-time
          </p>
        </div>

        {/* STATS */}
        <div className="grid md:grid-cols-4 gap-6">
          {[
            { label: "Available Spots", value: "16", color: "bg-emerald-500" },
            { label: "Active Bookings", value: "2", color: "bg-indigo-500" },
            { label: "Favorites", value: "5", color: "bg-pink-500" },
            { label: "Money Saved", value: "₹320", color: "bg-purple-500" },
          ].map((s) => (
            <div
              key={s.label}
              className={`${s.color} text-white p-6 rounded-2xl shadow-xl`}
            >
              <p className="text-sm opacity-90">{s.label}</p>
              <h3 className="text-3xl font-extrabold mt-2">{s.value}</h3>
            </div>
          ))}
        </div>

        {/* FIND PARKING */}
        <div className="bg-white rounded-3xl shadow-2xl p-8">
          <h2 className="text-2xl font-bold mb-6">
            🔍 Find Parking Spot
          </h2>

          {/* STATE / DISTRICT / AREA */}
          <div className="grid md:grid-cols-3 gap-6">
            {/* STATE */}
            <select
              className="w-full px-4 py-3 border rounded-lg bg-white"
              value={search.state}
              onChange={(e) =>
                setSearch({
                  ...search,
                  state: e.target.value,
                  district: "",
                })
              }
            >
              <option value="">Select State</option>
              {Object.keys(indiaData).map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </select>

            {/* DISTRICT */}
            <select
              className="w-full px-4 py-3 border rounded-lg bg-white"
              value={search.district}
              disabled={!search.state}
              onChange={(e) =>
                setSearch({ ...search, district: e.target.value })
              }
            >
              <option value="">Select District</option>
              {(indiaData[search.state] || []).map((district) => (
                <option key={district} value={district}>
                  {district}
                </option>
              ))}
            </select>

            {/* AREA */}
            <input
              placeholder="Area / Landmark (optional)"
              className="w-full px-4 py-3 border rounded-lg"
              onChange={(e) =>
                setSearch({ ...search, area: e.target.value })
              }
            />
          </div>

          {/* FIND BUTTON */}
          <div className="mt-6 flex justify-center">
            <button
              onClick={() => setShowResults(true)}
              disabled={!search.state || !search.district}
              className={`px-10 py-3 rounded-xl font-semibold transition
                ${
                  !search.state || !search.district
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-indigo-600 text-white hover:bg-indigo-700"
                }`}
            >
              🔍 Find Parking
            </button>
          </div>

          {/* RESULTS + MAP (STEP 3) */}
          {showResults && (
            <div className="mt-10 grid md:grid-cols-2 gap-8">
              {/* PARKING CARDS */}
              {parkingSpots.map((p, i) => (
                <motion.div
                  key={i}
                  whileHover={{ scale: 1.03 }}
                  className="bg-gray-50 p-6 rounded-2xl shadow"
                >
                  <h3 className="text-xl font-bold">{p.name}</h3>
                  <p className="text-gray-600">{p.distance}</p>

                  <p className="mt-2">
                    {p.slots === 0
                      ? "🔴 Full"
                      : p.slots < 5
                      ? "🟡 Limited"
                      : "🟢 Available"}{" "}
                    ({p.slots} slots)
                  </p>

                  <p className="mt-1">₹{p.price}/hour</p>

                  <p className="text-sm mt-2 text-gray-500">
                    CCTV: {p.cctv ? "Yes" : "No"} | Guarded:{" "}
                    {p.guarded ? "Yes" : "No"} | ⭐ {p.rating}
                  </p>

                  <div className="flex gap-3 mt-4">
                    <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg">
                      Book Now
                    </button>
                    <button className="px-4 py-2 border rounded-lg">
                      ⭐ Save
                    </button>
                  </div>
                </motion.div>
              ))}

              {/* 🗺️ REAL MAP (STEP 2) */}
              <div className="rounded-2xl overflow-hidden shadow-lg">
                <iframe
                  title="Parking Map"
                  width="100%"
                  height="100%"
                  className="min-h-[350px] border-0"
                  loading="lazy"
                  allowFullScreen
                  referrerPolicy="no-referrer-when-downgrade"
                  src={`https://www.google.com/maps?q=${encodeURIComponent(
                    mapQuery
                  )}&output=embed`}
                ></iframe>
              </div>
            </div>
          )}
        </div>

        {/* RECENT ACTIVITY */}
        <div className="bg-white rounded-3xl shadow-xl p-8">
          <h2 className="text-2xl font-bold mb-4">
            🕒 Recent Activity
          </h2>
          <ul className="list-disc ml-6 text-gray-700">
            <li>Booked City Mall Parking</li>
            <li>Searched Airport Zone</li>
            <li>Saved Railway Station Parking</li>
          </ul>
        </div>
      </motion.div>
    </div>
  )
}
