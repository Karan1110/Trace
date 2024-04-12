// Leaderboard.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Tabs, Table,Box } from "@radix-ui/themes"; // Updated import for Tabs from Radix UI
import { toast } from "react-hot-toast";

const Leaderboard = () => {
  const [allTimeUsers, setAllTimeUsers] = useState([]);
  const [lastMonthUsers, setLastMonthUsers] = useState([]);
  const [lastYearUsers, setLastYearUsers] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          "http://localhost:1111/users/leaderboard",
          {
            headers: {
              "x-auth-token": localStorage.getItem("token"),
            },
          }
        );
        const { users1, users2, users3 } = response.data;
        setAllTimeUsers(users1);
        setLastMonthUsers(users2);
        setLastYearUsers(users3);
      } catch (error) {
        toast.error("Something failed...");
        console.error(error.message, error);
      }
    };

    fetchData();
  }, []); // Empty dependency array ensures the effect runs once on mount

  return (
    <div className="mx-auto max-w-4xl p-4">
      <Tabs.Root defaultValue="account">
        <Tabs.List>
          <Tabs.Trigger value="all_time">All Time</Tabs.Trigger>
          <Tabs.Trigger value="last_month">Last Month</Tabs.Trigger>
          <Tabs.Trigger value="last_year">Last Year</Tabs.Trigger>
        </Tabs.List>

        <Box pt="3">
          <Tabs.Content value="all_time">
            <Table.Root>
              <Table.Header>
                <Table.Row>
                  <Table.ColumnHeaderCell>Name</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>Email</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>Department</Table.ColumnHeaderCell>
                </Table.Row>
              </Table.Header>

              <Table.Body>
                {allTimeUsers.map((u) => (
                  <Table.Row>
                    <Table.RowHeaderCell>{u.name}</Table.RowHeaderCell>
                    <Table.Cell>{u.email}</Table.Cell>
                    <Table.Cell>{u.department.name}</Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Root>
          </Tabs.Content>

          <Tabs.Content value="last_month">
            <Table.Root>
              <Table.Header>
                <Table.Row>
                  <Table.ColumnHeaderCell>Name</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>Email</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>Department</Table.ColumnHeaderCell>
                </Table.Row>
              </Table.Header>

              <Table.Body>
                {lastMonthUsers.map((u) => (
                <Table.Row>
                    <Table.RowHeaderCell>{ u.name}</Table.RowHeaderCell>
                    <Table.Cell>{ u.email}</Table.Cell>
                    <Table.Cell>{ u.department.name}</Table.Cell>
                </Table.Row>
                ))}
              </Table.Body>
            </Table.Root>
          </Tabs.Content>

          <Tabs.Content value="last_year">
            <Table.Root>
              <Table.Header>
                <Table.Row>
                  <Table.ColumnHeaderCell>Name</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>Email</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>Department</Table.ColumnHeaderCell>
                </Table.Row>
              </Table.Header>

              <Table.Body>
                {lastYearUsers.map((u) => (
                <Table.Row>
                    <Table.RowHeaderCell>{ u.name}</Table.RowHeaderCell>
                    <Table.Cell>{ u.email}</Table.Cell>
                    <Table.Cell>{ u.department.name}</Table.Cell>
                </Table.Row>
                ))}
              </Table.Body>
            </Table.Root>
          </Tabs.Content>
        </Box>
      </Tabs.Root>
    </div>
  );
};

export default Leaderboard;
