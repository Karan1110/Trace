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
} from "@radix-ui/themes"

const Chat = () => {
  const id = 1
  const [inputMessage, setInputMessage] = useState("")
  const [messages, setMessages] = useState([])
  const [isOpen, setIsOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [ws, setWs] = useState(null)
  const [chatData, setChatData] = useState(null)
  const [selectedChannel, setSelectedChannel] = useState("general")
  const [channels, setChannels] = useState(["general"])
  const [newChannel, setNewChannel] = useState("")
  const [editMessage, setEditMessage] = useState(null)
  const xAuthToken = localStorage.getItem("token")

  useEffect(() => {
    const fetchChatData = async () => {
      try {
        const response = await fetch(`http://localhost:1111/chats/${id}`)
        if (response.ok) {
          const data = await response.json()
          setChatData(data)
          const { channels } = data

          // console.log(chatChanels)
          setChannels(channels)
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
      if (message.edited == true) {
        updateMessageValue(message.id, message.value)
      } else {
        setMessages((prevMessages) => [...prevMessages, message])
      }
    }

    setWs(newWs)

    return () => {
      newWs.close()
    }
  }, [id, selectedChannel])

  const updateMessageValue = (idToUpdate, newMessage) => {
    // Find the index of the message with the matching ID
    const indexToUpdate = messages.findIndex((message) => {
      return message.id == idToUpdate
    })
    messages.forEach((message) =>
      console.log(typeof message.id == typeof idToUpdate)
    )

    console.log("index to find : ", indexToUpdate)
    // Check if the message with the given ID exists
    if (indexToUpdate != -1) {
      console.log("editing....")
      // Create a copy of the messages array
      const updatedMessages = [...messages]

      // Update the value of the message with the matching ID
      updatedMessages[indexToUpdate] = {
        ...updatedMessages[indexToUpdate],
        value: newMessage,
      }

      // Set the state with the updated array
      setMessages(updatedMessages)
    }
  }

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
  const addChannel = (e) => {
    e.preventDefault()

    if (channels.includes(newChannel)) {
      return
    }
    // Update the channels state and set the selected channel
    setChannels((prevChannels) => [...prevChannels, newChannel])
    setSelectedChannel(newChannel)
  }
  const sendMessage = () => {
    if (ws) {
      ws.send(inputMessage)
      setInputMessage("")
    }
  }

  return (
    <>
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
                    <input
                      type="text"
                      name="name"
                      value={newChannel}
                      onChange={(e) => setNewChannel(e.target.value)}
                      id="name"
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                      placeholder="Type channel name"
                      required
                    />
                  </div>
                  {/* ... Other input fields ... */}
                </div>
                <button
                  type="submit"
                  className="text-white inline-flex items-center bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                >
                  <svg
                    className="me-1 -ms-1 w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                      clip-rule="evenodd"
                    />
                  </svg>
                  Add new channel
                </button>
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
              {channels &&
                channels.map((channel) => (
                  <li key={channel} onClick={() => setSelectedChannel(channel)}>
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
                        {channel}
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
          {messages &&
            messages.map((msg) => (
              <ContextMenu.Root size="1">
                <ContextMenu.Trigger>
                  {editing == msg.id ? (
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
            ))}
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
