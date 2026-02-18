import { useState } from "react"
import { motion } from "framer-motion"
import { FaTimes, FaBan } from "react-icons/fa"
import toast from "react-hot-toast"

export default function RejectionModal({ isOpen, onClose, onSubmit }) {
    const [reason, setReason] = useState("")

    const handleSubmit = (e) => {
        e.preventDefault()
        if (!reason.trim()) return toast.error("Please enter a reason")
        onSubmit(reason)
        onClose()
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[9999]">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl relative"
            >
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
                >
                    <FaTimes />
                </button>

                <div className="mb-6 flex items-center gap-3">
                    <div className="p-3 bg-red-100 text-red-600 rounded-full text-xl">
                        <FaBan />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800">Reject Application</h2>
                </div>

                <p className="text-gray-600 mb-6">
                    Please provide a reason for rejecting this application. This will be sent to the provider.
                </p>

                <form onSubmit={handleSubmit}>
                    <textarea
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        className="w-full border border-gray-300 rounded-xl p-4 h-32 mb-6 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none resize-none transition-shadow"
                        placeholder="e.g., Incomplete address details..."
                        autoFocus
                    />

                    <div className="flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-2.5 text-gray-700 hover:bg-gray-100 rounded-xl font-medium transition"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 font-medium shadow-lg shadow-red-200 transition"
                        >
                            Reject Application
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    )
}
