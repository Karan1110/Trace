import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { TextField } from "@radix-ui/themes";
import { useNavigate, useParams } from "react-router-dom";
import MeetingCard from "./MeetingCard";

const Department = () => {
  const { id } = useParams();
  const [name, setName] = useState("");
  const token = localStorage.getItem("token");
  const [department, setDepartment] = useState(null);
  const [followersInCommon, setFollowersInCommon] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDepartment = async () => {
      try {
        const resp = await axios.get(
          `http://localhost:1111/departments/${id}`,
          {
            "x-auth-token": token,
          }
        );
        if (!resp.data.department) {
          toast.error("department not found...");
          setTimeout(() => {
            navigate("/");
          }, 2000);
        }
        setDepartment(resp.data.department);
        setFollowersInCommon(res.data.followersInCommon);
      } catch (error) {
        console.error(error.message, error);
        toast.error("somethign failed...");
      }
    };
    fetchDepartment();
  }, []);
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const videoFile = document.getElementById("image").files[0];
      const formData = new FormData();
      formData.append("profile_pic", videoFile);
      formData.append("name", name);

      const response = await axios.post(
        "http://localhost:1111/departments",
        formData,
        {
          headers: {
            "x-auth-token": localStorage.getItem("token"),
          },
        }
      );

      console.log("Department created:", response.data);
      toast.success("created the department!");
      // Reset the form after successful submission
      setName("");
    } catch (error) {
      toast(error.message);
      console.error("Error creating department:", error);
    }
  };

  return (
    <>
      <Dialog.Root>
        <Dialog.Trigger>
          <Button>New</Button>
        </Dialog.Trigger>

        <Dialog.Content style={{ maxWidth: 450 }}>
          <Dialog.Title>Edit profile</Dialog.Title>
          <Dialog.Description size="2" mb="4">
            You can create a new department for your team!
          </Dialog.Description>

          <Flex direction="column" gap="3">
            <form
              onSubmit={handleSubmit}
              className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4"
            >
              <div className="mb-4">
                <label
                  className="block text-gray-700 text-sm font-bold mb-2"
                  htmlFor="name"
                >
                  Department Name
                </label>
                <TextField.Input
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  id="name"
                  type="text"
                  placeholder="Enter department name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="mb-4">
                <input
                  type="file"
                  className="block w-full border border-gray-200 shadow-sm rounded-lg text-sm focus:z-10 focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none dark:bg-slate-900 dark:border-gray-700 dark:text-gray-400 dark:focus:outline-none dark:focus:ring-1 dark:focus:ring-gray-600
          file:bg-gray-50 file:border-0
          file:bg-gray-100 file:me-4
          file:py-3 file:px-4
          dark:file:bg-gray-700 dark:file:text-gray-400"
                  id="image"
                />
              </div>
              <div className="flex items-center justify-between">
                <button
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                  type="submit"
                >
                  Create Department
                </button>
              </div>
            </form>
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
      <div className=" absolute top-0 text-center">
        <AspectRatio ratio={16 / 8}>
          <img
            src={department.url}
            alt="A house in a forest"
            style={{
              objectFit: "cover",
              width: "100%",
              height: "25%",
              borderRadius: "var(--radius-2)",
            }}
          />
        </AspectRatio>
        <Heading>{department.name}</Heading>
      </div>
      <Tabs.Root defaultValue="account">
        <Tabs.List>
          <Tabs.Trigger value="tickets">Tickets</Tabs.Trigger>
          <Tabs.Trigger value="in-common">In-common</Tabs.Trigger>
          <Tabs.Trigger value="users">Users</Tabs.Trigger>
          <Tabs.Trigger value="meetings">Meetings</Tabs.Trigger>
        </Tabs.List>

        <Box px="4" pt="3" pb="2">
          <Tabs.Content value="tickets">
            <div className="flow-root w-[600px] rounded-md relative top-0 right-60 p-5 border-2  ml-80 h-auto ">
              <h5 className="text-xl font-bold  mb-5 leading-none text-gray-900 dark:text-white">
                Department Tickets
              </h5>
              <Table.Root className="w-[550px]">
                <Table.Body size="3">
                  {department &&
                    department.tickets.map((ticket) => (
                      <Table.Row key={ticket.id}>
                        <Table.RowHeaderCell>
                          <div className="flex flex-col  space-y-4">
                            <Link to={`/tickets/${ticket.id}`}>
                              <Text size="3" weight="regular">
                                {ticket.name || "title"}
                              </Text>
                            </Link>
                            <Badge size="1" color="red" className="w-[50px]">
                              {ticket.status}
                            </Badge>
                          </div>
                        </Table.RowHeaderCell>
                        <Table.Cell />
                        <Table.Cell justify="end">
                          <Avatar fallback="A" size="2" />
                        </Table.Cell>
                      </Table.Row>
                    ))}
                </Table.Body>
              </Table.Root>
            </div>
          </Tabs.Content>
          <Heading> Followers in common</Heading>
          <Tabs.Content value="in-common">
            {followersInCommon && followersInCommon.length > 0 ? (
              followersInCommon.map((user) => (
                <Card style={{ maxWidth: 240 }}>
                  <Flex gap="3" align="center">
                    <Avatar size="3" fallback="T" />
                    <Box>
                      <Text as="div" size="2" weight="bold">
                        {user.name}
                      </Text>
                      <Text as="div" size="2" color="gray">
                        {user.email}
                      </Text>
                    </Box>
                  </Flex>
                </Card>
              ))
            ) : (
              <Text>No colleagues, make some man!</Text>
            )}
          </Tabs.Content>

          <Tabs.Content value="users">
            <div className="flow-root w-[600px] rounded-md relative top-0 right-60 p-5 border-2  ml-80 h-auto ">
              <h5 className="text-xl font-bold  mb-5 leading-none text-gray-900 dark:text-white">
                Department Users
              </h5>
              <Table.Root className="w-[550px]">
                <Table.Body size="3">
                  {department &&
                    department.users.length > 0 &&
                    department.users.map((ticket) => (
                      <Table.Row key={ticket.id}>
                        <Table.RowHeaderCell>
                          <div className="flex flex-col  space-y-4">
                            <Link to={`/tickets/${ticket.id}`}>
                              <Text size="3" weight="regular">
                                {ticket.name || "title"}
                              </Text>
                            </Link>
                            <Badge size="1" color="red" className="w-[50px]">
                              {ticket.status}
                            </Badge>
                          </div>
                        </Table.RowHeaderCell>
                        <Table.Cell />
                        <Table.Cell justify="end">
                          <Avatar fallback="A" size="2" />
                        </Table.Cell>
                      </Table.Row>
                    ))}
                </Table.Body>
              </Table.Root>
            </div>
          </Tabs.Content>
          <Tabs.Content value="meetings">
            <div className="flow-root w-[600px] rounded-md relative top-0 right-60 p-5 border-2  ml-80 h-auto ">
              <h5 className="text-xl font-bold  mb-5 leading-none text-gray-900 dark:text-white">
                Department Meetings
              </h5>
              <Table.Root className="w-[550px]">
                <Table.Body size="3">
                  {department &&
                    department.meetings.length > 0 &&
                    department.meetings.map((ticket) => <MeetingCard />)}
                  <MeetingCard />
                </Table.Body>
              </Table.Root>
            </div>
          </Tabs.Content>
        </Box>
      </Tabs.Root>{" "}
    </>
  );
};

export default Department;
