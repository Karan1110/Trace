// src/components/ChatPage.js
import React, { useState, useEffect } from "react"
import { ContextMenu } from "@radix-ui/themes"

const Chat = () => {
  const id = 786
  const [inputMessage, setInputMessage] = useState("")
  const [messages, setMessages] = useState([])
  const [isOpen, setIsOpen] = useState(false)
  const [ws, setWs] = useState(null)
  const [chatData, setChatData] = useState(null)
  const [selectedChannel, setSelectedChannel] = useState("general")
  const [channels, setChannels] = useState(["general"])
  const [newChannel, setNewChannel] = useState("")
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
    if (chatData) {
      if (ws) {
        ws.close()
      }
      const newWs = new WebSocket(
        `ws://localhost:1111/chat/${id}/${selectedChannel}?xAuthToken=${xAuthToken}&type=group&name=${chatData.name}`
      )

      setMessages([])

      newWs.onmessage = (event) => {
        const message = JSON.parse(event.data)
        setMessages((prevMessages) => [...prevMessages, message])
      }

      setWs(newWs)

      return () => {
        newWs.close()
      }
    }
  }, [id, xAuthToken, chatData, selectedChannel])
  const edit = (msgId, newMessage) => {
    if (ws && msgId && newMessage) {
      // Emit the "edit" event to the WebSocket server with the new message and message ID
      ws.send(JSON.stringify({ edit: true, id: msgId, message: newMessage }))
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
          className="fixed top-[70px] left-0 z-40 w-64 h-screen transition-transform -translate-x-full sm:translate-x-0"
          aria-label="Sidebar"
        >
          <div className="h-full px-3 py-4 overflow-y-auto bg-gray-50 dark:bg-gray-800">
            <ul className="space-y-2 font-medium">
              {channels &&
                channels.map((channel) => (
                  <li key={channel} onClick={() => setSelectedChannel(channel)}>
                    <a
                      href="#"
                      className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group"
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
              <button
                className="px-3 py-1 bg-blue-600 rounded-full shadow-lg hover:bg-blue-800"
                onClick={handleAddChannel}
              >
                Add
              </button>
            </ul>
          </div>
        </aside>
      )}
      <div className="ml-[250px] p-8 bg-gray-100 rounded-md shadow-md">
        <div className="mb-4 overflow-y-auto">
          {messages &&
            messages.map((msg) => (
              <ContextMenu.Root size="1">
                <ContextMenu.Trigger>
                  <RightClickZone>
                    <div key={msg.id} className="my-3">
                      <span className="font-semibold">{msg.employee_id}:</span>{" "}
                      {msg.value} - {msg.isRead.toString()} - {msg.channel} -{" "}
                      {selectedChannel} - {msg.id || msg.dataValues.id}
                    </div>
                  </RightClickZone>
                </ContextMenu.Trigger>
                <ContextMenu.Content>
                  <ContextMenu.Item
                    shortcut="⌘ E"
                    onClick={() => edit(msg.id, "New edited message")}
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
        <div className="flex space-x-2 absolute justify-center tex-center  items-center bottom-5">
          <input
            type="text"
            value={inputMessage}
            style={{
              width: "800px",
            }}
            onChange={(e) => setInputMessage(e.target.value)}
            className="flex-1 px-4 py-2 w-full ml-10
            
            
             border rounded-md focus:outline-none focus:ring focus:border-blue-300"
          />
          <button
            onClick={sendMessage}
            className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring focus:border-blue-300"
          >
            Send
          </button>
        </div>
      </div>
    </>
  )
}

export default Chat
