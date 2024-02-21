import { useUser } from "../contexts/userContext"
import { useEffect, useState } from "react"
import { Dialog, Button, Flex, Text, TextField } from "@radix-ui/themes"
import { ChatBubbleIcon } from "@radix-ui/react-icons"
import axios from "axios"

const SideBar = ({ setId }) => {
  let user = useUser()
  const [newServer, setNewServer] = useState({ name: "", type: "" })

  const createServer = async () => {
    try {
      const token = localStorage.getItem("token")
      const config = {
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": token,
        },
      }

      const response = await axios.post(
        "http://localhost:1111/chats",
        newServer,
        config
      )
      user.Chats.push({
        ...response.data.chat,
        channels: [response.data.channel],
      })
      console.log("Chat created:", response.data, user.Chats)
      setNewServer({ name: "", type: "" })
    } catch (error) {
      console.error("Error creating chat:", error)
    }
  }
  useEffect(() => {
    console.log(user)
  }, [user])
  return (
    <div className="fixed top-0 border-r  left-0 z-40 w-48 h-screen p-4 overflow-y-auto transition-transform bg-white dark:bg-gray-800">
      <h5 className="text-base font-semibold text-gray-500 uppercase dark:text-gray-400">
        Chats
      </h5>
      <div className="py-4 overflow-y-auto">
        <ul className="space-y-2 font-medium">
          {user &&
            user.Chats &&
            user.Chats.map((chat) => (
              <li onClick={() => setId(chat.id)}>
                <a
                  href="#"
                  className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group"
                >
                  <ChatBubbleIcon className="w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" />
                  <span className="ms-3">{chat.name}</span>
                </a>
              </li>
            ))}

          <li>
            <a
              href="#"
              className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white group absolute bottom-5 flex flex-row"
            >
              <Dialog.Root>
                <Dialog.Trigger>
                  <Button>New Chat</Button>
                </Dialog.Trigger>

                <Dialog.Content style={{ maxWidth: 450 }}>
                  <Dialog.Title>New Server</Dialog.Title>
                  <Dialog.Description size="2" mb="4">
                    Make a new server
                  </Dialog.Description>

                  <Flex direction="column" gap="3">
                    <label>
                      <Text as="div" size="2" mb="1" weight="bold">
                        Name
                      </Text>
                      <TextField.Input
                        defaultValue="my-server"
                        placeholder="Enter your server's name"
                        onChange={(e) =>
                          setNewServer({ ...newServer, name: e.target.value })
                        }
                      />
                    </label>
                    <label>
                      <Text as="div" size="2" mb="1" weight="bold">
                        Type
                      </Text>
                      <TextField.Input
                        defaultValue="freja@example.com"
                        placeholder="Type can either be group or channel"
                        onChange={(e) =>
                          setNewServer({ ...newServer, type: e.target.value })
                        }
                      />
                    </label>
                  </Flex>

                  <Flex gap="3" mt="4" justify="end">
                    <Dialog.Close>
                      <Button variant="soft" color="gray">
                        Cancel
                      </Button>
                    </Dialog.Close>
                    <Dialog.Close>
                      <Button onClick={() => createServer()}>Save</Button>
                    </Dialog.Close>
                  </Flex>
                </Dialog.Content>
              </Dialog.Root>
            </a>
          </li>
        </ul>
      </div>
    </div>
  )
}

export default SideBar
