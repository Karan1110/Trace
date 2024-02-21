import { BsPlus, BsFillLightningFill, BsGearFill } from "react-icons/bs"
import { FaFire, FaPoo } from "react-icons/fa"

import { useUser } from "../contexts/userContext"
import { useState } from "react"

const SideBar = ({ setId, chatId }) => {
  const user = useUser()
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
      console.log("Chat created:", response.data)
      setNewServer({ name: "", type: "" })
    } catch (error) {
      console.error("Error creating chat:", error)
    }
  }
  return (
    <div
      className="fixed top-0 left-0 h-screen w-16 flex flex-col
                  bg-white dark:bg-gray-900 shadow-lg"
    >
      <SideBarIcon icon={<FaFire size="28" />} />
      <Divider />
      {user.Chats.map((chat) => (
        <SideBarIcon
          icon={<BsFillLightningFill size="20" />}
          onClick={() => setId(chat.id)}
        />
      ))}
      <Dialog.Root>
        <Dialog.Trigger>
          <SideBarIcon icon={<BsPlus size="32" />} />
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
      <Divider />
      <SideBarIcon icon={<BsGearFill size="22" />} />
    </div>
  )
}

const SideBarIcon = ({ icon, text = "tooltip 💡" }) => (
  <div className="sidebar-icon group">
    {icon}
    <span class="sidebar-tooltip group-hover:scale-100">{text}</span>
  </div>
)

const Divider = () => <hr className="sidebar-hr" />

export default SideBar
