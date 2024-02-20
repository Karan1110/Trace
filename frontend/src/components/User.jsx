import React, { useState, useEffect } from "react"
import toast from "react-hot-toast"
import axios from "axios"
import {
  Tabs,
  Box,
  Text,
  Avatar,
  Flex,
  Card,
  Table,
  Badge,
  Heading,
  Button,
} from "@radix-ui/themes"
import { Link, useParams } from "react-router-dom"
import { useUser } from "../contexts/userContext"
import { Pie } from "react-chartjs-2"

const User = () => {
  const [user, setUser] = useState(null)
  const [colleagues, setColleagues] = useState(null)
  const { id } = useParams()
  const [followers, setFollowers] = useState([])
  const [following, setFollowing] = useState([])
  const currentUser = useUser()
  const [stats, setStats] = useState({})

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get(`http://localhost:1111/users/${id}`, {
          headers: { "x-auth-token": localStorage.getItem("token") },
        })
        console.log(response.data)
        setUser(response.data.user)

        setFollowers(response.data.followedBy)
        setFollowing(response.data.following)
        const closed = response.data.Ticket.filter((t) => t.status == "closed")
        const open = response.data.Ticket.filter((t) => t.status == "open")
        const inProgress = response.data.Ticket.filter(
          (t) => t.status == "in-progress"
        )
        setStats({
          closed: closed.length,
          open: open.length,
          inProgress: inProgress.length,
        })

        const response2 = await axios.get(
          "http://localhost:1111/users/colleagues",
          {
            headers: {
              "x-auth-token": localStorage.getItem("token"),
            },
          }
        )
        console.log(response2.data, " this is colleagues")
        setColleagues(response2.data)
      } catch (error) {
        toast("could not fetch the employee")
        console.error("Error fetching employee details:", error.message, error)
      }
    }

    fetchUser()
  }, [])

  const follow = async () => {
    try {
      await axios.post(
        `http://localhost:1111/follow/${id}`,
        {},
        {
          headers: {
            "x-auth-token": localStorage.getItem("token"),
          },
        }
      )
      toast.success("followed!")
      currentUsers.followedUsers.push(parseInt(id))
    } catch (error) {
      toast("something failed")
      console.log(eror.message, error)
    }
  }
  const unfollow = async () => {
    try {
      await axios.put(
        `http://localhost:1111/follow/${id}`,
        {},
        {
          headers: {
            "x-auth-token": localStorage.getItem("token"),
          },
        }
      )
      currentUser.followedUsers.filter((user) => user !== parseInt(id))
      toast.success("unfollowed!")
    } catch (error) {
      toast("something failed")
      console.log(eror.message, error)
    }
  }
  async function blockUser() {
    try {
      const response = await axios.post(
        `http://localhost:1111/block/${id}`,
        null,
        {
          headers: {
            "x-auth-token": localStorage.getItem("token"),
          },
        }
      )

      if (response.status === 200) {
        toast.success("blocked!")
        console.log("User blocked successfully:", response.data)
      } else {
        console.error("Unexpected response:", response.status, response.data)
      }
      currentUser.blockedUsers.push(parseInt(id))
    } catch (error) {
      toast.error("something failed")
      console.error("Error blocking user:", error.message, error.response?.data)
    }
  }

  async function unblockUser() {
    try {
      const response = await axios.put(
        `http://localhost:1111/block/${id}`,
        null,
        {
          headers: {
            "x-auth-token": localStorage.getItem("token"),
          },
        }
      )

      if (response.status === 200) {
        toast.success("unblocked!")
        console.log("User unblocked successfully:", response.data)
        currentUser.blockedUsers.filter((user) => {
          return user !== parseInt(id)
        })
      } else {
        console.error("Unexpected response:", response.status, response.data)
        toast.error("unblocked")
      }
    } catch (error) {
      console.error(
        "Error unblocking user:",
        error.message,
        error.response?.data
      )
    }
  }

  return (
    <div className="container mx-auto my-5">
      <div className="mx-auto max-w-4xl mb-40 ">
        {user && (
          <div className="flex flex-col space-y-3 mb-5 items-center justify-center">
            <Avatar fallback="A" size="6" className="mx-80 mt-5 " />
            <Heading>{user.name}</Heading>
            <Text>{user.email}</Text>
            {user && user.id != localStorage.getItem("user_id") && (
              <Button
                variant="solid"
                mt="2"
                mb="5"
                className="w-1/2 "
                onClick={() => {
                  const isFollowing = currentUser.followedUsers.includes(
                    parseInt(id)
                  )
                  isFollowing ? unfollow() : follow()
                }}
              >
                {currentUser.followedUsers.includes(parseInt(id))
                  ? "unfollow"
                  : "follow"}
              </Button>
            )}
            <Button
              size="2"
              color="purple"
              className="w-1/2 "
              onClick={() => {
                const isBlocked = currentUser.blockedUsers.includes(
                  parseInt(id)
                )
                isBlocked ? unblockUser() : blockUser()
              }}
            >
              {currentUser.blockedUsers.includes(parseInt(id))
                ? "unblock"
                : "block"}
            </Button>
          </div>
        )}
        {user && (
          <Flex gap="5" mt="2" direction="row" align="center" justify="center">
            <Card size="2" style={{ width: 350 }}>
              <Flex gap="3" align="center">
                <Avatar size="4" radius="full" fallback="P" color="indigo" />
                <Box>
                  <Text as="div" weight="bold">
                    Points
                  </Text>
                  <Text as="div" color="gray">
                    {user?.points || 0}
                  </Text>
                </Box>
              </Flex>
            </Card>

            <Card size="2" style={{ width: 425 }}>
              <Flex gap="4" align="center">
                <Avatar size="4" radius="full" fallback="P" color="indigo" />
                <Box>
                  <Text as="div" weight="bold">
                    punctuality score
                  </Text>
                  <Text as="div" color="gray">
                    12
                  </Text>
                </Box>
              </Flex>
            </Card>

            <Card size="2" style={{ width: 500 }}>
              <Flex gap="4" align="center">
                <Avatar size="4" radius="full" fallback="L" color="indigo" />
                <Box>
                  <Text as="div" weight="bold">
                    Department
                  </Text>
                  <Text as="div" color="gray">
                    {user.Department.name}
                  </Text>
                </Box>
              </Flex>
            </Card>
          </Flex>
        )}
        <Pie
          data={{
            labels: ["Closed", "Open", "In-Progress"],
            datasets: [
              {
                label: "Tickets",
                data: [stats.closed, stats.open, stats.inProgress],
                backgroundColor: [
                  "rgb(255, 99, 132)",
                  "rgb(54, 162, 235)",
                  "rgb(255, 205, 86)",
                ],
                hoverOffset: 4,
              },
            ],
          }}
        />
        <Tabs.Root defaultValue="account">
          <Tabs.List>
            <Tabs.Trigger value="account">Account</Tabs.Trigger>
            <Tabs.Trigger value="colleagues">Colleagues</Tabs.Trigger>
            <Tabs.Trigger value="settings">Settings</Tabs.Trigger>
            <Tabs.Trigger value="followers">followers</Tabs.Trigger>
            <Tabs.Trigger value="following">followers</Tabs.Trigger>
          </Tabs.List>

          <Box px="4" pt="3" pb="2">
            <Tabs.Content value="account">
              <div className="flow-root w-[600px] rounded-md relative top-0 right-60 p-5 border-2  ml-80 h-auto ">
                <h5 className="text-xl font-bold  mb-5 leading-none text-gray-900 dark:text-white">
                  Saved Issues
                </h5>
                <Table.Root className="w-[550px]">
                  <Table.Body size="3">
                    {user &&
                      user.mySavedTickets.map((ticket) => (
                        <Table.Row key={ticket.savedTicket.id}>
                          <Table.RowHeaderCell>
                            <div className="flex flex-col  space-y-4">
                              <Link to={`/tickets/${ticket.savedTicket.id}`}>
                                <Text size="3" weight="regular">
                                  {ticket.savedTicket.name || "title"}
                                </Text>
                              </Link>
                              <Badge size="1" color="red" className="w-[50px]">
                                {ticket.savedTicket.status}
                              </Badge>
                            </div>
                          </Table.RowHeaderCell>
                          <Table.Cell />
                          <Table.Cell justify="end">
                            <Avatar fallback="A" size="2" />
                          </Table.Cell>
                        </Table.Row>
                      ))}
                  </Table.Body>
                </Table.Root>
              </div>
            </Tabs.Content>
            <div className="mx-auto ">
              <Tabs.Content value="colleagues">
                {colleagues && colleagues.length > 0 ? (
                  colleagues.map((user) => (
                    <Card style={{ maxWidth: 240 }}>
                      <Flex gap="3" align="center">
                        <Avatar size="3" fallback="T" />
                        <Box>
                          <Text as="div" size="2" weight="bold">
                            {user.name}
                          </Text>
                          <Text as="div" size="2" color="gray">
                            {user.email}
                          </Text>
                        </Box>
                      </Flex>
                    </Card>
                  ))
                ) : (
                  <Text>No colleagues, make some man!</Text>
                )}
              </Tabs.Content>
            </div>
            <Tabs.Content value="settings">
              <div className="flow-root w-[600px] rounded-md relative top-0 right-60 p-5 border-2  ml-80 h-auto ">
                <h5 className="text-xl font-bold  mb-5 leading-none text-gray-900 dark:text-white">
                  My Issues
                </h5>
                <Table.Root className="w-[550px]">
                  <Table.Body size="3">
                    {user &&
                      user.Ticket.length > 0 &&
                      user.Ticket.map((ticket) => (
                        <Table.Row key={ticket.id}>
                          <Table.RowHeaderCell>
                            <div className="flex flex-col  space-y-4">
                              <Link to={`/tickets/${ticket.id}`}>
                                <Text size="3" weight="regular">
                                  {ticket.name || "title"}
                                </Text>
                              </Link>
                              <Badge size="1" color="red" className="w-[50px]">
                                {ticket.status}
                              </Badge>
                            </div>
                          </Table.RowHeaderCell>
                          <Table.Cell />
                          <Table.Cell justify="end">
                            <Avatar fallback="A" size="2" />
                          </Table.Cell>
                        </Table.Row>
                      ))}
                  </Table.Body>
                </Table.Root>
              </div>
            </Tabs.Content>
            <Tabs.Content value="following">
              <div className="flow-root w-[600px] rounded-md relative top-0 right-60 p-5 border-2  ml-80 h-auto ">
                <h5 className="text-xl font-bold  mb-5 leading-none text-gray-900 dark:text-white">
                  Followers
                </h5>
                {followers &&
                  followers.length > 0 &&
                  followers.map((follower) => (
                    <Card style={{ maxWidth: 240 }}>
                      <Flex gap="3" align="center">
                        <Avatar size="3" fallback="T" />
                        <Box>
                          <Text as="div" size="2" weight="bold">
                            {follower.followedBy.name}
                          </Text>
                          <Text as="div" size="2" color="gray">
                            {follower.followedBy.email}
                          </Text>
                        </Box>
                      </Flex>
                    </Card>
                  ))}
              </div>
            </Tabs.Content>
            <Tabs.Content value="followers">
              <div className="flow-root w-[600px] rounded-md relative top-0 right-60 p-5 border-2  ml-80 h-auto ">
                <h5 className="text-xl font-bold  mb-5 leading-none text-gray-900 dark:text-white">
                  Following
                </h5>
                <Table.Root className="w-[550px]">
                  <Table.Body size="3">
                    {following &&
                      following.length > 0 &&
                      following.map((follower) => (
                        <Card style={{ maxWidth: 240 }}>
                          <Flex gap="3" align="center">
                            <Avatar size="3" fallback="T" />
                            <Box>
                              <Text as="div" size="2" weight="bold">
                                {follower.following.name}
                              </Text>
                              <Text as="div" size="2" color="gray">
                                {follower.following.email}
                              </Text>
                            </Box>
                          </Flex>
                        </Card>
                      ))}
                  </Table.Body>
                </Table.Root>
              </div>
            </Tabs.Content>
          </Box>
        </Tabs.Root>{" "}
      </div>
    </div>
  )
}

export default User
//
