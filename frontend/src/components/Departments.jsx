import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { TextField, Button } from "@radix-ui/themes";

const Department = () => {
  const [name, setName] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const videoFile = document.getElementById("image").files[0];
      const formData = new FormData();
      formData.append("profile_pic", videoFile);
      formData.append("name", name);

      const response = await axios.post(
        "http://localhost:1111/departments",
        formData,
        {
          headers: {
            "x-auth-token": localStorage.getItem("token"),
          },
        }
      );

      console.log("Department created:", response.data);
      toast.success("created the department!");
      // Reset the form after successful submission
      setName("");
    } catch (error) {
      toast(error.message);
      console.error("Error creating department:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="px-80 pt-6 pb-8 mb-4">
      <div className="mb-4">
        <label
          className="block text-gray-700 text-sm font-bold mb-2"
          htmlFor="name"
        >
          Name
        </label>
        <TextField.Input
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          id="name"
          type="text"
          placeholder="Enter department name"
          value={name}
          size="3"
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <div className="mb-4">
        <input
          type="file"
          className="block w-full border border-gray-200 shadow-sm rounded-lg text-sm focus:z-10 focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none dark:bg-slate-900 dark:border-gray-700 dark:text-gray-400 dark:focus:outline-none dark:focus:ring-1 dark:focus:ring-gray-600  file:border-0
          file:bg-gray-100 file:me-4
          file:py-3 file:px-4
          dark:file:bg-gray-700 dark:file:text-gray-400"
          id="image"
        />
      </div>
      <div className="flex items-center justify-between">
        <Button type="submit">Save</Button>
      </div>
    </form>
  );
};

export default Department;
