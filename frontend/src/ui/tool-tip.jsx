import React, { useEffect, useState } from "react";
import {
  motion,
  useTransform,
  AnimatePresence,
  useMotionValue,
  useSpring,
} from "framer-motion";
import { Dialog, Button, Flex, Text, TextField } from "@radix-ui/themes";
import axios from "axios";
import { useUser } from "../contexts/userContext";

const AnimatedTooltip = ({ items, setId, ws }) => {
  let user = useUser();
  const [users, setUsers] = useState(null);
  const [userQuery, setUserQuery] = useState("");
  const [newServer, setNewServer] = useState({ name: "", type: "" });
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
      user.Chats.push({
        ...response.data.chat,
        channels: [response.data.channel],
      });
      console.log("Chat created:", response.data, user.Chats);
      setNewServer({ name: "", type: "" });
    } catch (error) {
      console.error("Error creating chat:", error);
    }
  };
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const springConfig = { stiffness: 100, damping: 5 };
  const x = useMotionValue(0);

  const rotate = useSpring(
    useTransform(x, [-100, 100], [-45, 45]),
    springConfig
  );

  const translateX = useSpring(
    useTransform(x, [-100, 100], [-50, 50]),
    springConfig
  );

  const handleMouseMove = (event) => {
    const halfWidth = event.target.offsetWidth / 2;
    x.set(event.nativeEvent.offsetX - halfWidth);
  };
  useEffect(() => {
    const resp = axios.get("http://localhost:1111/users/search", {
      params: {
        user: userQuery,
      },
    });

    setUsers(resp.data);
  }, [userQuery]);

  const openChat = async (user) => {
    const existingChat = user.Chats.find(
      (chat) => chat.type == "personal" && chat.name == `${user.name}`
    );
    if (existingChat) {
      setId(existingChat.id);
    } else {
      const resp = await axios.post(
        "http://localhost:1111/chats",
        {
          name: `${user.name} `,
          type: "personal",
          recipient_id: user.id,
        },
        {
          "x-auth-token": xAuthToken,
        }
      );
      const { chat } = resp.data;
      user.Chats.push(chat);
      setId(chat.id);
      ws.send("Hii man!!!");
    }
  };
  return (
    <>
      {items.map((item) => (
        <div
          className="-mr-4 relative group"
          key={item.name}
          onMouseEnter={() => setHoveredIndex(item.id)}
          onMouseLeave={() => setHoveredIndex(null)}
          onClick={setId(item.id)}
        >
          <AnimatePresence mode="wait">
            {hoveredIndex === item.id && (
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.6 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  scale: 1,
                  transition: {
                    type: "spring",
                    stiffness: 260,
                    damping: 10,
                  },
                }}
                exit={{ opacity: 0, y: 20, scale: 0.6 }}
                style={{
                  translateX: translateX,
                  rotate: rotate,
                  whiteSpace: "nowrap",
                }}
                className="absolute -top-16 -left-1/2 translate-x-1/2 flex text-xs flex-col items-center justify-center rounded-md bg-black z-50 shadow-xl px-4 py-2"
              >
                <div className="absolute inset-x-10 z-30 w-[20%] -bottom-px bg-gradient-to-r from-transparent via-emerald-500 to-transparent h-px" />
                <div className="absolute left-10 w-[40%] z-30 -bottom-px bg-gradient-to-r from-transparent via-sky-500 to-transparent h-px" />
                <div className="font-bold text-white relative z-30 text-base">
                  {item.name}
                </div>
                <div className="text-white text-xs">{item.designation}</div>
              </motion.div>
            )}
          </AnimatePresence>
          <img
            onMouseMove={handleMouseMove}
            height={100}
            width={100}
            src={item.image}
            alt={item.name}
            className="object-cover m-0 p-0 object-top rounded-full h-14 w-14 border-2 group-hover:scale-105 group-hover:z-30 border-white relative transition duration-500"
          />
        </div>
      ))}

      <div className="absolute bottom-5">
        <Dialog.Root>
          <Dialog.Trigger>
            <Button>New </Button>
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
      </div>
    </>
  );
};

export default AnimatedTooltip;
