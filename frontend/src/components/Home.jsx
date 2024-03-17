import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Chart,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  Title,
  CategoryScale,
  BarController,
  BarElement,
} from "chart.js";
import Typewriter from "./Typewriter";
import MacbookScroll from "../ui/macbook-scroll";
Chart.register(
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  Title,
  CategoryScale,
  BarController,
  BarElement
);
import { Bar } from "react-chartjs-2";
import {
  Table,
  Badge,
  Avatar,
  Text,
  Tabs,
  Card,
  Box,
  ScrollArea,
  Flex,
  Heading,
} from "@radix-ui/themes";
import { Link } from "react-router-dom";

const Home = () => {
  const [ticketCounts, setTicketsCount] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [feed, setFeed] = useState([]);
  const [followFeed, setFollowFeed] = useState([]);
  const [pendingTickets, setPendingTickets] = useState([]);
  const [departmentTickets, setDepartmentTickets] = useState([]);
  const [avgTime, setAvgTime] = useState("");

  useEffect(() => {
    const fetchTicketCounts = async () => {
      try {
        const response0 = await axios.get("http://localhost:1111/users/stats");
        setAvgTime(response0.data.average_time_taken);
        console.log(response0.data);
        const response = await axios.get("http://localhost:1111/tickets");
        setTicketsCount(response.data);
        const response2 = await axios.get(
          "http://localhost:1111/tickets/latest",
          {
            headers: {
              "x-auth-token": localStorage.getItem("token"),
            },
          }
        );
        setTickets(response2.data);
        const response3 = await axios.get(
          "http://localhost:1111/tickets/feed",
          {
            headers: {
              "x-auth-token": localStorage.getItem("token"),
            },
          }
        );

        setFeed(response3.data);
        const response4 = await axios.get(
          "http://localhost:1111/tickets/pending",
          {
            headers: {
              "x-auth-token": localStorage.getItem("token"),
            },
          }
        );
        console.log(response4);
        setPendingTickets(response4.data);
        const response5 = await axios.get(
          "http://localhost:1111/tickets/departments",
          {
            headers: {
              "x-auth-token": localStorage.getItem("token"),
            },
          }
        );
        setDepartmentTickets(response5.data);
        console.log(response5.data);

        const response6 = await axios.get(
          "http://localhost:1111/tickets/followingFeed",
          {
            headers: {
              "x-auth-token": localStorage.getItem("token"),
            },
          }
        );
        setFollowFeed(response6.data);
      } catch (error) {
        console.error("Error fetching ticket counts:", error);
        return [];
      }
    };
    fetchTicketCounts();
  }, []);
  const options = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: "Dashboard",
        font: {
          size: 25, // Set the font size here
        },
      },
    },
  };
  return (
    <>
      <div className="flex flex-row ml-[50px] mr-[40px] ">
        <div className="w-1/2 h-[450px]  ">
          <div className="my-7">
            <Heading>
              The average time taken to complete a ticket is{" "}
              {avgTime && avgTime.toString()}
            </Heading>
          </div>

          <div className="grid grid-cols-3  my-5  ">
            <span className="text-gray-900 font-medium  ">Closed Issues</span>
            <span className="text-gray-900 font-medium ">Open Issues</span>
            <span className="text-gray-900 font-medium ">
              In-progress Issues
            </span>
          </div>
          <div className="grid grid-cols-3  mb-5 space-x-3 ">
            <span className=" font-medium text-2xl textce-center text-gray-900">
              {" "}
              {ticketCounts[0]}{" "}
            </span>
            <span className="text-gray-900 text-2xl  font-medium ">
              {ticketCounts[1]}
            </span>
            <span className="text-gray-900 font-medium text-2xl  ">
              {ticketCounts[2]}
            </span>
          </div>
          <Bar
            datasetIdKey="id"
            options={options}
            className=""
            data={{
              labels: ["Open", "Closed", "In-progress"],
              datasets: [
                {
                  label: "Open", // Make sure the label matches the labels array
                  data: ticketCounts,
                  backgroundColor: "rgba(191, 128, 255, 0.5)",
                  borderWidth: 2,
                  barThickness: 70,
                },
              ],
            }}
          />
        </div>

        <div className=" absolute my-5 right-20 max-w-md p-4 bg-white sm:p-8 dark:bg-gray-800 ">
          <div className="flow-root w-[450px] rounded-md relative top-0 right-10 p-5 border-2 h-auto ">
            <ScrollArea>
              <h5 className="text-xl font-bold  mb-5 leading-none text-gray-900 dark:text-white">
                Latest Issues
              </h5>
              <Table.Root className="w-[400px]">
                <Table.Body size="3">
                  {tickets &&
                    tickets.map((ticket) => (
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
            </ScrollArea>
          </div>
        </div>
      </div>
      <div className="mt-40">
        <Tabs.Root defaultValue="account">
          <Tabs.List>
            <Tabs.Trigger value="account">Feed</Tabs.Trigger>
            <Tabs.Trigger value="documents">Pending</Tabs.Trigger>
            <Tabs.Trigger value="settings">Department</Tabs.Trigger>
            <Tabs.Trigger value="following">Following</Tabs.Trigger>
          </Tabs.List>

          <Box px="4" pt="3" pb="2">
            <Tabs.Content value="account">
              <div className="flex flex-col justify-center items-center max-w-xl">
                {feed.map((ticket) => (
                  <TicketCard ticket={ticket} />
                ))}
              </div>
            </Tabs.Content>

            <Tabs.Content value="documents">
              {pendingTickets.map((ticket) => (
                <TicketCard ticket={ticket} />
              ))}
            </Tabs.Content>

            <Tabs.Content value="settings">
              {departmentTickets &&
                departmentTickets.length > 0 &&
                departmentTickets.map((ticket) => (
                  <TicketCard ticket={ticket} />
                ))}
            </Tabs.Content>
            <Tabs.Content value="following">
              {departmentTickets &&
                followFeed.length > 0 &&
                followFeed.map((ticket) => <TicketCard ticket={ticket} />)}
            </Tabs.Content>
          </Box>
        </Tabs.Root>
      </div>
    </>
  );
};

export default Home;
