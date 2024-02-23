import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { Badge, Button, Select, Tabs, Box } from "@radix-ui/themes";
import { ArrowRightIcon, CaretDownIcon } from "@radix-ui/react-icons";
import Spinner from "./Spinner";
import { useUser } from "../contexts/userContext";
import moment from "moment";

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
      user.Meeting.push(meeting);
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
            <div className="flex items-center justify-center space-x-5 space-y-5">
              {meetings.map((meeting) => (
                <div className=" max-w-md  p-6 bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700">
                  <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                    {meeting.name}
                  </h5>
                  <p className="mb-3 text-sm max-w-sm  text-gray-700 dark:text-gray-400">
                    {meeting.description ||
                      "Here are the biggest enterprise technology acquisitions of 2021 so far, in reverse chronological order."}
                  </p>
                  <p className="mb-3 space-x-3">
                    <Badge color="red">
                      {Math.abs(
                        moment(meeting.startingOn).diff(
                          moment(meeting.endingOn),
                          "hours"
                        )
                      )}
                    </Badge>

                    <Badge
                      color={
                        moment().isAfter(moment(meeting.startingOn))
                          ? "red"
                          : "green"
                      }
                    >
                      {moment().isAfter(meeting.startingOn)
                        ? moment(meeting.startingOn).fromNow()
                        : moment(meeting.startingOn).calendar()}
                    </Badge>
                  </p>
                  <div className="space-x-3">
                    {user.Meeting.some((m) => m.id == meeting.id) == true ||
                    moment().isBefore(moment(meeting.endingOn)) ==
                      true ? null : (
                      <Button
                        onClick={() =>
                          addMeetingToSchedule(meeting.id, meeting)
                        }
                      >
                        Add
                        <ArrowRightIcon />
                      </Button>
                    )}
                    <Button href={meeting.link}>Join</Button>
                  </div>
                </div>
              ))}
            </div>
          </Tabs.Content>

          <Tabs.Content value="settings">
            <div className="flex items-center justify-center space-x-5 space-y-5">
              {departmentMeetings.map((meeting) => (
                <div className=" max-w-md  p-6 bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700">
                  <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                    {meeting.name}
                  </h5>
                  <p className="mb-3 text-sm max-w-sm  text-gray-700 dark:text-gray-400">
                    {meeting.description ||
                      "Here are the biggest enterprise technology acquisitions of 2021 so far, in reverse chronological order."}
                  </p>
                  <p className="mb-3 space-x-3">
                    <Badge color="red">{meeting.duration}</Badge>
                    <Badge color="red">
                      {meeting.Department?.name || "General"}
                    </Badge>
                  </p>
                  <div className="space-x-3">
                    {user.Meeting.some((m) => m.id == meeting.id) ? null : (
                      <Button onClick={() => addMeetingToSchedule(meeting.id)}>
                        Add
                        <ArrowRightIcon />
                      </Button>
                    )}
                    <Button href={meeting.link}>Join</Button>
                  </div>
                </div>
              ))}
            </div>
          </Tabs.Content>

          <Tabs.Content value="following">
            <div className="flex items-center justify-center space-x-5 space-y-5">
              {user.Meeting.length.toString()}
              {user &&
                user.Meeting &&
                user.Meeting.map((meeting) => (
                  <div className=" max-w-md  p-6 bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700">
                    <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                      {meeting.name}
                    </h5>
                    <p className="mb-3 text-sm max-w-sm  text-gray-700 dark:text-gray-400">
                      {meeting.description ||
                        "Here are the biggest enterprise technology acquisitions of 2021 so far, in reverse chronological order."}
                    </p>
                    <p className="mb-3 space-x-3">
                      <Badge color="red">{meeting.duration}</Badge>
                      <Badge color="red">
                        {meeting.Department?.name || "General"}
                      </Badge>
                    </p>
                    <div className="space-x-3">
                      {meeting.duration[1] >
                      (
                        <Button
                          onClick={() => addMeetingToSchedule(meeting.id)}
                        >
                          Remove
                          <ArrowRightIcon />
                        </Button>
                      )}
                      <Button href={meeting.link}>Join</Button>
                    </div>
                  </div>
                ))}
            </div>
          </Tabs.Content>
        </Box>
      </Tabs.Root>
    </div>
  );
};

export default Meetings;
