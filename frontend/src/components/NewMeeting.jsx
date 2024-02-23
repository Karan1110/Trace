import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  DropdownMenu,
  TextArea,
  TextField,
  Button,
  Badge,
  Select,
} from "@radix-ui/themes";

import { CaretDownIcon } from "@radix-ui/react-icons";
import DateTimePicker from "react-datetime-picker";
import "react-datetime-picker/dist/DateTimePicker.css";
import "react-calendar/dist/Calendar.css";
import "react-clock/dist/Clock.css";
import moment from "moment";
import { useUser } from "../contexts/userContext";

const NewMeeting = () => {
  const [formData, setFormData] = useState({
    name: "",
    link: "",
    duration: [1, 1],
    department_id: null,
    description: "",
    department: "",
    startingOn: moment(),
    endingOn: moment(),
    invitees: [],
  });
  const [users, setUsers] = useState([]);
  const currentUser = useUser();
  const [departmentSuggestions, setDepartmentSuggestions] = useState([]);
  const [invitees, setInvitees] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      console.log(formData);
      const response = await axios.post(
        "http://localhost:1111/meetings",
        formData,
        {
          headers: {
            "x-auth-token": localStorage.getItem("token"),
          },
        }
      );

      console.log("Meeting created successfully:", response.data);
      // Additional actions or redirect can be added here
    } catch (error) {
      console.error("Error creating meeting:", error);
    }
  };

  useEffect(() => {
    async function fetchDepartments() {
      const response = await axios.get("http://localhost:1111/departments", {
        headers: {
          "x-auth-token": localStorage.getItem("token"),
        },
      });
      setDepartmentSuggestions(response.data);
    }
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

    fetchDepartments();
    fetchUsers();
    console.log(formData.duration[0]);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  return (
    <div className="max-w-xl mx-auto p-6 ">
      <h2 className="text-2xl font-bold mb-4">Create New Meeting</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <TextField.Input
            size="3"
            name="name"
            placeholder="meeting title..."
            value={formData.name}
            onChange={handleChange}
            color="purple"
          />
        </div>

        <div>
          <TextField.Input
            size="3"
            name="link"
            value={formData.link}
            onChange={handleChange}
            placeholder="meeting link…"
            color="purple"
          />
        </div>
        <div>
          <TextArea
            size="3"
            name="description"
            placeholder="meeting description…"
            value={formData.description}
            onChange={handleChange}
            color="purple"
          />
        </div>
        <div>
          <DateTimePicker
            value={formData.startingOn}
            onChange={(value) =>
              setFormData({ ...formData, startingOn: value })
            }
          />
        </div>
        <div>
          <DateTimePicker
            value={formData.endingOn}
            onChange={(value) => setFormData({ ...formData, endingOn: value })}
          />
        </div>
        {invitees.length > 0 && (
          <div className="mx-auto w-full text-center p-4">
            {invitees.map((user, index) => (
              <Badge key={index}>{user.name}</Badge>
            ))}
          </div>
        )}
        <div className="mx-auto w-full text-center">
          <Select.Root
            defaultValue={null}
            onValueChange={(value) => {
              if (!value || formData.invitees.some((id) => id == value)) return;
              setFormData({
                ...formData,
                invitees: [...formData.invitees, value],
              });
              setInvitees([
                ...invitees,
                { name: users.find((user) => user.id == value).name },
              ]);
            }}
          >
            <Select.Trigger>
              <Button variant="outline">
                <CaretDownIcon />
              </Button>
            </Select.Trigger>
            <Select.Content color="purple">
              {currentUser &&
                users &&
                users.length > 0 &&
                users
                  .filter((user) => user.id !== currentUser.id)
                  .map((user) => (
                    <Select.Item key={user.id} value={user.id}>
                      {user.name}
                    </Select.Item>
                  ))}
              <Select.Item value={null}>None</Select.Item>
            </Select.Content>
          </Select.Root>
        </div>
        {departmentSuggestions.length > 0 && (
          <div className="mx-auto w-full text-center">
            <DropdownMenu.Root>
              <DropdownMenu.Trigger>
                <Button variant="soft">{formData.department || "None"}</Button>
              </DropdownMenu.Trigger>
              <DropdownMenu.Content size="2">
                {departmentSuggestions.map((department) => (
                  <DropdownMenu.Item
                    key={department.id}
                    onClick={() =>
                      setFormData({
                        ...formData,
                        department_id: department.id,
                        department: department.name,
                      })
                    }
                  >
                    {department.name}
                  </DropdownMenu.Item>
                ))}
                <DropdownMenu.Separator />
                <DropdownMenu.Item>None</DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Root>
          </div>
        )}
        <div className=" mx-auto text-center ">
          <Button type="submit" color="purple">
            Create Meeting
          </Button>
        </div>
      </form>
    </div>
  );
};

export default NewMeeting;
