import React, { useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Heading } from "@radix-ui/themes";

const Invite = () => {
  const { inviteCode } = useParams();
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate("/signup");
    }

    const join = async () => {
      const resp = await axios.post(
        `http://localhost:1111/chats/join/${inviteCode}`,
        {},
        {
          headers: {
            "x-auth-token": token,
          },
        }
      );

      if (resp.status !== 200 || 201) {
        toast.error(resp.data);
      } else {
        navigate("/chat");
      }
    };
    join();
  }, []);
  return <Heading>Invite</Heading>;
};

export default Invite;
