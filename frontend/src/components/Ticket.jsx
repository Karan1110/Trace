import React, { useState, useEffect } from "react";
import moment from "moment";
import axios from "axios";
import { Player } from "video-react";
import LinkParser from "react-link-parser";
import { useParams, Link } from "react-router-dom";
import {
  Heading,
  Text,
  AlertDialog,
  Flex,
  Button,
  Badge,
  Select,
  Popover,
  TextArea,
  Box,
  HoverCard,
  Avatar,
} from "@radix-ui/themes";
import Spinner from "./Spinner";

import {
  TrashIcon,
  CaretDownIcon,
  Pencil2Icon,
  Link1Icon,
} from "@radix-ui/react-icons";
import MarkdownEditor from "@uiw/react-markdown-editor";
import { toast } from "react-hot-toast";
import { useUser } from "../contexts/userContext";

const Ticket = () => {
  const [ticket, setTicket] = useState(null);
  const [content, setContent] = useState("");
  const [comments, setComments] = useState([]);
  const [statusLoading, setStatusLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const { id } = useParams();
  const save = async () => {
    try {
      await axios.post(
        `http://localhost:1111/tickets/save/${ticket.id}`,
        {},
        {
          headers: {
            "x-auth-token": localStorage.getItem("token"),
          },
        }
      );
      toast.success("saved!");
    } catch (ex) {
      toast(ex.message);
      console.error(ex);
    }
  };

  const user = useUser();

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        const response = await axios.get(`http://localhost:1111/tickets/${id}`);
        setTicket(response.data);
        setComments(response.data.comments);
        console.log(response.data);
      } catch (error) {
        console.error("Error fetching ticket details:", error);
      }
    };

    // Fetch list of users
    const fetchUsers = async () => {
      try {
        const response = await axios.get("http://localhost:1111/users", {
          headers: {
            "x-auth-token": localStorage.getItem("token"),
          },
        });
        setUsers(response.data);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchTicket();
    fetchUsers();
  }, []);

  const watchers = [
    {
      watchFor: "link",
      render: (url) => (
        <a
          href={url}
          className="text-blue-600 font-medium hover:scale-105"
          target="_blank"
          rel="noreferrer noopener nofollow"
        >
          {url}
        </a>
      ),
    },
  ];

  const changeStatus = async (status) => {
    try {
      setStatusLoading(true);

      setTicket({ ...ticket, status: status });
      await axios.put(
        `http://localhost:1111/tickets/changeStatus/${id}`,
        { status },
        {
          headers: {
            "x-auth-token": localStorage.getItem("token"),
          },
        }
      );

      setTimeout(() => setStatusLoading(false), 1500);
    } catch (error) {
      setStatusLoading(false);
      toast.error("something failed..");
      console.error(error.message, error);
    }
  };

  const addComment = async () => {
    await axios.post(
      "http://localhost:1111/comments",
      {
        content: content,
        ticket_id: ticket.id,
      },
      {
        headers: {
          "x-auth-token": localStorage.getItem("token"),
        },
      }
    );
    toast.success("comment sent!");
    setComments([
      ...comments,
      {
        content: content,
        ticket_id: ticket.id,
        user_id: localStorage.getItem("user_id"),
      },
    ]);
  };

  const likeComment = async (commentId, comment_user_id) => {
    try {
      console.log(user.email, user);
      await axios.post(
        `http://localhost:1111/comments/like/${commentId}`,
        {
          user_email: user.email,
          comment_user_id,
        },
        {
          headers: {
            "x-auth-token": localStorage.getItem("token"),
          },
        }
      );

      setComments((prevComments) => {
        const comment = prevComments.find((c) => c.id === commentId);
        comment.likes.push(user.email);
      });
      toast.success("comment liked");
    } catch (error) {
      console.error(error.message, error);
      toast.error("error while liking the comment", error.message);
    }
  };

  const dislikeComment = async (commentId) => {
    try {
      await axios.put(
        `http://localhost:1111/comments/dislike/${commentId}`,
        {
          like: user.email,
        },
        {
          headers: {
            "x-auth-token": localStorage.getItem("token"),
          },
        }
      );

      const comment = comments.find((c) => c.id === commentId);
      const newComments = comment.likes.filter((c) => c.like === user.email);
      setComments(newComments);

      toast.success("comment disliked");
    } catch (error) {
      toast.error("error while disliking the comment");
    }
  };

  async function close() {
    try {
      // Make a PUT request to the API endpoint
      const response = await axios.put(
        `http://localhost:1111/tickets/close/${id}`,
        null,
        {
          headers: {
            "x-auth-token": localStorage.getItem("token"), // Include your authentication token if needed
          },
        }
      );

      // Check the response status and handle accordingly
      if (response.status === 200) {
        toast.success("closed!");
      } else {
        toast.error("something failed...");
      }
    } catch (error) {
      // Handle any errors that occur during the request
      console.error("Error in API call:", error.message, error.response?.data);
    }
  }

  const handleAssign = async (userId) => {
    try {
      await axios.put(
        `http://localhost:1111/tickets/assign/${id}`,
        {
          user_id: userId,
        },
        {
          headers: {
            "x-auth-token": localStorage.getItem("token"),
          },
        }
      );

      toast.success("Ticket assigned successfully!");
    } catch (error) {
      toast("something failed.");
      console.log(error.message, error);
    }
  };

  return (
    <>
      <div className="max-w-4xl  flex flex-row my-10 mt-[40px] mx-[250px] w-[1000px]">
        {ticket && (
          <>
            <div>
              <Heading className="text-2xl mt-[75px] font-bold mb-4">
                {ticket.name} assigned to -{" "}
                {ticket.user.name ? (
                  <HoverCard.Root>
                    <HoverCard.Trigger>
                      <Link
                        href="https://twitter.com/radix_ui"
                        target="_blank"
                        className="text-blue-600 font-medium"
                      >
                        @{ticket.user.name}
                      </Link>
                    </HoverCard.Trigger>
                    <HoverCard.Content>
                      <Flex gap="4">
                        <Avatar
                          size="3"
                          fallback="R"
                          radius="full"
                          src="https://pbs.twimg.com/profile_images/1337055608613253126/r_eiMp2H_400x400.png"
                        />
                        <Box>
                          <Heading size="3" as="h3">
                            {ticket.user.name}
                          </Heading>
                          {ticket.user.deparment && (
                            <Text as="div" size="2" color="gray">
                              @{ticket.user.department.name}
                            </Text>
                          )}
                          <Text
                            as="div"
                            size="2"
                            style={{ maxWidth: 300 }}
                            mt="3"
                          >
                            {ticket.user.email}
                          </Text>
                        </Box>
                      </Flex>
                    </HoverCard.Content>
                  </HoverCard.Root>
                ) : (
                  "nobody"
                )}
              </Heading>
              <div className="my-2  space-x-3  ">
                <Badge color={ticket.status == "closed" ? "green" : "red"}>
                  {ticket.status}
                </Badge>
                <Text weight="medium"> Fri Jan 17 2023</Text>
              </div>

              {ticket.videoUrl && (
                <Player className="w-[250px] h-[250px] mx-auto">
                  <source src={ticket.videoUrl} />
                </Player>
              )}
              <div className="border-2 p-7 w-[500px] rounded-lg mb-0 mt-5 ">
                <MarkdownEditor.Markdown
                  source={ticket.description}
                />
              </div>
            </div>
          </>
        )}

        {!ticket && <Spinner />}
        <div className="absolute right-20 w-[200px] ml-20  flex flex-col space-y-5">
          {ticket && (
            <Select.Root
              defaultValue={ticket.user_id}
              onValueChange={(value) => handleAssign(value)}
            >
              <Select.Trigger>
                <Button variant="outline">
                  <CaretDownIcon />
                </Button>
              </Select.Trigger>
              <Select.Content color="purple">
                {users.map((user) => (
                  <Select.Item value={user.id} key={user.id}>
                    {user.name}
                  </Select.Item>
                ))}
                <Select.Item value={null}>Not Assigned</Select.Item>
              </Select.Content>
            </Select.Root>
          )}
          <Button variant="solid" color="purple" onClick={() => close()}>
            Close <Pencil2Icon />
          </Button>
          {ticket &&
            ticket.status &&
            ["in_progress", "open"]
              .filter((status) => status !== ticket.status)
              .map((status) => (
                <Button
                  variant="solid"
                  onClick={() => changeStatus(status)}
                  disabled={statusLoading}
                >
                  {statusLoading
                    ? "updating..."
                    : ` mark as ${
                        status == "in_progress" ? "In Progress" : "Open"
                      }`}
                </Button>
              ))}
          <Button variant="solid" color="purple">
            Edit <Pencil2Icon />
          </Button>
          {ticket && user && (
            <Button variant="solid" color="violet" onClick={() => save()}>
              {user.saveds.some((t) => t.ticket.id == ticket.id)
                ? "unsave"
                : "save"}
              <svg
                width="15"
                height="15"
                viewBox="0 0 15 15"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M3.5 2C3.22386 2 3 2.22386 3 2.5V13.5C3 13.6818 3.09864 13.8492 3.25762 13.9373C3.41659 14.0254 3.61087 14.0203 3.765 13.924L7.5 11.5896L11.235 13.924C11.3891 14.0203 11.5834 14.0254 11.7424 13.9373C11.9014 13.8492 12 13.6818 12 13.5V2.5C12 2.22386 11.7761 2 11.5 2H3.5Z"
                  fill="currentColor"
                  fill-rule="evenodd"
                  clip-rule="evenodd"
                ></path>
              </svg>
            </Button>
          )}
          <AlertDialog.Root>
            <AlertDialog.Trigger>
              <Button variant="solid" color="red">
                Delete <TrashIcon />
              </Button>
            </AlertDialog.Trigger>
            <AlertDialog.Content style={{ width: 450 }}>
              <AlertDialog.Title>Delete the ticket</AlertDialog.Title>
              <AlertDialog.Description size="2">
                This action is not reversable, kindly think twice
              </AlertDialog.Description>

              <Flex gap="3" mt="4" justify="end">
                <AlertDialog.Cancel>
                  <Button variant="soft" color="gray">
                    Cancel
                  </Button>
                </AlertDialog.Cancel>
                <AlertDialog.Action>
                  <Button variant="solid" color="red">
                    Delete
                  </Button>
                </AlertDialog.Action>
              </Flex>
            </AlertDialog.Content>
          </AlertDialog.Root>
          {ticket && ticket.meeting_link && (
            <div className="flex">
              <Text
                size="2"
                className="text-blue-600 hover:scale-105 hover:underline font-medium  flex"
              >
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 15 15"
                  fill="none"
                  className="mt-1 mr-1"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M8.51194 3.00541C9.18829 2.54594 10.0435 2.53694 10.6788 2.95419C10.8231 3.04893 10.9771 3.1993 11.389 3.61119C11.8009 4.02307 11.9513 4.17714 12.046 4.32141C12.4633 4.95675 12.4543 5.81192 11.9948 6.48827C11.8899 6.64264 11.7276 6.80811 11.3006 7.23511L10.6819 7.85383C10.4867 8.04909 10.4867 8.36567 10.6819 8.56093C10.8772 8.7562 11.1938 8.7562 11.389 8.56093L12.0077 7.94221L12.0507 7.89929C12.4203 7.52976 12.6568 7.2933 12.822 7.0502C13.4972 6.05623 13.5321 4.76252 12.8819 3.77248C12.7233 3.53102 12.4922 3.30001 12.1408 2.94871L12.0961 2.90408L12.0515 2.85942C11.7002 2.508 11.4692 2.27689 11.2277 2.11832C10.2377 1.46813 8.94398 1.50299 7.95001 2.17822C7.70691 2.34336 7.47044 2.57991 7.1009 2.94955L7.058 2.99247L6.43928 3.61119C6.24401 3.80645 6.24401 4.12303 6.43928 4.31829C6.63454 4.51355 6.95112 4.51355 7.14638 4.31829L7.7651 3.69957C8.1921 3.27257 8.35757 3.11027 8.51194 3.00541ZM4.31796 7.14672C4.51322 6.95146 4.51322 6.63487 4.31796 6.43961C4.12269 6.24435 3.80611 6.24435 3.61085 6.43961L2.99213 7.05833L2.94922 7.10124C2.57957 7.47077 2.34303 7.70724 2.17788 7.95035C1.50265 8.94432 1.4678 10.238 2.11799 11.2281C2.27656 11.4695 2.50766 11.7005 2.8591 12.0518L2.90374 12.0965L2.94837 12.1411C3.29967 12.4925 3.53068 12.7237 3.77214 12.8822C4.76219 13.5324 6.05589 13.4976 7.04986 12.8223C7.29296 12.6572 7.52943 12.4206 7.89896 12.051L7.89897 12.051L7.94188 12.0081L8.5606 11.3894C8.75586 11.1941 8.75586 10.8775 8.5606 10.6823C8.36533 10.487 8.04875 10.487 7.85349 10.6823L7.23477 11.301C6.80777 11.728 6.6423 11.8903 6.48794 11.9951C5.81158 12.4546 4.95642 12.4636 4.32107 12.0464C4.17681 11.9516 4.02274 11.8012 3.61085 11.3894C3.19896 10.9775 3.0486 10.8234 2.95385 10.6791C2.53661 10.0438 2.54561 9.18863 3.00507 8.51227C3.10993 8.35791 3.27224 8.19244 3.69924 7.76544L4.31796 7.14672ZM9.62172 6.08558C9.81698 5.89032 9.81698 5.57373 9.62172 5.37847C9.42646 5.18321 9.10988 5.18321 8.91461 5.37847L5.37908 8.91401C5.18382 9.10927 5.18382 9.42585 5.37908 9.62111C5.57434 9.81637 5.89092 9.81637 6.08619 9.62111L9.62172 6.08558Z"
                    fill="currentColor"
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                  ></path>
                </svg>
                <Link to={`/meet/${ticket.meeting_link}`}>
                  {" "}
                  {"  "} ask for a meet
                </Link>
              </Text>
            </div>
          )}
          {ticket && ticket.beforeTicket && (
            <Text>
              Should be completed after this
              <HoverCard.Root>
                <HoverCard.Trigger>
                  <Link
                    href={`https://localhost:5173/tickets/${ticket.id}`}
                    target="_blank"
                    className="text-blue-600 font-medium"
                  >
                    {" "}
                    @ticket
                  </Link>
                </HoverCard.Trigger>
                <HoverCard.Content>
                  <Flex gap="4">
                    <Avatar
                      size="3"
                      fallback="R"
                      radius="full"
                      src={
                        ticket.beforeTicket.imageUrl
                          ? ticket.beforeTicket.imageUrl
                          : "https://pbs.twimg.com/profile_images/1337055608613253126/r_eiMp2H_400x400.png"
                      }
                    />
                    <Box>
                      <Heading size="3" as="h3">
                        {ticket.beforeTicket.name}
                      </Heading>
                      <Text as="div" size="2" color="gray">
                        @
                        {(ticket.beforeTicket &&
                          ticket.beforeTicket.user.name) ||
                          "not-assigned"}
                      </Text>

                      <Text as="div" size="2" mt="3">
                        {ticket.beforeTicket.description}
                      </Text>
                    </Box>
                  </Flex>
                </HoverCard.Content>
              </HoverCard.Root>{" "}
              for updates.
            </Text>
          )}
          <Text>The tickets to be completed after this :</Text>
          {ticket &&
            ticket.afterTickets &&
            ticket.afterTickets.length > 0 &&
            ticket.afterTickets.map((t) => (
              <Text>
                <HoverCard.Root>
                  <HoverCard.Trigger>
                    <Link
                      href={`https://localhost:5173/tickets/${t.id}`}
                      target="_blank"
                      className="text-blue-600 font-medium"
                    >
                      @{t.name}
                    </Link>
                  </HoverCard.Trigger>
                  <HoverCard.Content>
                    <Flex gap="4">
                      <Avatar
                        size="3"
                        fallback="R"
                        radius="full"
                        src={
                          t.imageUrl
                            ? t.imageUrl
                            : "https://pbs.twimg.com/profile_images/1337055608613253126/r_eiMp2H_400x400.png"
                        }
                      />
                      <Box>
                        <Heading size="3" as="h3">
                          {t.name}
                        </Heading>
                        <Text as="div" size="2" color="gray">
                          @{t.user.name || "not-assigned"}
                        </Text>

                        <Text as="div" size="2" mt="3">
                          {t.description}
                        </Text>
                      </Box>
                    </Flex>
                  </HoverCard.Content>
                </HoverCard.Root>{" "}
                for updates.
              </Text>
            ))}
        </div>
      </div>
      <div className="max-w-xl  flex flex-col my-10 mt-[40px] mx-[250px] ">
        <Heading my="3" className="ml-10">
          {" "}
          Comments
        </Heading>
        <Flex direction="column">
          {comments.length > 0 &&
            comments.map((comment) => {
              const timeAgo = moment(comment.createdAt).fromNow();
              return (
                <LinkParser watchers={watchers}>
                  <div className="max-w-xl p-3  flex items-center border-b   my-2 rounded-md">
                    <Avatar fallback="A" size="2" m="2" />
                    <Text as="p" size="3" mx="3">
                      {comment.content || "empty comment"}
                    </Text>

                    {user &&
                    user.email &&
                    comment.likes.includes(user.email) ? (
                      <svg
                        width="15"
                        height="15"
                        viewBox="0 0 15 15"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        onClick={() => dislikeComment(comment.id)}
                        className="text-pink-900"
                      >
                        <path
                          d="M4.89346 2.35248C3.49195 2.35248 2.35248 3.49359 2.35248 4.90532C2.35248 6.38164 3.20954 7.9168 4.37255 9.33522C5.39396 10.581 6.59464 11.6702 7.50002 12.4778C8.4054 11.6702 9.60608 10.581 10.6275 9.33522C11.7905 7.9168 12.6476 6.38164 12.6476 4.90532C12.6476 3.49359 11.5081 2.35248 10.1066 2.35248C9.27059 2.35248 8.81894 2.64323 8.5397 2.95843C8.27877 3.25295 8.14623 3.58566 8.02501 3.88993C8.00391 3.9429 7.98315 3.99501 7.96211 4.04591C7.88482 4.23294 7.7024 4.35494 7.50002 4.35494C7.29765 4.35494 7.11523 4.23295 7.03793 4.04592C7.01689 3.99501 6.99612 3.94289 6.97502 3.8899C6.8538 3.58564 6.72126 3.25294 6.46034 2.95843C6.18109 2.64323 5.72945 2.35248 4.89346 2.35248ZM1.35248 4.90532C1.35248 2.94498 2.936 1.35248 4.89346 1.35248C6.0084 1.35248 6.73504 1.76049 7.20884 2.2953C7.32062 2.42147 7.41686 2.55382 7.50002 2.68545C7.58318 2.55382 7.67941 2.42147 7.79119 2.2953C8.265 1.76049 8.99164 1.35248 10.1066 1.35248C12.064 1.35248 13.6476 2.94498 13.6476 4.90532C13.6476 6.74041 12.6013 8.50508 11.4008 9.96927C10.2636 11.3562 8.92194 12.5508 8.00601 13.3664C7.94645 13.4194 7.88869 13.4709 7.83291 13.5206C7.64324 13.6899 7.3568 13.6899 7.16713 13.5206C7.11135 13.4709 7.05359 13.4194 6.99403 13.3664C6.0781 12.5508 4.73641 11.3562 3.59926 9.96927C2.39872 8.50508 1.35248 6.74041 1.35248 4.90532Z"
                          fill="currentColor"
                          fill-rule="evenodd"
                          clip-rule="evenodd"
                        ></path>
                      </svg>
                    ) : (
                      <svg
                        width="15"
                        height="15"
                        className="text-white border-2"
                        viewBox="0 0 15 15"
                        onClick={() => likeComment(comment.id, comment.user_id)}
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M1.35248 4.90532C1.35248 2.94498 2.936 1.35248 4.89346 1.35248C6.25769 1.35248 6.86058 1.92336 7.50002 2.93545C8.13946 1.92336 8.74235 1.35248 10.1066 1.35248C12.064 1.35248 13.6476 2.94498 13.6476 4.90532C13.6476 6.74041 12.6013 8.50508 11.4008 9.96927C10.2636 11.3562 8.92194 12.5508 8.00601 13.3664C7.94645 13.4194 7.88869 13.4709 7.83291 13.5206C7.64324 13.6899 7.3568 13.6899 7.16713 13.5206C7.11135 13.4709 7.05359 13.4194 6.99403 13.3664C6.0781 12.5508 4.73641 11.3562 3.59926 9.96927C2.39872 8.50508 1.35248 6.74041 1.35248 4.90532Z"
                          fill="currentColor"
                          fill-rule="evenodd"
                          clip-rule="evenodd"
                        ></path>
                      </svg>
                    )}
                    {comment.likes.length.toString()}
                    <Badge mx="5" className="absolute right-[700px]">
                      {timeAgo}
                    </Badge>
                  </div>
                </LinkParser>
              );
            })}
          {!ticket && <Spinner />}
          <Popover.Root>
            <Popover.Trigger>
              <Button variant="soft">Comment</Button>
            </Popover.Trigger>
            <Popover.Content style={{ width: 360 }}>
              <Flex gap="3">
                <Avatar size="2" fallback="A" />
                <Box grow="1">
                  <TextArea
                    placeholder="Write a comment…"
                    style={{ height: 80 }}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                  />
                  <Popover.Close>
                    <Button size="1" mt="3" onClick={() => addComment()}>
                      Comment
                    </Button>
                  </Popover.Close>
                </Box>
              </Flex>
            </Popover.Content>
          </Popover.Root>
        </Flex>
      </div>
    </>
  );
};

export default Ticket;
