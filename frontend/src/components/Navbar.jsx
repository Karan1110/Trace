import {
  Text,
  TextField,
  Popover,
  Box,
  Flex,
  Button,
  Avatar,
  Heading,
  ScrollArea,
  IconButton,
} from "@radix-ui/themes"
import { MagnifyingGlassIcon } from "@radix-ui/react-icons"
import axios from "axios"
import React, { useEffect, useState } from "react"
import { toast } from "react-hot-toast"
import { useUser } from "../contexts/userContext"

const Navbar = () => {
  const [showNotifications, setShowNotifications] = useState(false)
  const user = useUser()
  const [users, setUsers] = useState([])

  const fetchUsers = async (query) => {
    try {
      const response = await axios.get("http://localhost:1111/users/search", {
        params: {
          user: query,
        },
        headers: { "x-auth-token": localStorage.getItem("token") },
      })

      console.log(response.data)
      setUsers(response.data)
    } catch (error) {
      toast(error.message)
      console.error(error)
    }
  }

  return (
    <nav className=" border-b border-gray-200 flex-no-wrap relative flex w-full items-center justify-between  py-2 pl-60  dark:bg-neutral-600 dark:shadow-black/10 lg:flex-wrap lg:justify-start lg:py-4">
      <div className="flex w-full flex-wrap items-center justify-between px-3">
        {/* Hamburger button for mobile view */}
        <button
          className="block border-0 bg-transparent px-2 text-neutral-500 hover:no-underline hover:shadow-none focus:no-underline focus:shadow-none focus:outline-none focus:ring-0 dark:text-neutral-200 lg:hidden"
          type="button"
        >
          {/* Hamburger icon */}
          <span className="[&>svg]:w-7 h-5">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-5 w-7"
            >
              <path
                fillRule="evenodd"
                d="M3 6.75A.75.75 0 013.75 6h16.5a.75.75 0 010 1.5H3.75A.75.75 0 013 6.75zM3 12a.75.75 0 01.75-.75h16.5a.75.75 0 010 1.5H3.75A.75.75 0 013 12zm0 5.25a.75.75 0 01.75-.75h16.5a.75.75 0 010 1.5H3.75a.75.75 0 01-.75-.75z"
                clipRule="evenodd"
              />
            </svg>
          </span>
        </button>

        {/* Collapsible navigation container */}
        <div
          className="!visible hidden flex-grow basis-[100%] items-center lg:!flex lg:basis-auto"
          id="navbarSupportedContent1"
        >
          {/* Logo */}
          <div className="mb-4 ml-2 mr-5 mt-3 flex items-center text-neutral-900 hover:text-neutral-900 focus:text-neutral-900 dark:text-neutral-200 dark:hover:text-neutral-400 dark:focus:text-neutral-400 lg:mb-0 lg:mt-0">
            <a href={"/"}>
              <img
                src="../../public/logo.webp"
                style={{ height: "25px" }}
                alt="TE Logo"
                className="dark:text-white "
                loading="lazy"
              />
            </a>
          </div>
          {/* Left navigation links */}
          <div className=" flex flex-col  space-x-7 lg:flex-row">
            <a href={"/tickets"}>
              <Text weight="regular" className="cursor-pointer hover:scale-95">
                Tickets
              </Text>
            </a>
            <a href={"/meetings"}>
              <Text weight="regular" className="cursor-pointer hover:scale-95">
                Meetings
              </Text>
            </a>
            <a href={"/"}>
              <Text weight="regular" className="cursor-pointer hover:scale-95">
                Home
              </Text>
            </a>
          </div>
        </div>

        {/* Right elements */}
        <div className="relative flex mr-60 items-center">
          <div className="mr-10 flex flex-rol space-x-2">
            <TextField.Root>
              <TextField.Input
                placeholder="Search users "
                color="purple"
                size="2"
                width="75"
                onChange={(e) => fetchUsers(e.target.value)}
              />
            </TextField.Root>

            <Popover.Root>
              <Popover.Trigger>
                <IconButton variant="soft">
                  <MagnifyingGlassIcon width="18" height="18" />
                </IconButton>
              </Popover.Trigger>
              <Popover.Content style={{ width: 360 }}>
                <Popover.Close>
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 15 15"
                    fill="none"
                    className="mb-4 "
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M0.877075 7.49988C0.877075 3.84219 3.84222 0.877045 7.49991 0.877045C11.1576 0.877045 14.1227 3.84219 14.1227 7.49988C14.1227 11.1575 11.1576 14.1227 7.49991 14.1227C3.84222 14.1227 0.877075 11.1575 0.877075 7.49988ZM7.49991 1.82704C4.36689 1.82704 1.82708 4.36686 1.82708 7.49988C1.82708 10.6329 4.36689 13.1727 7.49991 13.1727C10.6329 13.1727 13.1727 10.6329 13.1727 7.49988C13.1727 4.36686 10.6329 1.82704 7.49991 1.82704ZM9.85358 5.14644C10.0488 5.3417 10.0488 5.65829 9.85358 5.85355L8.20713 7.49999L9.85358 9.14644C10.0488 9.3417 10.0488 9.65829 9.85358 9.85355C9.65832 10.0488 9.34173 10.0488 9.14647 9.85355L7.50002 8.2071L5.85358 9.85355C5.65832 10.0488 5.34173 10.0488 5.14647 9.85355C4.95121 9.65829 4.95121 9.3417 5.14647 9.14644L6.79292 7.49999L5.14647 5.85355C4.95121 5.65829 4.95121 5.3417 5.14647 5.14644C5.34173 4.95118 5.65832 4.95118 5.85358 5.14644L7.50002 6.79289L9.14647 5.14644C9.34173 4.95118 9.65832 4.95118 9.85358 5.14644Z"
                      fill="currentColor"
                      fill-rule="evenodd"
                      clip-rule="evenodd"
                    ></path>
                  </svg>
                </Popover.Close>
                <Flex gap="3">
                  {users &&
                    users.map((user) => (
                      <React.Fragment key={user.id}>
                        <Avatar size="2" fallback="A" />
                        <Box grow="1">
                          <Flex gap="3" mt="1" justify="between">
                            <Flex align="center" gap="2" asChild>
                              <Text as="label" size="2">
                                {user.name}
                              </Text>
                            </Flex>
                          </Flex>
                        </Box>
                      </React.Fragment>
                    ))}
                </Flex>
              </Popover.Content>
            </Popover.Root>
          </div>
          <div
            className="relative"
            data-te-dropdown-ref
            data-te-dropdown-alignment="end"
          >
            {/* First dropdown trigger */}

            <Popover.Root>
              <Popover.Trigger>
                <a
                  className="hidden-arrow mr-10 flex items-center text-neutral-600 transition duration-200 hover:text-neutral-700 hover:ease-in-out focus:text-neutral-700 disabled:text-black/30 motion-reduce:transition-none dark:text-neutral-200 dark:hover:text-neutral-300 dark:focus:text-neutral-300 [&.active]:text-black/90 dark:[&.active]:text-neutral-400"
                  onClick={() => {
                    setShowNotifications(!showNotifications)
                  }}
                  id="dropdownMenuButton1"
                  role="button"
                >
                  {/* Dropdown trigger icon */}
                  <span className="[&>svg]:w-5">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="h-5 w-5"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.25 9a6.75 6.75 0 0113.5 0v.75c0 2.123.8 4.057 2.118 5.52a.75.75 0 01-.297 1.206c-1.544.57-3.16.99-4.831 1.243a3.75 3.75 0 11-7.48 0 24.585 24.585 0 01-4.831-1.244.75.75 0 01-.298-1.205A8.217 8.217 0 005.25 9.75V9zm4.502 8.9a2.25 2.25 0 104.496 0 25.057 25.057 0 01-4.496 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </span>
                </a>
              </Popover.Trigger>
              <Popover.Content style={{ width: 350 }}>
                <ScrollArea
                  type="always"
                  scrollbars="vertical"
                  style={{ height: 180 }}
                >
                  <Box p="2" pr="8">
                    <Heading size="4" mb="2" trim="start">
                      Notifications
                    </Heading>
                    <hr />
                    <Flex mt="4" direction="column" gap="4">
                      {user &&
                        user.Notification &&
                        user.Notification.length > 0 &&
                        user.Notification.map((n) => (
                          <Text key={n.id} as="p">
                            {n.message}
                          </Text>
                        ))}
                    </Flex>
                  </Box>
                </ScrollArea>
              </Popover.Content>
            </Popover.Root>
          </div>
          {/* Second dropdown container */}
          <div className="relative">
            <Popover.Root>
              <Popover.Trigger>
                <div>
                  <Avatar fallback="A" size="2" className="cursor-pointer" />
                </div>
              </Popover.Trigger>
              <Popover.Content style={{ width: 250 }}>
                <Flex gap="3">
                  <Box grow="1">
                    <Flex gap="2" direction="column" justify="between">
                      {user && (
                        <>
                          <Text weight="regular" size="2">
                            {user.name}
                          </Text>
                          <Text weight="regular" size="2">
                            {user.email}
                          </Text>
                        </>
                      )}
                      <a href={`/users/${localStorage.getItem("user_id")}`}>
                        <Button size="1" className="w-full" color="purple">
                          View more
                        </Button>
                      </a>
                      <Popover.Close>
                        <Button size="1" color="purple">
                          Log out
                        </Button>
                      </Popover.Close>
                    </Flex>
                  </Box>
                </Flex>
              </Popover.Content>
            </Popover.Root>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
