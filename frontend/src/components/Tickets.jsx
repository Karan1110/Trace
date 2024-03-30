import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Button,
  Table,
  IconButton,
  Select,
  Badge,
  TextField,
  Box,
  Flex,
  Text,
  Popover,
  Heading,
} from "@radix-ui/themes";
import { ArrowUpIcon, MagnifyingGlassIcon } from "@radix-ui/react-icons";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const Tickets = () => {
  const [tickets, setTickets] = useState([]);
  const [searchedTickets, setSearchedTickets] = useState([]);
  const [filter, setFilter] = useState("open"); // Default filter is empty
  const [sortingProperty, setSortingProperty] = useState("name"); // Default sorting property is 'name'
  const navigate = useNavigate();
  // Fetch tickets based on filter and sortingProperty
  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const response = await axios.get(
          `http://localhost:1111/tickets/${filter}`,
          {
            params: {
              sortingProperty: sortingProperty,
            },
            headers: { "x-auth-token": localStorage.getItem("token") },
          }
        );
        setTickets(response.data);
        console.log(response.data);
      } catch (error) {
        console.error("Error fetching tickets:", error);
      }
    };

    fetchTickets();
  }, [filter, sortingProperty]);

  const handleFilterChange = (value) => {
    console.log(value);
    setFilter(value);
  };

  const fetchSearchedTickets = async (query) => {
    try {
      const response = await axios.get("http://localhost:1111/tickets/search", {
        params: {
          ticket: query,
        },
        headers: { "x-auth-token": localStorage.getItem("token") },
      });

      console.log(response.data);
      setSearchedTickets(response.data);
    } catch (error) {
      toast(error.message);
      console.error(error);
    }
  };
  const handleSortingPropertyChange = (property) => {
    setSortingProperty(property);
  };

  return (
    <div className="container   mx-auto p-6">
      <div className="mx-auto  w-[1000px]">
        <div className="mx-auto my-10 w-64 flex flex-row space-x-3">
          <Heading> </Heading>
          <TextField.Root>
            <TextField.Input
              placeholder="Search Tickets "
              color="purple"
              size="2"
              onChange={(e) => fetchSearchedTickets(e.target.value)}
            />
          </TextField.Root>

          <Popover.Root>
            <Popover.Trigger>
              <IconButton variant="soft">
                <MagnifyingGlassIcon width="18" height="18" />
              </IconButton>
            </Popover.Trigger>
            <Popover.Content style={{ width: 150 }}>
              <Popover.Close>
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 15 15"
                  fill="none"
                  className=" absolute right-2 top-1"
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
              <Flex
                gap="3"
                direction="column"
                mt="2"
                justify="center"
                align="center"
              >
                {searchedTickets &&
                  searchedTickets.map((user) => (
                    <React.Fragment
                      key={user.id}
                      className="flex w-full flex-row p-5"
                    >
                      <Box grow="1">
                        <Flex gap="3" mt="1" justify="between">
                          <Flex
                            align="center"
                            gap="2"
                            className="border-b "
                            asChild
                            style={{ width: 130 }}
                          >
                            <Text as="label" size="2">
                              {user.name}
                            </Text>
                          </Flex>
                        </Flex>
                      </Box>
                    </React.Fragment>
                  ))}
              </Flex>

              {!searchedTickets && <Spinner />}
            </Popover.Content>
          </Popover.Root>
        </div>
        <div className="  mb-7">
          <Select.Root
            defaultValue="open"
            size="2"
            value={filter}
            onValueChange={(value) => handleFilterChange(value)}
          >
            <Select.Trigger />
            <Select.Content color="purple">
              <Select.Group>
                <Select.Label>Filters</Select.Label>
                <Select.Item value="all">All</Select.Item>
                <Select.Item value="open">open</Select.Item>
                <Select.Item value="closed">closed</Select.Item>
                <Select.Item value="in_progress">in_progress</Select.Item>
              </Select.Group>
            </Select.Content>
          </Select.Root>
          <Button
            variant="solid"
            color="purple"
            className="absolute right-80"
            onClick={() => navigate("/new")}
          >
            New Ticket
          </Button>
        </div>
        <Table.Root variant="surface">
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeaderCell>
                <button
                  className={`text-gray-700 py-1 px-3 flex flex-row cursor-pointer space-x-1 hover:cursor-pointer focus:outline-none`}
                  onClick={() => handleSortingPropertyChange("name")}
                >
                  Name {sortingProperty === "name" ? <ArrowUpIcon /> : ""}
                </button>
              </Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>
                <span
                  className={`text-gray-700 py-1 px-3 flex flex-row space-x-1 hover:cursor-pointer focus:outline-none`}
                  onClick={() => handleSortingPropertyChange("createdAt")}
                >
                  <span>Created At </span>
                  {sortingProperty === "createdAt" && (
                    <span>
                      <ArrowUpIcon />
                    </span>
                  )}
                </span>
              </Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>
                <button
                  className={`text-gray-700 py-1 px-3 flex flex-row space-x-1 hover:cursor-pointer focus:outline-none`}
                  onClick={() => handleSortingPropertyChange("status")}
                >
                  Status {sortingProperty === "status" ? <ArrowUpIcon /> : ""}
                </button>
              </Table.ColumnHeaderCell>
            </Table.Row>
          </Table.Header>

          <Table.Body>
            {tickets.map((ticket) => (
              <Table.Row key={ticket.id}>
                <Table.RowHeaderCell>{ticket.name}</Table.RowHeaderCell>
                <Table.Cell>{ticket.createdAt}</Table.Cell>
                <Table.Cell>
                  <Badge color="red">{ticket.status}</Badge>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      </div>
    </div>
  );
};

export default Tickets;
