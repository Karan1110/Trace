import React, { useState, useEffect, useRef } from "react"
import axios from "axios"
import moment from "moment"
import { toast } from "react-hot-toast"
// import JoditEditor from "jodit-react"
import { useParams } from "react-router-dom"

const EditTicket = () => {
  const editor = useRef(null)
  const { id } = useParams()
  const [users, setUsers] = useState([])
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    deadline: moment().add(2, "days").format("YYYY-MM-DD"),
    status: "open",
  })

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const authToken = localStorage.getItem("token")
        const response = await axios.get("http://localhost:1111/users", {
          headers: {
            "x-auth-token": authToken,
          },
        })

        setUsers(response.data)
      } catch (error) {
        toast.error("Error fetching users: " + error.message)
        console.error("Error fetching users:", error)
      }
    }

    const fetchTicketDetails = async () => {
      try {
        const authToken = localStorage.getItem("token")
        const response = await axios.get(
          `http://localhost:1111/tickets/${id}`,
          {
            headers: {
              "x-auth-token": authToken,
            },
          }
        )

        // Pre-fill the form data with existing ticket details
        setFormData({
          name: response.data.name,
          description: response.data.body,
          deadline: moment(response.data.deadline).format("YYYY-MM-DD"),
          status: response.data.status,
        })
      } catch (error) {
        toast.error("Error fetching ticket details: " + error.message)
        console.error("Error fetching ticket details:", error)
      }
    }

    fetchUsers()
    fetchTicketDetails()
  }, [id])

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
      // Assuming your API endpoint for updating a ticket is /tickets/:id
      const response = await axios.put(
        `http://localhost:1111/tickets/${id}`,
        {
          ...formData,
        },
        {
          headers: {
            "x-auth-token": localStorage.getItem("token"),
          },
        }
      )

      console.log("Ticket updated successfully:", response.data)
      toast.success("Ticket updated successfully!")
      // Additional actions or redirect can be added here
    } catch (error) {
      toast.error("Error updating ticket. Please try again.")
      console.error("Error updating ticket:", error)
    }
  }

  return (
    <div className="max-w-2xl mt-[75px] mx-auto">
      <h2 className="text-2xl font-bold mb-4">Edit Ticket</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Name
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="mt-1 p-2 border rounded-md w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Body
          </label>
          {/* <JoditEditor
            ref={editor}
            value={formData.body}
            tabIndex={1}
            onBlur={(newContent) => {
              setFormData({ ...formData, body: newContent })
            }}
            onChange={(newContent) => {}}
          /> */}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Status
          </label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="mt-1 p-2 border rounded-md w-full"
          >
            <option value="open">Open</option>
            <option value="in-progress">In-Progress</option>
            <option value="closed">Closed</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Deadline
          </label>
          <input
            type="date"
            name="deadline"
            value={formData.deadline}
            onChange={handleChange}
            className="mt-1 p-2 border rounded-md w-full"
          />
        </div>

        <button
          type="submit"
          className="bg-blue-500 mb-5 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Update Ticket
        </button>
      </form>
    </div>
  )
}

export default EditTicket
