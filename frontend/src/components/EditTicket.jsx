import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import moment from "moment";
import { toast } from "react-hot-toast";
import { useParams } from "react-router-dom";
import { TextField } from "@radix-ui/themes";
import MarkdownEditor from "@uiw/react-markdown-editor";

const EditTicket = () => {
  const [mdStr, setMdStr] = useState(
    `
  # This is a H1
  ## This is a H2
  ###### This is a H6
  ## you can start typing the description!
  ## include html!
  ## include code blocks:
\`onClick={() => setFormData({ ...formData})\`
`
  );

  const { id } = useParams();
  const [formData, setFormData] = useState({
    name: "",
    description: mdStr,
    deadline: moment().add(2, "days").format("YYYY-MM-DD"),
  });

  useEffect(() => {
    const fetchTicketDetails = async () => {
      try {
        const authToken = localStorage.getItem("token");
        const response = await axios.get(
          `http://localhost:1111/tickets/${id}`,
          {
            headers: {
              "x-auth-token": authToken,
            },
          }
        );

        // Pre-fill the form data with existing ticket details
        setFormData({
          name: response.data.name,
          description: response.data.description,
          deadline: moment(response.data.deadline).format("YYYY-MM-DD"),
        });
      } catch (error) {
        toast.error("Error fetching ticket details: " + error.message);
        console.error("Error fetching ticket details:", error);
      }
    };

    fetchTicketDetails();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Assuming your API endpoint for updating a ticket is /tickets/:id
      const response = await axios.put(
        `http://localhost:1111/tickets/${id}`,
        {
          ...formData,
        },
        {
          headers: {
            "x-auth-token": localStorage.getItem("token"),
          },
        }
      );

      console.log(response.data);
      toast.success("Ticket updated successfully!");
      // Additional actions or redirect can be added here
    } catch (error) {
      toast.error("Error updating ticket. Please try again.");
      console.error("Error updating ticket:", error);
    }
  };

  return (
    <div className="max-w-2xl mt-[75px] mx-auto">
      <Heading>Edit Ticket</Heading>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Name
          </label>
          <TextField.Input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            color="purple"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <MarkdownEditor
            value={mdStr}
            onChange={(value) => {
              setMdStr(value);
              console.log(value);
            }}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Deadline
          </label>
          <input
            datepicker
            type="date"
            name="deadline"
            value={formData.deadline}
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full ps-10 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            placeholder="Select date"
            onChange={onChange}
          />
        </div>
        <Button type="submit" color="purple">
          Update Ticket
        </Button>
      </form>
    </div>
  );
};

export default EditTicket;
