import React, { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { Button,  DropdownMenu, Dialog, Flex } from "@radix-ui/themes";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";

const SignUp = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [departmentName, setDepartmentName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [departmentSuggestions, setDepartmentSuggestions] = useState([]);
  const [department, setDepartment] = useState("none");

  const handleDepartmentSelect = (selectedDepartment) => {
    setDepartmentId(selectedDepartment);
  };
  useEffect(() => {
    async function fetchDepartments() {
      const response = await axios.get("http://localhost:1111/departments");
      setDepartmentSuggestions(response.data);
    }
    fetchDepartments();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (password != confirmPassword) {
        return toast(
          "the password should be the same as your confirmed password.."
        );
      }
      const response = await axios.post("http://localhost:1111/users", {
        name,
        email,
        password,
        department_id: departmentId,
      });

      toast.success("Sign-up successful!");
      localStorage.setItem("user_id", response.data.User.id);
      localStorage.setItem("token", response.data.token);
      console.log("User created:", response.data);

      // Reset the form after successful submission
      setName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setDepartmentId("");
    } catch (error) {
      toast.error("Error signing up. Please try again.");
      console.error("Error creating employee:", error);
    }
  };

  const createDepartment = async (e) => {
    e.preventDefault();

    try {
      const videoFile = document.getElementById("image").files[0];
      const formData = new FormData();
      formData.append("profile_pic", videoFile);
      formData.append("name", departmentName);

      const response = await axios.post(
        "http://localhost:1111/departments",
        formData,
        {
          headers: {
            "x-auth-token": localStorage.getItem("token"),
          },
        }
      );
      setDepartmentSuggestions((prevDepartments) => [
        ...prevDepartments,
        response.data,
      ]);

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
    <div className="max-w-4xl mx-auto mt-[40px] h-100">
      <form onSubmit={handleSubmit} className=" px-8 pt-6 pb-8 mb-4">
        <div className="mb-4 ">
          <TextField
            size="3"
            placeholder="Whats your name?"
            value={name}
            className="w-full py-2 px-3"
            variant="filled"
            label="name"
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="mb-4 flex space-x-3">
          <FormControl fullWidth>
            <InputLabel id="demo-simple-select-label">Department</InputLabel>
            <Select
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              value={departmentId}
              label="department"
              onChange={(e) => handleDepartmentSelect(e.target.value)}
            >
              {departmentSuggestions.map((d) => (
              <MenuItem value={d.id}>{d.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <Dialog.Root>
            <Dialog.Trigger>
              <Button> New </Button>
            </Dialog.Trigger>
            <Dialog.Content style={{ maxWidth: 450 }}>
              <Dialog.Title>New Department</Dialog.Title>
              <Dialog.Description size="2" mb="4">
                create a new department
              </Dialog.Description>

              <Flex direction="column" gap="3">
                <div className="mb-4">
                  <TextField
                    className="w-full py-2 px-3"
                    id="name"
                    type="text"
                    label="department"
                    variant="filled"
                    placeholder="Enter department name"
                    value={departmentName}
                    size="3"
                    onChange={(e) => setDepartmentName(e.target.value)}
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
              </Flex>

              <Flex gap="3" mt="4" justify="end">
                <Dialog.Close>
                  <Button variant="soft" color="gray">
                    Cancel
                  </Button>
                </Dialog.Close>
                <Dialog.Close>
                  <Button onClick={createDepartment}>Save</Button>
                </Dialog.Close>
              </Flex>
            </Dialog.Content>
          </Dialog.Root>
        </div>
        <div className="mb-4">
          <TextField
            size="3"
            className="w-full py-2 px-3"
            id="email"
            type="email"
            variant="filled"
            label="email"
            name="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="mb-4">
          <TextField
            size="3"
            className="w-full py-2 px-3"
            id="password"
            variant="filled"
            type="password"
            name="password"
            label="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <div className="mb-4">
          <TextField
            size="3"
            className="w-full py-2 px-3"
            id="confirmPassword"
            type="password"
            label="confirm password"
            variant="filled"
            name="confirmPassword"
            placeholder="Confirm your password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>

        <div className="cursor-pointer">
          <Button variant="solid" type="submit">
            sign up
          </Button>
        </div>
      </form>
    </div>
  );
};

export default SignUp;
