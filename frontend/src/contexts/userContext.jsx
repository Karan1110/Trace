import React, { createContext, useContext, useState, useEffect } from "react"
import axios from "axios"

const UserContext = createContext()

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3500/users/${parseInt(
            localStorage.getItem("user_id")
          )}`,
          {
            headers: {
              "x-auth-token": localStorage.getItem("token"),
            },
          }
        )
        setUser(response.data)
        console.log(response.data)
      } catch (error) {
        console.error("Error fetching user:", error.message)
      }
    }

    fetchUser()
  }, [])

  return <UserContext.Provider value={user}>{children}</UserContext.Provider>
}

export const useUser = () => useContext(UserContext)
