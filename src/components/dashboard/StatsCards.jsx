export default function StatsCards() {
  const stats = [
    { label: "Available Spots", value: "16", color: "bg-emerald-500" },
    { label: "Active Bookings", value: "2", color: "bg-indigo-500" },
    { label: "Favorites", value: "5", color: "bg-pink-500" },
    { label: "Money Saved", value: "₹320", color: "bg-purple-500" },
  ]

  return (
    <div className="grid md:grid-cols-4 gap-6">
      {stats.map((s) => (
        <div
          key={s.label}
          className={`${s.color} text-white p-6 rounded-2xl shadow-xl`}
        >
          <p className="text-sm opacity-90">{s.label}</p>
          <h3 className="text-3xl font-extrabold mt-2">{s.value}</h3>
        </div>
      ))}
    </div>
  )
}
