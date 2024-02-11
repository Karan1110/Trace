// src/components/ChatListPage.js
import React from "react"
import { Link } from "react-router-dom"

const ChatListPage = () => {
  return (
    <div>
      <h2>Chat List Page</h2>
      <ul>
        <li>
          <Link to="/chat/1">Chat Room 1</Link>
        </li>
        <li>
          <Link to="/chat/2">Chat Room 2</Link>
        </li>
        {/* Add more chat rooms as needed */}
      </ul>
    </div>
  )
}

export default ChatListPage
