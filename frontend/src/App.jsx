import React from "react"
import "./index.css"
import "@radix-ui/themes/styles.css"
import { Theme } from "@radix-ui/themes"
import { BrowserRouter as Router, Route, Routes } from "react-router-dom"
import Navbar from "./components/Navbar"
import Chat from "./components/Chat.jsx"
import { Toaster } from "react-hot-toast"
import EmailVerificationForm from "./components/Mail"
import Department from "./components/Department"
import Tickets from "./components/Tickets.jsx"
import SignUp from "./components/SignUp"
import Home from "./components/Home"
import Meetings from "./components/Meetings"
import TicketDetails from "./components/Ticket"
import NewTicket from "./components/NewTicket"
import EditTicket from "./components/EditTicket"
import Leaderboard from "./components/Leaderboard.jsx"
import User from "./components/User"
import { UserProvider } from "./contexts/userContext.jsx"
import NewMeeting from "./components/NewMeeting.jsx"
import Meet from "./components/Meet.jsx"

const App = () => {
  return (
    <>
      <UserProvider>
        <Theme>
          <Toaster />
          <Navbar />
          <Router>
            <Routes>
              <Route path="/chat" element={<Chat />} />
              <Route path="/verify" element={<EmailVerificationForm />} />
              <Route path="/departments" element={<Department />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/" element={<Home />} />
              <Route path="/tickets/:id" element={<TicketDetails />} />
              <Route path="/edit/:id" element={<EditTicket />} />
              <Route path="/new" element={<NewTicket />} />
              <Route path="/meetings" element={<Meetings />} />
              <Route path="/meetings/new" element={<NewMeeting />} />
              <Route path="/tickets" element={<Tickets />} />
              <Route path="/leaderboard" element={<Leaderboard />} />
              <Route path="/users/:id" element={<User />} />
              <Route path="/meet" element={<Meet />} />
            </Routes>
          </Router>
        </Theme>
      </UserProvider>
    </>
  )
}

export default App
