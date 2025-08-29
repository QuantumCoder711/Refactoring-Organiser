import { useEffect } from "react";
import socket from "@/../socket";
import useEventStore from "@/store/eventStore";

export default function useCheckInSocket(events: any[]) {
  const setCheckInCount = useEventStore((s) => s.setCheckInCount);

  useEffect(() => {
    if (!events) return;

    const joinRoom = () => {
      events?.forEach((event) => {
        if (!event?.uuid) {
          console.warn('Event missing uuid:', event);
          return;
        }
        socket.emit("joinEvent", { userId: event.user_id, eventUuid: event.uuid });
      });
    };

    if (socket.connected) {
      joinRoom();
    }
    socket.on("connect", () => {
      joinRoom();
    });

    socket.on("checkInCountUpdated", (data) => {
      setCheckInCount(data?.eventUuid, data?.updatedCheckInCount);
    });

    return () => {
      socket.off("connect", joinRoom);
      socket.off("checkInCountUpdated");
    };
  }, [events, setCheckInCount]);
} 