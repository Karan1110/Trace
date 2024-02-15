// Leaderboard.js
import React, { useState, useEffect } from "react"
import axios from "axios"
import { Tabs, Table } from "@radix-ui/react-tabs"
import { toast } from "react-hot-toast"

const Leaderboard = () => {
  const [allTimeUsers, setAllTimeUsers] = useState([])
  const [lastMonthUsers, setLastMonthUsers] = useState([])
  const [lastYearUsers, setLastYearUsers] = useState([])

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
        )
        const { users1, users2, users3 } = response.data
        setAllTimeUsers(users1)
        setLastMonthUsers(users2)
        setLastYearUsers(users3)
      } catch (error) {
        toast.error("Something failed...")
        console.error(error.message, error)
      }
    }

    fetchData()
  }, []) // Empty dependency array ensures the effect runs once on mount

  return (
    <div className="mx-auto max-w-4xl p-4">
      <Tabs.Root defaultValue="1">
        <Tabs.List>
          <Tabs.Trigger value="1">All Time</Tabs.Trigger>
          <Tabs.Trigger value="2">Last Month</Tabs.Trigger>
          <Tabs.Trigger value="3">Last Year</Tabs.Trigger>
        </Tabs.List>

        <Tabs.Content>
          <Tabs.Panel value="1">
            <Table.Root className="max-w-2xl">
              <Table.Header>
                <Table.Row>
                  <Table.ColumnHeader>User</Table.ColumnHeader>
                  <Table.ColumnHeader align="right">Points</Table.ColumnHeader>
                  <Table.ColumnHeader align="right">
                    Department
                  </Table.ColumnHeader>
                </Table.Row>
              </Table.Header>

              <Table.Body>
                {allTimeUsers &&
                  allTimeUsers.map((user) => (
                    <Table.Row key={user.id}>
                      <Table.RowHeaderCell>{user.name}</Table.RowHeaderCell>
                      <Table.Cell>{user.points}</Table.Cell>
                      <Table.Cell>{user.Department.name}</Table.Cell>
                    </Table.Row>
                  ))}
              </Table.Body>
            </Table.Root>
          </Tabs.Panel>

          <Tabs.Panel value="2">
            <Table.Root className="max-w-2xl">
              <Table.Header>
                <Table.Row>
                  <Table.ColumnHeader>User</Table.ColumnHeader>
                  <Table.ColumnHeader align="right">Points</Table.ColumnHeader>
                  <Table.ColumnHeader align="right">
                    Department
                  </Table.ColumnHeader>
                </Table.Row>
              </Table.Header>

              <Table.Body>
                {lastMonthUsers &&
                  lastMonthUsers.map((user) => (
                    <Table.Row key={user.id}>
                      <Table.RowHeaderCell>{user.name}</Table.RowHeaderCell>
                      <Table.Cell>{user.points}</Table.Cell>
                      <Table.Cell>{user.Department.name}</Table.Cell>
                    </Table.Row>
                  ))}
              </Table.Body>
            </Table.Root>
          </Tabs.Panel>

          <Tabs.Panel value="3">
            <Table.Root className="max-w-2xl">
              <Table.Header>
                <Table.Row>
                  <Table.ColumnHeader>User</Table.ColumnHeader>
                  <Table.ColumnHeader align="right">Points</Table.ColumnHeader>
                  <Table.ColumnHeader align="right">
                    Department
                  </Table.ColumnHeader>
                </Table.Row>
              </Table.Header>

              <Table.Body>
                {lastYearUsers &&
                  lastYearUsers.map((user) => (
                    <Table.Row key={user.id}>
                      <Table.RowHeaderCell>{user.name}</Table.RowHeaderCell>
                      <Table.Cell>{user.points}</Table.Cell>
                      <Table.Cell>{user.Department.name}</Table.Cell>
                    </Table.Row>
                  ))}
              </Table.Body>
            </Table.Root>
          </Tabs.Panel>
        </Tabs.Content>
      </Tabs.Root>
    </div>
  )
}

export default Leaderboard
