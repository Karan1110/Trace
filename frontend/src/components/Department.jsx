import React, { useState } from "react"
import axios from "axios"
import { toast } from "react-hot-toast"
import { TextField, TextFieldInput } from "@radix-ui/themes"

const Department = () => {
  const [name, setName] = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      const response = await axios.post("http://localhost:1111/departments", {
        name: name,
      })

      console.log("Department created:", response.data)
      toast.success("created the department!")
      // Reset the form after successful submission
      setName("")
    } catch (error) {
      toast(error.message)
      console.error("Error creating department:", error)
    }
  }

  return (
    <div className="max-w-md mx-auto mt-[75px]">
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4"
      >
        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="name"
          >
            Department Name
          </label>
          <TextField.Input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="name"
            type="text"
            placeholder="Enter department name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="flex items-center justify-between">
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            type="submit"
          >
            Create Department
          </button>
        </div>
      </form>
    </div>
  )
}

export default Department
