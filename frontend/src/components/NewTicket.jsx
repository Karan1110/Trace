import React, { useState, useEffect, useRef } from "react"
import axios from "axios"
import moment from "moment"
import { toast } from "react-hot-toast"
import { Button, TextField, Select } from "@radix-ui/themes"
import { CaretDownIcon } from "@radix-ui/react-icons"
import MarkdownEditor from "@uiw/react-markdown-editor"
const NewTicket = () => {
  const [users, setUsers] = useState([])
  const [mdStr, setMdStr] = useState(
    `
  # This is a H1
  ## This is a H2
  ###### This is a H6
  ## you can start typing the description!
  ## include html!
  ## include code blocks:
\`onClick={() => setFormData({ ...formData})\`
`
  )
  const [departmentSuggestions, setDepartmentSuggestions] = useState([])

  const [formData, setFormData] = useState({
    name: "",
    user_id: 1,
    deadline: moment().add(2, "days").format("YYYY-MM-DD"),
    status: "open",
    department_id: 1,
  })

  useEffect(() => {
    // Fetch list of users
    const fetchUsers = async () => {
      try {
        const authToken = localStorage.getItem("token")
        const response = await axios.get("http://localhost:1111/users", {
          headers: {
            "x-auth-token": authToken,
          },
        })

        setUsers(response.data)
        async function fetchDepartments() {
          const response = await axios.get("http://localhost:1111/departments")
          setDepartmentSuggestions(response.data)
        }
        fetchDepartments()
      } catch (error) {
        toast.error("Error fetching users: " + error.message)
        console.error("Error fetching users:", error)
      }
    }

    fetchUsers()
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      console.log(formData)
      const videoFile = document.getElementById("video").files[0]
      const formDataWithVideo = new FormData()
      formDataWithVideo.append("name", formData.name)
      formDataWithVideo.append("description", mdStr)
      formDataWithVideo.append("user_id", formData.user_id)
      formDataWithVideo.append("deadline", formData.deadline)
      formDataWithVideo.append("status", formData.status)
      formDataWithVideo.append("department_id", formData.department_id)
      formDataWithVideo.append("video", videoFile) // Append the video file
      const response = await axios.post(
        "http://localhost:1111/tickets",
        formDataWithVideo,
        {
          headers: {
            "x-auth-token": localStorage.getItem("token"),
            "Content-Type": "multipart/form-data", // Important for file upload
          },
        }
      )

      console.log("Ticket created successfully:", response.data)
      toast.success("Ticket created successfully!")
      // Additional actions or redirect can be added here
    } catch (error) {
      toast("Error creating ticket. Please try again.")
      console.error("Error creating ticket:", error)
    }
  }
  const handleUserChange = (v) => {
    setFormData({ ...formData, user_id: v })
  }

  const handleDepartmentChange = (v) => {
    setFormData({ ...formData, department_id: v })
  }

  return (
    <div className="max-w-4xl my-10 mt-[40px] mx-60">
      <h2 className="text-2xl font-bold mb-4">Create New Ticket</h2>
      <form onSubmit={handleSubmit} className="max-w-2xl space-y-4 ">
        <div>
          <TextField.Input
            size="3"
            placeholder="Search the docs…"
            name="name"
            onChange={(e) => handleChange(e)}
          />
        </div>

        <input
          type="file"
          id="video"
          className="block w-full border border-gray-200 shadow-sm rounded-lg text-sm focus:z-10 focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none dark:bg-slate-900 dark:border-gray-700 dark:text-gray-400 dark:focus:outline-none dark:focus:ring-1 dark:focus:ring-gray-600
    file:bg-gray-50 file:border-0
    file:bg-gray-100 file:me-4
    file:py-3 file:px-4
    dark:file:bg-gray-700 dark:file:text-gray-400"
        />
        <div>
          <MarkdownEditor
            value={mdStr}
            onChange={(value) => {
              setMdStr(value)
              console.log(value)
            }}
          />
        </div>

        <div className="pt-5">
          <Button type="submit" variant="solid">
            Create Ticket
          </Button>
        </div>
      </form>
      <div className=" absolute right-60 w-[200px] ml-20 top-[9.5rem] flex flex-col space-y-4">
        <Select.Root
          defaultValue={null}
          size="2"
          onValueChange={(v) => handleUserChange(v)}
        >
          <Select.Trigger>
            <Button variant="outline" color="purple">
              <CaretDownIcon />
            </Button>
          </Select.Trigger>
          <Select.Content color="purple">
            {users.map((user) => (
              <Select.Item key={user.id} value={user.id}>
                {user.name}
              </Select.Item>
            ))}
            <Select.Item value={null}>Not Assigned</Select.Item>
          </Select.Content>
        </Select.Root>
        <Select.Root
          defaultValue={1}
          size="2"
          onValueChange={(v) => handleDepartmentChange(v)}
        >
          <Select.Trigger>
            <Button variant="outline" color="purple">
              <CaretDownIcon />
            </Button>
          </Select.Trigger>
          <Select.Content color="purple">
            {departmentSuggestions.map((d) => (
              <Select.Item value={d.id} key={d.id}>
                {d.name}
              </Select.Item>
            ))}
          </Select.Content>
        </Select.Root>

        <Select.Root
          defaultValue="open"
          size="2"
          onValueChange={(value) => {
            setFormData({ ...formData, status: value })
          }}
        >
          <Select.Trigger>
            <Button variant="outline" color="purple">
              <CaretDownIcon />
            </Button>
          </Select.Trigger>
          <Select.Content color="purple">
            <Select.Item value="open">open</Select.Item>
            <Select.Item value="closed">closed</Select.Item>
            <Select.Item value="in-progress">in-progress</Select.Item>
          </Select.Content>
        </Select.Root>
        <div className="w-full ">
          <div className="relative max-w-sm">
            <div className="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none">
              <svg
                className="w-4 h-4 text-gray-500 dark:text-gray-400"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M20 4a2 2 0 0 0-2-2h-2V1a1 1 0 0 0-2 0v1h-3V1a1 1 0 0 0-2 0v1H6V1a1 1 0 0 0-2 0v1H2a2 2 0 0 0-2 2v2h20V4ZM0 18a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8H0v10Zm5-8h10a1 1 0 0 1 0 2H5a1 1 0 0 1 0-2Z" />
              </svg>
            </div>
            <input
              datepicker
              type="date"
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full ps-10 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              placeholder="Select date"
              onChange={(e) =>
                setFormData({ ...formData, deadline: e.target.value })
              }
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default NewTicket
