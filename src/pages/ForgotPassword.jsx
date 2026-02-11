import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import toast from "react-hot-toast"
import { forgotPassword, verifyOtp, resetPassword } from "../utils/auth"

export default function ForgotPassword() {
    const navigate = useNavigate()
    const [step, setStep] = useState(1)
    const [loading, setLoading] = useState(false)

    const [email, setEmail] = useState("")
    const [otp, setOtp] = useState("")
    const [passwords, setPasswords] = useState({
        newPassword: "",
        confirmPassword: "",
    })

    // STEP 1: SEND OTP
    const handleSendOtp = async (e) => {
        e.preventDefault()
        setLoading(true)
        const success = await forgotPassword(email)
        setLoading(false)
        if (success) setStep(2)
    }

    // STEP 2: VERIFY OTP
    const handleVerifyOtp = async (e) => {
        e.preventDefault()
        setLoading(true)
        const success = await verifyOtp(email, otp)
        setLoading(false)
        if (success) setStep(3)
    }

    // STEP 3: RESET PASSWORD
    const handleResetPassword = async (e) => {
        e.preventDefault()
        if (passwords.newPassword !== passwords.confirmPassword) {
            toast.error("Passwords do not match ❌")
            return
        }

        setLoading(true)
        const success = await resetPassword(email, otp, passwords.newPassword)
        setLoading(false)

        if (success) {
            setTimeout(() => navigate("/auth"), 1000)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden p-8">

                <div className="text-center mb-8">
                    <h2 className="text-3xl font-extrabold text-gray-900">
                        {step === 1 && "Forgot Password?"}
                        {step === 2 && "Verify OTP"}
                        {step === 3 && "Reset Password"}
                    </h2>
                    <p className="text-gray-500 mt-2">
                        {step === 1 && "Enter your email to receive a verification code."}
                        {step === 2 && `Enter the OTP sent to ${email}`}
                        {step === 3 && "Create a new strong password."}
                    </p>
                </div>

                <AnimatePresence mode="wait">

                    {/* STEP 1: EMAIL */}
                    {step === 1 && (
                        <motion.form
                            key="step1"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            onSubmit={handleSendOtp}
                        >
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                                <input
                                    type="email"
                                    required
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none transition"
                                    placeholder="name@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-lg transition disabled:opacity-50"
                            >
                                {loading ? "Sending..." : "Send OTP"}
                            </button>
                        </motion.form>
                    )}

                    {/* STEP 2: OTP */}
                    {step === 2 && (
                        <motion.form
                            key="step2"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            onSubmit={handleVerifyOtp}
                        >
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">One-Time Password</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none transition text-center text-lg tracking-widest"
                                    placeholder="123456"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-lg transition disabled:opacity-50"
                            >
                                {loading ? "Verifying..." : "Verify & UIContinue"}
                            </button>
                            <button
                                type="button"
                                onClick={() => setStep(1)}
                                className="w-full mt-4 text-gray-500 hover:text-gray-700 text-sm font-medium"
                            >
                                Use a different email
                            </button>
                        </motion.form>
                    )}

                    {/* STEP 3: RESET PASSWORD */}
                    {step === 3 && (
                        <motion.form
                            key="step3"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            onSubmit={handleResetPassword}
                        >
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                                <input
                                    type="password"
                                    required
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none transition"
                                    placeholder="••••••••"
                                    value={passwords.newPassword}
                                    onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                                />
                            </div>
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
                                <input
                                    type="password"
                                    required
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none transition"
                                    placeholder="••••••••"
                                    value={passwords.confirmPassword}
                                    onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition disabled:opacity-50"
                            >
                                {loading ? "Resetting..." : "Reset Password"}
                            </button>
                        </motion.form>
                    )}

                </AnimatePresence>

                {step === 1 && (
                    <div className="mt-6 text-center">
                        <button
                            onClick={() => navigate("/auth")}
                            className="text-indigo-600 hover:text-indigo-800 font-medium text-sm transition"
                        >
                            Back to Login
                        </button>
                    </div>
                )}

            </div>
        </div>
    )
}
