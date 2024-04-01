import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { Badge, Button, Select, Tabs, Box } from "@radix-ui/themes";
import { ArrowRightIcon, CaretDownIcon } from "@radix-ui/react-icons";
import Spinner from "./Spinner";
import { useUser } from "../contexts/userContext";
import moment from "moment";
import MeetingCard from "./MeetingCard";

const Meetings = () => {
  const history = useNavigate();
  const [meetings, setMeetings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [department, setDepartment] = useState(1);
  const [departmentMeetings, setDepartmentMeetings] = useState(null);
  const user = useUser();
  const [departmentSuggestions, setDepartmentSuggestions] = useState([]);

  const handleDepartmentChange = (v) => {
    setDepartment(v);
  };

  useEffect(() => {
    const fetchMeetings = async () => {
      try {
        const response = await axios.get("http://localhost:1111/meetings", {
          headers: {
            "x-auth-token": localStorage.getItem("token"), // Include your authentication token if required
          },
        });

        setMeetings(response.data);

        setTimeout(() => {
          setIsLoading(false);
        }, 2000);
      } catch (error) {
        console.error("Error fetching meetings:", error.message, error);
      }
    };
    async function fetchDepartments() {
      const response = await axios.get("http://localhost:1111/departments", {
        headers: {
          "x-auth-token": localStorage.getItem("token"),
        },
      });
      setDepartmentSuggestions(response.data);
    }
    fetchDepartments();
    fetchMeetings();
  }, []);

  useEffect(() => {
    const fetchDepartmentMeetings = async () => {
      const response = await axios.get(
        `http://localhost:1111/meetings/departments/${department}`
      );
      setDepartmentMeetings(response.data);
    };
    fetchDepartmentMeetings();
  }, [department]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center text-center">
        <Spinner />
      </div>
    );
  }

  async function addMeetingToSchedule(meetingId, meeting) {
    try {
      await axios.post(
        `http://localhost:1111/meetings/addToSchedule/${meetingId}`,
        {},
        {
          headers: {
            "x-auth-token": localStorage.getItem("token"),
          },
        }
      );
      user.meetings.push({ meeting });
      toast.success("added to your schedule!");
    } catch (ex) {
      toast.error("something failed...");
    }
  }

  return (
    <div className="max-w-4xl mx-auto mt-5">
      <h2 className="text-2xl font-bold mb-4">Meetings</h2>
      <Button
        className="absolute top-20 right-10"
        color="purple"
        onClick={() => {
          history("/meetings/new");
        }}
      >
        <span className="text-xl">+</span>
        New
      </Button>
      <Select.Root
        defaultValue={1}
        size="2"
        onValueChange={(v) => handleDepartmentChange(v)}
      >
        <Select.Trigger>
          <Button variant="outline" color="purple">
            <CaretDownIcon />
          </Button>
        </Select.Trigger>
        <Select.Content color="purple">
          {departmentSuggestions.map((d) => (
            <Select.Item value={d.id} key={d.id}>
              {d.name}
            </Select.Item>
          ))}
        </Select.Content>
      </Select.Root>
      <Tabs.Root defaultValue="account">
        <Tabs.List>
          <Tabs.Trigger value="account">All Meetings</Tabs.Trigger>
          <Tabs.Trigger value="settings">Department</Tabs.Trigger>
          <Tabs.Trigger value="following">My meetings</Tabs.Trigger>
        </Tabs.List>

        <Box px="4" pt="3" pb="2">
          <Tabs.Content value="account">
            {" "}
            {meetings.map((m) => (
              <MeetingCard />
            ))}{" "}
          </Tabs.Content>

          <Tabs.Content value="settings">
            <div className="flex items-center justify-center space-x-5 space-y-5">
              {departmentMeetings.map((m) => (
                <MeetingCard />
              ))}
            </div>
          </Tabs.Content>

          <Tabs.Content value="following">
            <div className="flex items-center justify-center space-x-5 space-y-5">
              {user.meetings.length.toString()}
              {user &&
                user.meetings.length > 0 &&
                user.meetings.map((m) => <MeetingCard />)}
            </div>
          </Tabs.Content>
        </Box>
      </Tabs.Root>
    </div>
  );
};

export default Meetings;
