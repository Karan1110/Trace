import React, { useEffect, useState } from "react";
import axios from "axios";
import { DropdownMenu, TextArea, TextField, Button } from "@radix-ui/themes";
import DurationPicker from "react-duration-picker";

const NewMeeting = () => {
  const [formData, setFormData] = useState({
    name: "",
    link: "",
    duration: [1, 1],
    department_id: null,
    description: "",
    department: "",
    startingOn: new Date(),
    endingOn: new Date(),
  });

  const [isOpen, setIsOpen] = useState(false);
  const [departmentSuggestions, setDepartmentSuggestions] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
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
      const response = await axios.get("http://localhost:1111/departments");
      setDepartmentSuggestions(response.data);
    }
    fetchDepartments();
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
          />
        </div>

        <div>
          <TextField.Input
            size="3"
            name="link"
            value={formData.link}
            onChange={handleChange}
            placeholder="meeting link…"
          />
        </div>
        <div>
          <TextArea
            size="3"
            name="description"
            placeholder="meeting description…"
            value={formData.description}
            onChange={handleChange}
          />
        </div>
        <div>
          <DateTimePicker
            name="startingOn"
            value={formData.startingOn}
            placeholder="select starting date-time"
            onChange={(value) =>
              setFormData({ ...formData, startingOn: value })
            }
          />
        </div>
        <div>
          <DateTimePicker
            name="endingOn"
            value={formData.endingOn}
            placeholder="select ending date-time"
            onChange={(value) => setFormData({ ...formData, endingOn: value })}
          />
        </div>
        <div className="mx-auto w-full text-center">
          <DropdownMenu.Root>
            <DropdownMenu.Trigger>
              <Button variant="soft">{formData.department || "None"}</Button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content size="2">
              {departmentSuggestions.map((d) => (
                <DropdownMenu.Item
                  key={d.id}
                  onClick={() => {
                    setFormData({
                      ...formData,
                      department_id: d.id,
                      department: d.name,
                    });
                  }}
                >
                  {" "}
                  {d.name}
                </DropdownMenu.Item>
              ))}
              <DropdownMenu.Separator />

              <DropdownMenu.Item>None</DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Root>
        </div>
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
