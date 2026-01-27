export default function RecentActivity() {
  const activity = [
    "Booked City Mall Parking",
    "Searched Airport Zone",
    "Saved Railway Station Parking",
  ]

  return (
    <div className="bg-white rounded-3xl shadow-xl p-8">
      <h2 className="text-2xl font-bold mb-4">
        🕒 Recent Activity
      </h2>

      <ul className="list-disc ml-6 text-gray-700">
        {activity.map((a, i) => (
          <li key={i}>{a}</li>
        ))}
      </ul>
    </div>
  )
}
