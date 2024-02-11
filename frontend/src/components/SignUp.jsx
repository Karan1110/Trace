import React, { useState, useEffect } from "react"
import axios from "axios"
import { useHotkeys } from "react-hotkeys-hook"
import toast from "react-hot-toast"
import { Button, TextField, DropdownMenu } from "@radix-ui/themes"

const SignUp = () => {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [departmentId, setDepartmentId] = useState("")
  const [departmentSuggestions, setDepartmentSuggestions] = useState([])
  const [department, setDepartment] = useState("none")

  const handleDepartmentSelect = (selectedDepartment) => {
    setDepartmentId(selectedDepartment.id)
    setDepartment(selectedDepartment.name)
  }
  useEffect(() => {
    async function fetchDepartments() {
      const response = await axios.get("http://localhost:1111/departments")
      setDepartmentSuggestions(response.data)
    }
    fetchDepartments()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      if (password != confirmPassword) {
        return toast(
          "the password should be the same as your confirmed password.."
        )
      }
      const response = await axios.post("http://localhost:1111/users", {
        name,
        email,
        password,
        department_id: departmentId,
      })

      toast.success("Sign-up successful!")
      localStorage.setItem("user_id", response.data.User.id)
      localStorage.setItem("token", response.data.token)
      console.log("User created:", response.data)

      // Reset the form after successful submission
      setName("")
      setEmail("")
      setPassword("")
      setConfirmPassword("")
      setDepartmentId("")
    } catch (error) {
      toast.error("Error signing up. Please try again.")
      console.error("Error creating employee:", error)
    }
  }

  return (
    <div className="max-w-xl mx-auto mt-[40px] h-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4"
      >
        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="name"
          >
            Name
          </label>
          <TextField.Input
            size="3"
            placeholder="Whats your name?"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="name"
          >
            Department
          </label>
          <DropdownMenu.Root>
            <DropdownMenu.Trigger>
              <Button variant="soft">{department}</Button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content size="2">
              {departmentSuggestions.map((d) => (
                <DropdownMenu.Item onClick={() => handleDepartmentSelect(d)}>
                  {" "}
                  {d.name}
                </DropdownMenu.Item>
              ))}
              <DropdownMenu.Separator />

              <DropdownMenu.Item>None</DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Root>
        </div>
        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="email"
          >
            Email
          </label>
          <TextField.Input
            size="3"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="email"
            type="email"
            name="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="password"
          >
            Password
          </label>
          <TextField.Input
            size="3"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="password"
            type="password"
            name="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="confirmPassword"
          >
            Confirm Password
          </label>
          <TextField.Input
            size="3"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="confirmPassword"
            type="password"
            name="confirmPassword"
            placeholder="Confirm your password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>

        <div className="cursor-pointer">
          <Button variant="solid" type="submit">
            sign up
          </Button>
        </div>
      </form>
    </div>
  )
}

export default SignUp
