// src/components/NotificationsListener.jsx
import { useEffect, useState } from "react"
import { toast } from "react-toastify"
import { socket } from "../socket"

export default function NotificationsListener() {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    console.log("[NotifListener] mounting, socket id:", socket.id)
    const handler = note => {
      console.log("[NotifListener] got note:", note)
      toast.info(note.message)
    }
    socket.on("new-notification", handler)

    setReady(true)

    return () => {
      socket.off("new-notification", handler)
      console.log("[NotifListener] unmounted")
    }
  }, [])

  return ready ? null : null
}
