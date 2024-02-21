import "@livekit/components-styles"
import {
  ControlBar,
  GridLayout,
  LiveKitRoom,
  ParticipantTile,
  RoomAudioRenderer,
  VideoConference,
} from "@livekit/components-react"
import { useEffect, useState } from "react"

const serverUrl = "wss://trace-8rs0qfc2.livekit.cloud"

export default function ({ channel }) {
  const [token, setToken] = useState(null)

  useEffect(() => {
    const fetchToken = async () => {
      const response = await axios.get(
        `http://localhost:1111/chats/joinChannel/${channel}`,
        {
          headers: {
            "x-auth-token": localStorage.getItem("token"),
          },
        }
      )
      return response.data
    }
    setToken(fetchToken())
  }, [])

  return (
    <LiveKitRoom
      video={true}
      audio={true}
      token={token}
      serverUrl={serverUrl}
      // Use the default LiveKit theme for nice styles.
      data-lk-theme="default"
      style={{ height: "100vh" }}
    >
      {/* Your custom component with basic video conferencing functionality. */}
      <MyVideoConference />
      {/* The RoomAudioRenderer takes care of room-wide audio for you. */}
      <RoomAudioRenderer />
      {/* Controls for the user to start/stop audio, video, and screen 
      share tracks and to leave the room. */}
      <ControlBar />
    </LiveKitRoom>
  )
}

function MyVideoConference() {
  // `useTracks` returns all camera and screen share tracks. If a user
  // joins without a published camera track, a placeholder track is returned.
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
