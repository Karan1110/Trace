import "@livekit/components-styles"
import {
  ControlBar,
  GridLayout,
  LiveKitRoom,
  ParticipantTile,
  RoomAudioRenderer,
  VideoConference,
  useTracks,
} from "@livekit/components-react"
import { useEffect, useState } from "react"
import Spinner from "./Spinner"
import axios from "axios"
import { Track } from "livekit-client"

export default function ({ channel }) {
  const serverUrl = "wss://trace-8rs0qfc2.livekit.cloud"
  const [token, setToken] = useState(null)

  useEffect(() => {
    const fetchToken = async () => {
      const response1 = await axios.get(
        `http://localhost:1111/users/${parseInt(
          localStorage.getItem("user_id")
        )}`,
        {
          headers: {
            "x-auth-token": localStorage.getItem("token"),
          },
        }
      )

      const response = await axios.post(
        `http://localhost:1111/chats/joinChannel/${channel || "my_room"}`,
        { participantName: response1.data.user.name },
        {
          headers: {
            "x-auth-token": localStorage.getItem("token"),
          },
        }
      )

      setToken(response.data)
      console.log(response.data)
    }

    fetchToken()
  }, [])

  if (!token || token == "") {
    return <Spinner />
  }

  return (
    <LiveKitRoom
      video={true}
      audio={true}
      token={token}
      serverUrl={serverUrl}
      data-lk-theme="default"
      style={{ height: "100vh" }}
    >
      <MyVideoConference />
      <RoomAudioRenderer />
      <ControlBar />
    </LiveKitRoom>
  )
}

function MyVideoConference() {
  const tracks = useTracks(
    [
      { source: Track.Source.Camera, withPlaceholder: true },
      { source: Track.Source.ScreenShare, withPlaceholder: false },
    ],
    { onlySubscribed: false }
  )
  return (
    <GridLayout
      tracks={tracks}
      style={{ height: "calc(100vh - var(--lk-control-bar-height))" }}
    >
      <ParticipantTile />
    </GridLayout>
  )
}
