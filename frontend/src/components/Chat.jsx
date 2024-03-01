import React, { useState, useEffect } from "react";
import { CaretDownIcon, PlusIcon } from "@radix-ui/react-icons";
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
  Dialog,
  Heading,
  AspectRatio,
  IconButton,
} from "@radix-ui/themes";
import Meet from "./Meet";
import Sidebar from "./Sidebar";
import axios from "axios";
import { toast } from "react-hot-toast";
import Uploader from "./Uploader.jsx";
import { Sparkles } from "./Sparkles.jsx";
import { useUser } from "../contexts/userContext.jsx";
import moment from "moment";
import { Image } from "antd";

const Chat = () => {
  const [id, setId] = useState(null);
  const [inputMessage, setInputMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [editing, setEditing] = useState(null);
  const [ws, setWs] = useState(null);
  const [chatData, setChatData] = useState(null);
  const [selectedChannel, setSelectedChannel] = useState({
    name: "general",
    channel_type: "text",
  });
  const [newChannel, setNewChannel] = useState({
    channel_type: "audio",
    name: "",
  });
  const [editMessage, setEditMessage] = useState(null);
  const xAuthToken = localStorage.getItem("token");
  const user = useUser();

  useEffect(() => {
    const fetchChatData = async () => {
      try {
        const response = await fetch(`http://localhost:1111/chats/${id}`);
        if (response.ok) {
          const data = await response.json();
          console.log(data);
          setChatData(data);
        } else {
          console.error("Failed to fetch chat data");
        }
      } catch (error) {
        console.error("Error fetching chat data:", error);
      }
    };
    if (id) {
      fetchChatData();
    }
  }, [id]);

  useEffect(() => {
    if (ws) {
      ws.close();
    }

    if (id) {
      const connectWebSocket = () => {
        setMessages([]);
        const newWs = new WebSocket(
          `ws://localhost:1111/chat/${id}/${selectedChannel.name}?xAuthToken=${xAuthToken}`
        );

        newWs.onmessage = (event) => {
          const message = JSON.parse(event.data);
          console.log(message);
          if (message.edited) {
            const indexToUpdate = messages.findIndex(
              (_message) => _message.id === message.id
            );

            setMessages((prevMessages) => {
              const updatedMessages = [...prevMessages];
              updatedMessages[indexToUpdate] = {
                ...updatedMessages[indexToUpdate],
                value: message.value,
              };
              return updatedMessages;
            });
          } else {
            setMessages((prevMessages) => [...prevMessages, message]);
          }
        };

        newWs.onclose = () => {
          toast("socket disconnected...");
          setTimeout(connectWebSocket, 60 * 1000); // Reconnect after 60 seconds
        };

        newWs.onopen = () => {
          toast.success("socket connected...");
        };

        setWs(newWs);
      };

      connectWebSocket();
    }

    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, [id, selectedChannel]);

  const edit = (msgId) => {
    if (ws && msgId) {
      ws.send(`${editMessage}~edit-message-karan112010=${msgId}`);
      setEditing(null);
      setEditMessage(null);
    }
  };

  const changeRole = async (role, userId) => {
    await axios.put(
      `http://localhost:1111/chats/changeRole/${id}/${userId}`,
      {
        role: role,
      },
      {
        headers: {
          "x-auth-token": xAuthToken,
        },
      }
    );

    toast.success("modified the user's role!");
  };

  const addChannel = async (e) => {
    e.preventDefault();
    const token = xAuthToken;

    // Set up the request headers
    const config = {
      headers: {
        "Content-Type": "application/json",
        "x-auth-token": token,
      },
    };
    const response = await axios.post(
      "http://localhost:1111/chats/createChannel",
      { ...newChannel, chat_id: id },
      config
    );
    console.log(response.data);
    chatData.channels.push(response.data.dataValues);

    setNewChannel({
      name: "",
      channel_type: "",
    });
  };

  const sendMessage = () => {
    if (ws) {
      ws.send(inputMessage);
      setInputMessage("");
    }
  };

  return (
    <>
      {user && <Sidebar setId={setId} />}
      {chatData && chatData.type !== "personal" && (
        <aside
          id="default-sidebar"
          className="sticky left-64 border-r border-double border-gray-100 z-40 w-[8rem] h-screen transition-transform -translate-x-full sm:translate-x-0"
        >
          <div className="h-full  py-4 text-center absolute left-[-3rem] overflow-y-auto  dark:bg-gray-800">
            <div className="flex flex-row space-x-4 items-center">
              <Heading>Channels</Heading>
              <Dialog.Root>
                <Dialog.Trigger>
                  <IconButton size="1">
                    <PlusIcon width="18" height="18" />
                  </IconButton>
                </Dialog.Trigger>
                <Dialog.Content style={{ maxWidth: 450 }}>
                  <Dialog.Title>Edit profile</Dialog.Title>
                  <Dialog.Description size="2" mb="4">
                    Make changes to your profile.
                  </Dialog.Description>

                  <Flex direction="column" gap="3">
                    <label>
                      <Text as="div" size="2" mb="1" weight="bold">
                        Name
                      </Text>
                      <TextField.Input
                        defaultValue="my-channel"
                        value={newChannel.name}
                        onChange={(e) =>
                          setNewChannel({ ...newChannel, name: e.target.value })
                        }
                        placeholder="Type channel name"
                      />
                    </label>
                    <label>
                      <Text as="div" size="2" mb="1" weight="bold">
                        Type
                      </Text>
                      <Select.Root
                        defaultValue="text"
                        onValueChange={(value) => {
                          setNewChannel({ ...newChannel, channel_type: value });
                          console.log(value);
                        }}
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
                      <Button onClick={addChannel}>Save</Button>
                    </Dialog.Close>
                  </Flex>
                </Dialog.Content>
              </Dialog.Root>
            </div>
            <ul className=" font-medium">
              {chatData &&
                chatData.channels &&
                chatData.channels.map((channel, index) => (
                  <li
                    key={index}
                    onClick={() => {
                      setSelectedChannel(channel);
                      console.log(channel);
                    }}
                  >
                    <a
                      href="#"
                      className="flex items-center  mb-4 p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group"
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
            </ul>
            <Heading>Members</Heading>
            <ul className="space-y-2 font-medium">
              {chatData &&
                chatData.Users &&
                chatData.Users.map((user, index) => (
                  <ContextMenu.Root>
                    <ContextMenu.Trigger>
                      <li key={index}>
                        <a
                          href="#"
                          className="flex items-center  mb-4 p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group"
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
                            {user.name}
                          </span>
                        </a>
                      </li>
                    </ContextMenu.Trigger>
                    <ContextMenu.Content>
                      <ContextMenu.Separator />
                      <ContextMenu.Sub>
                        <ContextMenu.SubTrigger>Role</ContextMenu.SubTrigger>
                        <ContextMenu.SubContent>
                          {["owner", "moderator", "user"]
                            .filter((role) => role !== user.ChatUser.role)
                            .map((role) => {
                              return (
                                <>
                                  <ContextMenu.Item
                                    onClick={() => changeRole(role, user.id)}
                                  >
                                    {role}
                                  </ContextMenu.Item>
                                </>
                              );
                            })}
                        </ContextMenu.SubContent>
                      </ContextMenu.Sub>

                      <ContextMenu.Separator />
                      <ContextMenu.Item shortcut="⌘ ⌫" color="red">
                        Kick
                      </ContextMenu.Item>
                    </ContextMenu.Content>
                  </ContextMenu.Root>
                ))}
            </ul>
          </div>
        </aside>
      )}

      {id !== null ? (
        <div className="p-5 ">
          <div className="flex flex-col p-4 space-x-5 space-y-5 h-[500px] absolute top-5  left-96">
            {selectedChannel &&
            chatData &&
            selectedChannel.type == ("video" || "audio") ? (
              <div className="h-[400px] w-[500px] ml-40 ">
                <Meet
                  channel={selectedChannel}
                  video={selectedChannel.type == "audio" ? false : true}
                />
              </div>
            ) : (
              messages &&
              messages.map((msg) => (
                <div style="w-full">
                  <div className="flex flex-row space-x-4">
                    <Heading>{chatData.name}</Heading>
                    <DropdownMenu.Root>
                      <DropdownMenu.Trigger>
                        <svg
                          width="25"
                          height="25"
                          viewBox="0 0 15 15"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M3.13523 6.15803C3.3241 5.95657 3.64052 5.94637 3.84197 6.13523L7.5 9.56464L11.158 6.13523C11.3595 5.94637 11.6759 5.95657 11.8648 6.15803C12.0536 6.35949 12.0434 6.67591 11.842 6.86477L7.84197 10.6148C7.64964 10.7951 7.35036 10.7951 7.15803 10.6148L3.15803 6.86477C2.95657 6.67591 2.94637 6.35949 3.13523 6.15803Z"
                            fill="currentColor"
                            fill-rule="evenodd"
                            clip-rule="evenodd"
                          ></path>
                        </svg>
                      </DropdownMenu.Trigger>
                      <DropdownMenu.Content>
                        <DropdownMenu.Item shortcut="⌘ E">
                          Edit Server
                        </DropdownMenu.Item>
                        <DropdownMenu.Item shortcut="⌘ D">
                          <Dialog.Root>
                            <Dialog.Trigger>Invite</Dialog.Trigger>

                            <Dialog.Content style={{ maxWidth: 450 }}>
                              <Dialog.Title>Edit profile</Dialog.Title>
                              <Dialog.Description size="2" mb="4">
                                Make changes to your profile.
                              </Dialog.Description>

                              <Flex direction="column" gap="3">
                                <label>
                                  <Text as="div" size="2" mb="1" weight="bold">
                                    Name
                                  </Text>
                                  <TextField.Input
                                    defaultValue="Freja Johnsen"
                                    placeholder="Enter your full name"
                                  />
                                </label>
                                <label>
                                  <Text as="div" size="2" mb="1" weight="bold">
                                    Email
                                  </Text>
                                  <TextField.Input
                                    defaultValue="freja@example.com"
                                    placeholder="Enter your email"
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
                                  <Button>Save</Button>
                                </Dialog.Close>
                              </Flex>
                            </Dialog.Content>
                          </Dialog.Root>
                        </DropdownMenu.Item>
                        <DropdownMenu.Item shortcut="⌘ ⌫" color="red">
                          Delete
                        </DropdownMenu.Item>
                      </DropdownMenu.Content>
                    </DropdownMenu.Root>
                  </div>
                  <Separator my="3" size="4" />
                  <ContextMenu.Root key={msg.id} size="1">
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
                        <>
                          {!msg.url ? (
                            <Card
                              style={{
                                maxWidth: 240,
                                marginTop: 10,
                                marginBottom: 10,
                              }}
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
                                  <Text as="div" size="3" color="gray">
                                    {msg.value.toString()}
                                  </Text>
                                  <Text as="div" size="1" color="gray">
                                    {moment(msg.createdAt).fromNow()}
                                  </Text>
                                </Box>
                              </Flex>
                            </Card>
                          ) : (
                            <Image width={200} src={msg.url} />
                          )}
                        </>
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
                </div>
              ))
            )}
          </div>
          <div className="flex flex-row  items-center justify-center    space-x-4 fixed bottom-5 left-96 ">
            <TextField.Input
              value={inputMessage}
              style={{
                width: "800px",
              }}
              size="3"
              onChange={(e) => setInputMessage(e.target.value)}
            />
            <Button onClick={sendMessage}>Send</Button>
            {ws && <Uploader ws={ws} />}
          </div>
        </div>
      ) : (
        <Sparkles />
      )}
    </>
  );
};

export default Chat;
