import React, { useState, useEffect } from "react"
import axios from "axios"
import { toast } from "react-hot-toast"
import { useNavigate } from "react-router-dom"
import { Badge, Button } from "@radix-ui/themes"
import { ArrowRightIcon } from "@radix-ui/react-icons"
import Spinner from "./Spinner"

const Meetings = () => {
  const history = useNavigate()
  const [meetings, setMeetings] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  const addMeetingToSchedule = async (meetingId) => {
    try {
      const response = await axios.post(
        "http://localhost:1111/meetings",
        {
          meeting_id: meetingId,
        },
        {
          headers: {
            "x-auth-token": localStorage.getItem("token"),
          },
        }
      )

      console.log("Meeting added to schedule successfully:", response.data)
      toast.success("done!")
      // Additional actions or logging can be added here
      return response.data // You can return the meeting data if needed
    } catch (error) {
      toast(error.message)
      console.error("Error adding meeting to schedule:", error)
      throw new Error("Failed to add meeting to schedule")
    }
  }

  useEffect(() => {
    const fetchMeetings = async () => {
      try {
        const response = await axios.get("http://localhost:1111/meetings", {
          headers: {
            "x-auth-token": localStorage.getItem("token"), // Include your authentication token if required
          },
        })

        setMeetings(response.data)
        setTimeout(() => {
          setIsLoading(false)
        }, 2000)
      } catch (error) {
        console.error("Error fetching meetings:", error.message, error)
      }
    }

    fetchMeetings()
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center text-center">
        <Spinner />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto mt-5">
      <h2 className="text-2xl font-bold mb-4">Meetings</h2>
      <Button
        className="absolute top-20 right-10"
        colorScheme="purple"
        onClick={() => {
          history("/meetings/new")
        }}
      >
        <span className="text-xl">+</span>
        New
      </Button>
      <div className="flex items-center justify-center space-x-5 space-y-5">
        {meetings.map((meeting) => (
          <div className=" max-w-md  p-6 bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700">
            <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              {meeting.name}
            </h5>
            <p className="mb-3 text-sm max-w-sm  text-gray-700 dark:text-gray-400">
              {meeting.description ||
                "Here are the biggest enterprise technology acquisitions of 2021 so far, in reverse chronological order."}
            </p>
            <p className="mb-3 space-x-3">
              <Badge colorScheme="red">{meeting.duration}</Badge>
              <Badge colorScheme="red">
                {meeting.Department?.name || "General"}
              </Badge>
            </p>
            <div className="space-x-3">
              <Button
                onClick={async () => await addMeetingToSchedule(meeting.id)}
              >
                Add
                <ArrowRightIcon />
              </Button>
              <Button href={meeting.link}>Join</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Meetings
