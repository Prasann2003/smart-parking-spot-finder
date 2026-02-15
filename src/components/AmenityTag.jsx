import React from 'react'

export default function AmenityTag({ active, label, icon }) {
    if (!active) return null
    return (
        <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-100 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium">
            <span className="text-indigo-500">{icon}</span> {label}
        </div>
    )
}
