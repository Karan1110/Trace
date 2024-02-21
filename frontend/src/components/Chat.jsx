import React, { useState, useEffect } from "react"
import {
  Box,
  Text,
  Flex,
  Avatar,
  Card,
  ContextMenu,
  Button,
  TextField,
  Select,
} from "@radix-ui/themes"
import Meet from "./Meet"
import Sidebar from "./Sidebar"

const Chat = () => {
  const [id, setId] = useState(1)
  const [inputMessage, setInputMessage] = useState("")
  const [messages, setMessages] = useState([])
  const [isOpen, setIsOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [ws, setWs] = useState(null)
  const [chatData, setChatData] = useState(null)
  const [selectedChannel, setSelectedChannel] = useState("general")
  const [newChannel, setNewChannel] = useState({
    type: "audio",
    name: "",
  })
  const [editMessage, setEditMessage] = useState(null)
  const xAuthToken = localStorage.getItem("token")

  useEffect(() => {
    const fetchChatData = async () => {
      try {
        const response = await fetch(`http://localhost:1111/chats/${id}`)
        if (response.ok) {
          const data = await response.json()
          setChatData(data)
        } else {
          console.error("Failed to fetch chat data")
        }
      } catch (error) {
        console.error("Error fetching chat data:", error)
      }
    }

    fetchChatData()
  }, [id])

  useEffect(() => {
    if (ws) {
      ws.close()
    }

    const newWs = new WebSocket(
      `ws://localhost:1111/chat/${id}/${selectedChannel}?xAuthToken=${xAuthToken}`
    )

    setMessages([])

    newWs.onmessage = (event) => {
      const message = JSON.parse(event.data)
      console.log(message)
      if (message.edited) {
        const indexToUpdate = messages.findIndex(
          (_message) => _message.id == message.id
        )

        setMessages((prevMessages) => {
          const updatedMessages = [...prevMessages]
          updatedMessages[indexToUpdate] = {
            ...updatedMessages[indexToUpdate],
            value: message.value,
          }
          return updatedMessages
        })
      } else {
        setMessages((prevMessages) => [...prevMessages, message])
      }
    }

    setWs(newWs)

    return () => {
      newWs.close()
    }
  }, [id, selectedChannel])

  const edit = (msgId) => {
    if (ws && msgId) {
      ws.send(`${editMessage}~edit-message-karan112010=${msgId}`)
      setEditing(null)
      setEditMessage(null)
    }
  }

  const handleAddChannel = () => {
    setIsOpen(true)
  }
  const addChannel = async (e) => {
    e.preventDefault()
    const token = localStorage.getItem("token")

    // Set up the request headers
    const config = {
      headers: {
        "Content-Type": "application/json",
        "x-auth-token": token,
      },
    }
    const response = await axios.post(
      "http://localhost:1111/chats/createChannel",
      { ...newChannel, chat_id: id },
      config
    )

    chatData.channels.push({
      ...newChannel,
      chat_id: id,
      id: response.data.channel.dataValues.id,
    })
    setNewChannel({})
  }

  const sendMessage = () => {
    if (ws) {
      ws.send(inputMessage)
      setInputMessage("")
    }
  }

  return (
    <>
      <Sidebar setId={setId} />
      {isOpen && (
        // JSX for Main modal
        <div
          id="crud-modal"
          tabIndex="-1"
          aria-hidden="true"
          className=" overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 justify-center items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full"
        >
          <div className="relative p-4 w-full max-w-md max-h-full">
            {/* Modal content */}
            <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
              {/* Modal header */}
              <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Create New channel
                </h3>
                <button
                  type="button"
                  className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
                  onClick={() => setIsOpen(false)}
                >
                  <svg
                    className="w-3 h-3"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 14 14"
                  >
                    <path
                      stroke="currentColor"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                    />
                  </svg>
                  <span className="sr-only">Close modal</span>
                </button>
              </div>
              {/* Modal body */}
              <form className="p-4 md:p-5" onSubmit={(e) => addChannel(e)}>
                <div className="grid gap-4 mb-4 grid-cols-2">
                  <div className="col-span-2">
                    <label
                      htmlFor="name"
                      className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                    >
                      Name
                    </label>
                    <TextField.Input
                      type="text"
                      value={newChannel.name}
                      onChange={(e) =>
                        setNewChannel({ ...newChannel, name: e.target.value })
                      }
                      placeholder="Type channel name"
                    />{" "}
                    <Select.Root
                      defaultValue="text"
                      onValueChange={(value) =>
                        setNewChannel({ ...newChannel, type: value })
                      }
                    >
                      <Select.Trigger>
                        <Button variant="outline">
                          <CaretDownIcon />
                        </Button>
                      </Select.Trigger>
                      <Select.Content color="purple">
                        <Select.Item value="text" key={1}>
                          Text
                        </Select.Item>
                        <Select.Item value="audio" key={2}>
                          Audio
                        </Select.Item>
                        <Select.Item value="video" key={3}>
                          Video
                        </Select.Item>
                        <Select.Item value={null}>Not Assigned</Select.Item>
                      </Select.Content>
                    </Select.Root>
                  </div>
                  {/* ... Other input fields ... */}
                </div>
                <Button type="submit">Add new channel</Button>
              </form>
            </div>
          </div>
        </div>
      )}
      {chatData && (
        <aside
          id="default-sidebar"
          className="sticky left-0 border-r border-double border-gray-100 z-40 w-64 h-screen transition-transform -translate-x-full sm:translate-x-0"
        >
          <div className="h-full px-3 py-4 overflow-y-auto  dark:bg-gray-800">
            <ul className="space-y-2 font-medium">
              {chatData &&
                chatData.channels &&
                chatData.channels.map((channel, index) => (
                  <li
                    key={index}
                    onClick={() => {
                      setSelectedChannel(channel.name)
                    }}
                  >
                    <a
                      href="#"
                      className="flex items-center border-2 mb-4 p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group"
                    >
                      <svg
                        className="flex-shrink-0 w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="currentColor"
                        viewBox="0 0 20 18"
                      >
                        {/* Replace the SVG path with the appropriate icon for each channel */}
                        <path d="M14 2a3.963 3.963 0 0 0-1.4.267 6.439 6.439 0 0 1-1.331 6.638A4 4 0 1 0 14 2Zm1 9h-1.264A6.957 6.957 0 0 1 15 15v2a2.97 2.97 0 0 1-.184 1H19a1 1 0 0 0 1-1v-1a5.006 5.006 0 0 0-5-5ZM6.5 9a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9ZM8 10H5a5.006 5.006 0 0 0-5 5v2a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1v-2a5.006 5.006 0 0 0-5-5Z" />
                      </svg>
                      <span className="flex-1 ms-3 whitespace-nowrap">
                        {channel.name}
                      </span>
                    </a>
                  </li>
                ))}
              <Button onClick={handleAddChannel} color="purple">
                Add
              </Button>
            </ul>
          </div>
        </aside>
      )}
      <div className="p-5 ">
        <div className="flex flex-col p-4 space-x-5 space-y-5 h-[500px] absolute top-5  left-96">
          {selectedChannel &&
          chatData &&
          chatData.channels &&
          chatData.channels.find((channel) => channel.name == selectedChannel)
            ?.type === "video" ? (
            // Render Meet components if selected channel's type is video
            <Meet channel={selectedChannel} />
          ) : selectedChannel &&
            chatData &&
            chatData.channels &&
            chatData.channels.find((channel) => channel.name == selectedChannel)
              ?.type === "audio" ? (
            // Render Meet components if selected channel's type is audio
            <Meet channel={selectedChannel} />
          ) : (
            messages &&
            messages.map((msg) => (
              <ContextMenu.Root size="1">
                <ContextMenu.Trigger>
                  {msg && msg.id && editing == msg?.id ? (
                    <Flex direction="row">
                      <TextField.Input
                        style={{
                          width: "500px",
                        }}
                        size="2"
                        onChange={(e) => setEditMessage(e.target.value)}
                      />

                      <Button
                        color="purple"
                        onClick={() => edit(msg.id, editMessage)}
                      >
                        Edit
                      </Button>
                    </Flex>
                  ) : (
                    <Card
                      style={{ maxWidth: 240, marginTop: 10, marginBottom: 10 }}
                      size="1"
                    >
                      <Flex gap="3" align="center">
                        <Avatar
                          size="3"
                          src="https://images.unsplash.com/photo-1607346256330-dee7af15f7c5?&w=64&h=64&dpr=2&q=70&crop=focalpoint&fp-x=0.67&fp-y=0.5&fp-z=1.4&fit=crop"
                          radius="full"
                          fallback="T"
                        />
                        <Box>
                          <Text as="div" size="2" color="gray">
                            {msg.value || msg.message}
                          </Text>
                        </Box>
                      </Flex>
                    </Card>
                  )}
                </ContextMenu.Trigger>
                <ContextMenu.Content>
                  <ContextMenu.Item
                    shortcut="⌘ E"
                    onClick={() => setEditing(msg.id)}
                  >
                    Edit
                  </ContextMenu.Item>
                  <ContextMenu.Separator />
                  <ContextMenu.Item shortcut="⌘ ⌫" color="red">
                    Delete
                  </ContextMenu.Item>
                </ContextMenu.Content>
              </ContextMenu.Root>
            ))
          )}
        </div>
        <div className="flex flex-row  items-center justify-center    space-x-4 fixed bottom-5 left-96 ">
          <TextField.Input
            value={inputMessage}
            style={{
              width: "900px",
            }}
            size="3"
            onChange={(e) => setInputMessage(e.target.value)}
          />
          <Button onClick={sendMessage}>Send</Button>
        </div>
      </div>
    </>
  )
}

export default Chat
