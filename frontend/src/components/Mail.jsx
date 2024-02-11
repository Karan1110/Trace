import React, { useState } from "react"
import axios from "axios"
import toast from "react-hot-toast"

const EmailVerificationForm = () => {
  const [email, setEmail] = useState("")
  const [mailCode, setMailCode] = useState(null)

  const handleSendVerificationCode = async () => {
    try {
      const response = await axios.post("http://localhost:1111/verify-email", {
        to: email,
      })
      setMailCode(response.data.mail_code)
      console.log(response.data.mail_code)
      localStorage.setItem("code", mailCode)
      toast.success("code has been sent!")
    } catch (error) {
      toast("error sending the code...")
      console.error("Error sending verification code:", error)
    }
  }

  return (
    <div className="max-w-md mx-auto m-[75px] p-6 bg-white rounded shadow-xl">
      <h2 className="text-2xl font-bold mb-4">Email Verification</h2>

      <div className="mb-4">
        <label
          htmlFor="email"
          className="block text-gray-700 text-sm font-bold mb-2"
        >
          Email
        </label>
        <input
          type="email"
          id="email"
          className="w-full px-3 py-2 border rounded"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <button
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700"
        onClick={handleSendVerificationCode}
      >
        Send Verification Code
      </button>

      {mailCode && (
        <div className="mt-4">
          <p className="text-green-600">
            Verification code sent successfully! Your code: {mailCode}
          </p>
        </div>
      )}
    </div>
  )
}

export default EmailVerificationForm
