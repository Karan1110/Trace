import React, { useState, useEffect } from "react"
import moment from "moment"
import axios from "axios"
import { useParams } from "react-router-dom"
import {
  Heading,
  Text,
  AlertDialog,
  Flex,
  Button,
  Badge,
  Select,
  Popover,
  TextArea,
  Box,
  Avatar,
} from "@radix-ui/themes"
import Spinner from "./Spinner"

import { TrashIcon, CaretDownIcon, Pencil2Icon } from "@radix-ui/react-icons"
import MarkdownEditor from "@uiw/react-markdown-editor"
import { toast } from "react-hot-toast"
import { useUser } from "../contexts/userContext"

const Ticket = () => {
  const [ticket, setTicket] = useState(null)
  const [content, setContent] = useState("")
  const [users, setUsers] = useState([])
  const { id } = useParams()
  const save = async () => {
    try {
      await axios.post(
        `http://localhost:1111/tickets/save/${ticket.id}`,
        {},
        {
          headers: {
            "x-auth-token": localStorage.getItem("token"),
          },
        }
      )
      toast.success("saved!")
    } catch (ex) {
      toast(ex.message)
      console.error(ex)
    }
  }

  const user = useUser()

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        const response = await axios.get(`http://localhost:1111/tickets/${id}`)
        setTicket(response.data)

        console.log(response.data)
      } catch (error) {
        console.error("Error fetching ticket details:", error)
      }
    }

    // Fetch list of users
    const fetchUsers = async () => {
      try {
        const response = await axios.get("http://localhost:1111/users", {
          headers: {
            "x-auth-token": localStorage.getItem("token"),
          },
        })
        setUsers(response.data)
      } catch (error) {
        console.error("Error fetching users:", error)
      }
    }

    fetchTicket()
    fetchUsers()
  }, [])

  const addComment = async () => {
    await axios.post(
      "http://localhost:1111/comments",
      {
        content: content,
        ticket_id: ticket.id,
      },
      {
        headers: {
          "x-auth-token": localStorage.getItem("token"),
        },
      }
    )
    toast.success("comment sent!")
    ticket.Comments.push({
      content: content,
      ticket_id: ticket.id,
      user_id: localStorage.getItem("user_id"),
    })
  }

  async function close() {
    try {
      // Make a PUT request to the API endpoint
      const response = await axios.put(
        `http://localhost:1111/tickets/close/${id}`,
        null,
        {
          headers: {
            "x-auth-token": localStorage.getItem("token"), // Include your authentication token if needed
          },
        }
      )

      // Check the response status and handle accordingly
      if (response.status === 200) {
        toast.success("closed!")
      } else {
        toast.error("something failed...")
      }
    } catch (error) {
      // Handle any errors that occur during the request
      console.error("Error in API call:", error.message, error.response?.data)
    }
  }

  const handleAssign = async (userId) => {
    try {
      await axios.put(
        `http://localhost:1111/tickets/assign/${id}`,
        {
          user_id: userId,
        },
        {
          headers: {
            "x-auth-token": localStorage.getItem("token"),
          },
        }
      )

      toast.success("Ticket assigned successfully!")
    } catch (error) {
      toast("something failed.")
      console.log(error.message, error)
    }
  }

  return (
    <>
      <div className="max-w-4xl  flex flex-row my-10 mt-[40px] mx-[250px] w-[1000px]">
        {ticket && (
          <>
            <div>
              <Heading className="text-2xl mt-[75px] font-bold mb-4">
                {ticket.name} assigned to -{" "}
                {ticket.User.name ? (
                  <HoverCard.Root>
                    <HoverCard.Trigger>
                      <Link href="https://twitter.com/radix_ui" target="_blank">
                        @{ticket.User.name}
                      </Link>
                    </HoverCard.Trigger>
                    <HoverCard.Content>
                      <Flex gap="4">
                        <Avatar
                          size="3"
                          fallback="R"
                          radius="full"
                          src="https://pbs.twimg.com/profile_images/1337055608613253126/r_eiMp2H_400x400.png"
                        />
                        <Box>
                          <Heading size="3" as="h3">
                            {ticket.User.name}
                          </Heading>
                          <Text as="div" size="2" color="gray">
                            @{ticket.User.Department.name}
                          </Text>

                          <Text
                            as="div"
                            size="2"
                            style={{ maxWidth: 300 }}
                            mt="3"
                          >
                            {ticket.User.email}
                          </Text>
                        </Box>
                      </Flex>
                    </HoverCard.Content>
                  </HoverCard.Root>
                ) : (
                  "nobody"
                )}
              </Heading>
              <div className="my-2  space-x-3  ">
                <Badge color={ticket.status == "closed" ? "green" : "red"}>
                  {ticket.status}
                </Badge>
                <Text weight="medium"> Fri Jan 17 2023</Text>
              </div>

              {ticket.videoUrl && (
                <video className="w-[250px] h-[250px] mx-auto" controls>
                  <source src={ticket.videoUrl} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              )}
              <div className="border-2 p-7 w-100 rounded-lg mb-0 mt-5 ">
                <MarkdownEditor.Markdown source={ticket.description} />
              </div>
            </div>
          </>
        )}

        {!ticket && <Spinner />}
        <div className="absolute right-20 w-[200px] ml-20  flex flex-col space-y-5">
          {ticket && (
            <Select.Root
              defaultValue={ticket.user_id}
              onValueChange={(value) => handleAssign(value)}
            >
              <Select.Trigger>
                <Button variant="outline">
                  <CaretDownIcon />
                </Button>
              </Select.Trigger>
              <Select.Content color="purple">
                {users.map((user) => (
                  <Select.Item value={user.id} key={user.id}>
                    {user.name}
                  </Select.Item>
                ))}
                <Select.Item value={null}>Not Assigned</Select.Item>
              </Select.Content>
            </Select.Root>
          )}
          <Button variant="solid" color="purple" onClick={() => close()}>
            Close <Pencil2Icon />
          </Button>
          <Button variant="solid" color="purple">
            Edit <Pencil2Icon />
          </Button>
          {ticket && (
            <Button variant="solid" color="violet" onClick={() => save()}>
              {user.mySavedTickets.some((t) => t.savedTicket.id == ticket.id)
                ? "unsave"
                : "save"}
              <svg
                width="15"
                height="15"
                viewBox="0 0 15 15"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M3.5 2C3.22386 2 3 2.22386 3 2.5V13.5C3 13.6818 3.09864 13.8492 3.25762 13.9373C3.41659 14.0254 3.61087 14.0203 3.765 13.924L7.5 11.5896L11.235 13.924C11.3891 14.0203 11.5834 14.0254 11.7424 13.9373C11.9014 13.8492 12 13.6818 12 13.5V2.5C12 2.22386 11.7761 2 11.5 2H3.5Z"
                  fill="currentColor"
                  fill-rule="evenodd"
                  clip-rule="evenodd"
                ></path>
              </svg>
            </Button>
          )}
          <AlertDialog.Root>
            <AlertDialog.Trigger>
              <Button variant="solid" color="red">
                Delete <TrashIcon />
              </Button>
            </AlertDialog.Trigger>
            <AlertDialog.Content style={{ width: 450 }}>
              <AlertDialog.Title>Delete the ticket</AlertDialog.Title>
              <AlertDialog.Description size="2">
                This action is not reversable, kindly think twice
              </AlertDialog.Description>

              <Flex gap="3" mt="4" justify="end">
                <AlertDialog.Cancel>
                  <Button variant="soft" color="gray">
                    Cancel
                  </Button>
                </AlertDialog.Cancel>
                <AlertDialog.Action>
                  <Button variant="solid" color="red">
                    Delete
                  </Button>
                </AlertDialog.Action>
              </Flex>
            </AlertDialog.Content>
          </AlertDialog.Root>
          {ticket && ticket.Before && (
            <Text>
              Should be completed after this
              <HoverCard.Root>
                <HoverCard.Trigger>
                  <Link href="https://twitter.com/radix_ui" target="_blank">
                    @ticket
                  </Link>
                </HoverCard.Trigger>
                <HoverCard.Content>
                  <Flex gap="4">
                    <Avatar
                      size="3"
                      fallback="R"
                      radius="full"
                      src="https://pbs.twimg.com/profile_images/1337055608613253126/r_eiMp2H_400x400.png"
                    />
                    <Box>
                      <Heading size="3" as="h3">
                        {ticket.Before.id}
                      </Heading>
                      <Text as="div" size="2" color="gray">
                        @{ticket.Before.User.name || "not-assigned"}
                      </Text>

                      <Text as="div" size="2" style={{ maxWidth: 300 }} mt="3">
                        {ticket.Before.description}
                      </Text>
                    </Box>
                  </Flex>
                </HoverCard.Content>
              </HoverCard.Root>{" "}
              for updates.
            </Text>
          )}
        </div>
      </div>
      <div className="max-w-xl  flex flex-col my-10 mt-[40px] mx-[250px] ">
        <Heading my="3" className="ml-10">
          {" "}
          Comments
        </Heading>
        <Flex direction="column">
          {ticket &&
            ticket.Comments.map((comment) => {
              const timeAgo = moment(comment.createdAt).fromNow()
              return (
                <div className="max-w-xl p-3  flex items-center border-b   my-2 rounded-md">
                  <Avatar fallback="A" size="2" m="2" />
                  <Text as="p" size="3" mx="3">
                    {comment.content || "empty comment"}
                  </Text>
                  <Badge mx="5" className="absolute right-[700px]">
                    {timeAgo}
                  </Badge>
                </div>
              )
            })}
          {!ticket && <Spinner />}
          <Popover.Root>
            <Popover.Trigger>
              <Button variant="soft">Comment</Button>
            </Popover.Trigger>
            <Popover.Content style={{ width: 360 }}>
              <Flex gap="3">
                <Avatar size="2" fallback="A" />
                <Box grow="1">
                  <TextArea
                    placeholder="Write a comment…"
                    style={{ height: 80 }}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                  />
                  <Popover.Close>
                    <Button size="1" mt="3" onClick={() => addComment()}>
                      Comment
                    </Button>
                  </Popover.Close>
                </Box>
              </Flex>
            </Popover.Content>
          </Popover.Root>
        </Flex>
      </div>
    </>
  )
}

export default Ticket
