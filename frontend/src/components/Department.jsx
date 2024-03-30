import React, { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast";

import {
  AspectRatio,
  Avatar,
  Badge,
  Box,
  Card,
  Flex,
  Heading,
  Tabs,
  Table,
  Text,
} from "@radix-ui/themes";

const Department = () => {
  const [department, setDepartment] = useState(null);
  const [followersInCommon, setFollowersInCommon] = useState([]);
  const { id } = useParams();
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDepartment = async () => {
      try {
        const resp = await axios.get(
          `http://localhost:1111/departments/${id}`,
          { headers: { "x-auth-token": token } }
        );
        if (!resp.data.department) {
          toast.error("Department not found...");
          setTimeout(() => {
            navigate("/");
          }, 2000);
        }
        setDepartment(resp.data.department);
        setFollowersInCommon(resp.data.followersInCommon);
      } catch (error) {
        console.error(error.message, error);
        toast.error("Something failed...");
      }
    };
    fetchDepartment();
  }, [id, navigate, token]);

  return (
    <div>
      {department && (
        <div className="absolute top-0 text-center">
          <AspectRatio ratio={16 / 8}>
            <img
              src={department.url}
              alt="Department Image"
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
      )}

      <Tabs.Root defaultValue="tickets">
        <Tabs.List>
          <Tabs.Trigger value="tickets">Tickets</Tabs.Trigger>
          <Tabs.Trigger value="in-common">In-common</Tabs.Trigger>
          <Tabs.Trigger value="users">Users</Tabs.Trigger>
          <Tabs.Trigger value="meetings">Meetings</Tabs.Trigger>
        </Tabs.List>

        <Box px="4" pt="3" pb="2">
          <Tabs.Content value="tickets">
            {/* Department Tickets */}
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
                                {ticket.name || "Title"}
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

          <Tabs.Content value="in-common">
            {/* Followers in Common */}
            {followersInCommon && followersInCommon.length > 0 ? (
              followersInCommon.map((user) => (
                <Card style={{ maxWidth: 240 }} key={user.id}>
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
            {/* Department Users */}
            <div className="flow-root w-[600px] rounded-md relative top-0 right-60 p-5 border-2  ml-80 h-auto ">
              <h5 className="text-xl font-bold  mb-5 leading-none text-gray-900 dark:text-white">
                Department Users
              </h5>
              <Table.Root className="w-[550px]">
                <Table.Body size="3">
                  {department &&
                    department.users.length > 0 &&
                    department.users.map((user) => (
                      <Table.Row key={user.id}>
                        <Table.RowHeaderCell>
                          <div className="flex flex-col  space-y-4">
                            <Link to={`/tickets/${user.id}`}>
                              <Text size="3" weight="regular">
                                {user.name || "Title"}
                              </Text>
                            </Link>
                            <Badge size="1" color="red" className="w-[50px]">
                              {user.status}
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
            {/* Department Meetings */}
            <div className="flow-root w-[600px] rounded-md relative top-0 right-60 p-5 border-2  ml-80 h-auto ">
              <h5 className="text-xl font-bold  mb-5 leading-none text-gray-900 dark:text-white">
                Department Meetings
              </h5>
              <Table.Root className="w-[550px]">
                <Table.Body size="3">
                  {department &&
                    department.meetings.length > 0 &&
                    department.meetings.map((meeting) => (
                      <MeetingCard key={meeting.id} />
                    ))}
                </Table.Body>
              </Table.Root>
            </div>
          </Tabs.Content>
        </Box>
      </Tabs.Root>
    </div>
  );
};

export default Department;
