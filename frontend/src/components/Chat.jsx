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

  const copyToClipboard = (text) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        toast.success("copied!");
      })
      .catch((err) => console.error("Failed to copy:", err));
  };

  const updateInviteCode = async () => {
    const resp = await axios.put(
      `http://localhost:1111/chats/updateInviteCode/${id}`,
      {},
      {
        headers: {
          "x-auth-token": localStorage.getItem("token"),
        },
      }
    );

    setChatData({ ...chatData, inviteCode: resp.data.newInviteCode });
  };

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
                    {chatData.type !== "personal" && (
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
                            <Dialog.Root>
                              <Dialog.Trigger>Edit Server</Dialog.Trigger>
                              <Dialog.Content style={{ maxWidth: 450 }}>
                                <Dialog.Title>{chatData.name}</Dialog.Title>
                                <Dialog.Description size="2" mb="4">
                                  Edit server
                                </Dialog.Description>

                                <Flex direction="column" gap="3">
                                  <label>
                                    <Text
                                      as="div"
                                      size="2"
                                      mb="1"
                                      weight="bold"
                                    >
                                      Server's name
                                    </Text>
                                  </label>
                                  <TextField.Input value={chatData.name} />
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
                          <DropdownMenu.Item shortcut="⌘ D">
                            <Dialog.Root>
                              <Dialog.Trigger>Invite</Dialog.Trigger>

                              <Dialog.Content style={{ maxWidth: 450 }}>
                                <Dialog.Title>
                                  Invite - {chatData.name}
                                </Dialog.Title>
                                <Dialog.Description size="2" mb="4">
                                  Invite a member
                                </Dialog.Description>

                                <Flex direction="column" gap="3">
                                  <label>
                                    <Text
                                      as="div"
                                      size="2"
                                      mb="1"
                                      weight="bold"
                                    >
                                      Invite Code
                                    </Text>
                                  </label>
                                  <Flex direction="row">
                                    <TextField.Input
                                      value={chatData.inviteCode}
                                    />
                                    <IconButton
                                      onClick={() =>
                                        copyToClipboard(chatData.inviteCode)
                                      }
                                    >
                                      <svg
                                        width="20"
                                        height="20"
                                        viewBox="0 0 15 15"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                      >
                                        <path
                                          d="M1 9.50006C1 10.3285 1.67157 11.0001 2.5 11.0001H4L4 10.0001H2.5C2.22386 10.0001 2 9.7762 2 9.50006L2 2.50006C2 2.22392 2.22386 2.00006 2.5 2.00006L9.5 2.00006C9.77614 2.00006 10 2.22392 10 2.50006V4.00002H5.5C4.67158 4.00002 4 4.67159 4 5.50002V12.5C4 13.3284 4.67158 14 5.5 14H12.5C13.3284 14 14 13.3284 14 12.5V5.50002C14 4.67159 13.3284 4.00002 12.5 4.00002H11V2.50006C11 1.67163 10.3284 1.00006 9.5 1.00006H2.5C1.67157 1.00006 1 1.67163 1 2.50006V9.50006ZM5 5.50002C5 5.22388 5.22386 5.00002 5.5 5.00002H12.5C12.7761 5.00002 13 5.22388 13 5.50002V12.5C13 12.7762 12.7761 13 12.5 13H5.5C5.22386 13 5 12.7762 5 12.5V5.50002Z"
                                          fill="currentColor"
                                          fill-rule="evenodd"
                                          clip-rule="evenodd"
                                        ></path>
                                      </svg>
                                    </IconButton>
                                  </Flex>
                                  <Flex direction="row">
                                    <Text>
                                      {" "}
                                      update the server's invite code
                                    </Text>
                                    <IconButton
                                      onClick={() => updateInviteCode()}
                                    >
                                      <svg
                                        width="15"
                                        height="15"
                                        viewBox="0 0 15 15"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                      >
                                        <path
                                          d="M1.90321 7.29677C1.90321 10.341 4.11041 12.4147 6.58893 12.8439C6.87255 12.893 7.06266 13.1627 7.01355 13.4464C6.96444 13.73 6.69471 13.9201 6.41109 13.871C3.49942 13.3668 0.86084 10.9127 0.86084 7.29677C0.860839 5.76009 1.55996 4.55245 2.37639 3.63377C2.96124 2.97568 3.63034 2.44135 4.16846 2.03202L2.53205 2.03202C2.25591 2.03202 2.03205 1.80816 2.03205 1.53202C2.03205 1.25588 2.25591 1.03202 2.53205 1.03202L5.53205 1.03202C5.80819 1.03202 6.03205 1.25588 6.03205 1.53202L6.03205 4.53202C6.03205 4.80816 5.80819 5.03202 5.53205 5.03202C5.25591 5.03202 5.03205 4.80816 5.03205 4.53202L5.03205 2.68645L5.03054 2.68759L5.03045 2.68766L5.03044 2.68767L5.03043 2.68767C4.45896 3.11868 3.76059 3.64538 3.15554 4.3262C2.44102 5.13021 1.90321 6.10154 1.90321 7.29677ZM13.0109 7.70321C13.0109 4.69115 10.8505 2.6296 8.40384 2.17029C8.12093 2.11718 7.93465 1.84479 7.98776 1.56188C8.04087 1.27898 8.31326 1.0927 8.59616 1.14581C11.4704 1.68541 14.0532 4.12605 14.0532 7.70321C14.0532 9.23988 13.3541 10.4475 12.5377 11.3662C11.9528 12.0243 11.2837 12.5586 10.7456 12.968L12.3821 12.968C12.6582 12.968 12.8821 13.1918 12.8821 13.468C12.8821 13.7441 12.6582 13.968 12.3821 13.968L9.38205 13.968C9.10591 13.968 8.88205 13.7441 8.88205 13.468L8.88205 10.468C8.88205 10.1918 9.10591 9.96796 9.38205 9.96796C9.65819 9.96796 9.88205 10.1918 9.88205 10.468L9.88205 12.3135L9.88362 12.3123C10.4551 11.8813 11.1535 11.3546 11.7585 10.6738C12.4731 9.86976 13.0109 8.89844 13.0109 7.70321Z"
                                          fill="currentColor"
                                          fill-rule="evenodd"
                                          clip-rule="evenodd"
                                        ></path>
                                      </svg>
                                    </IconButton>
                                  </Flex>
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
                            <AlertDialog.Root>
                              <AlertDialog.Trigger>
                                Delete server
                              </AlertDialog.Trigger>
                              <AlertDialog.Content style={{ maxWidth: 450 }}>
                                <AlertDialog.Title>
                                  Revoke access
                                </AlertDialog.Title>
                                <AlertDialog.Description size="2">
                                  Are you sure? This application will no longer
                                  be accessible and any existing sessions will
                                  be expired.
                                </AlertDialog.Description>

                                <Flex gap="3" mt="4" justify="end">
                                  <AlertDialog.Cancel>
                                    <Button variant="soft" color="gray">
                                      Cancel
                                    </Button>
                                  </AlertDialog.Cancel>
                                  <AlertDialog.Action>
                                    <Button variant="solid" color="red">
                                      Revoke access
                                    </Button>
                                  </AlertDialog.Action>
                                </Flex>
                              </AlertDialog.Content>
                            </AlertDialog.Root>
                          </DropdownMenu.Item>
                        </DropdownMenu.Content>
                      </DropdownMenu.Root>
                    )}
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
