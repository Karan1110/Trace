import { useUser } from "../contexts/userContext";
import Tooltip from "../ui/tool-tip";
import { Dialog, Button, Flex, Text, TextField } from "@radix-ui/themes";
import axios from "axios";
import { useState } from "react";

const SideBar = ({ setId }) => {
  let user = useUser();
  const [newServer, setNewServer] = useState({
    name: "my-server",
    type: "text",
  });

  const createServer = async () => {
    try {
      const token = localStorage.getItem("token");
      const config = {
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": token,
        },
      };

      const response = await axios.post(
        "http://localhost:1111/chats",
        newServer,
        config
      );
      user.chats.push(response.data.chat);
      console.log("chat created:", response.data, user.chats);
      setNewServer({ name: "my-server", type: "text" });
    } catch (error) {
      console.error("Error creating chat:", error);
    }
  };

  return (
    <div className="fixed top-0 border-r  left-0 z-40 w-24 h-screen p-1 overflow-y-auto transition-transform bg-white dark:bg-gray-800">
      <div className="py-4 overflow-y-auto overflow-x-hidden flex flex-col items-center justify-center">
        {user.chats.length > 0 && (
          <Tooltip
            items={user.chats.map((c) => {
              return {
                id: c.chat_id,
                name: c.name,
                designation: "not decided",
                image:
                  "https://images.unsplash.com/photo-1599566150163-29194dcaad36?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=3387&q=80",
              };
            })}
            setId={setId}
          />
        )}
      </div>
      <div className="absolute bottom-5">
        <Dialog.Root>
          <Dialog.Trigger>
            <Button ml="3" size="1">
              {" "}
              New{" "}
            </Button>
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
                  value={newServer.name}
                  onChange={(e) =>
                    setNewServer({ ...newServer, name: e.target.value })
                  }
                />
              </label>
              <label>
                <Text as="div" size="2" mb="1" weight="bold">
                  Type
                </Text>
                
                <Select.Root
                  defaultValue="group"
                  onValueChange={(value) =>
                    setNewServer({ ...newServer, type: value })
                  }
                >
                  <Select.Trigger>
                    <Button variant="outline">
                      <CaretDownIcon />
                    </Button>
                  </Select.Trigger>
                  <Select.Content color="purple">
                    <Select.Item value="group">group</Select.Item>
                    <Select.Item value="channel">channel</Select.Item>
                  </Select.Content>
                </Select.Root>
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
      </div>
    </div>
  );
};

export default SideBar;
