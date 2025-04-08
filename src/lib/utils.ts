import { domain } from "@/constants";
import { EventType } from "@/types";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const getImageUrl = (image: string | undefined | null): string => {
  return `${domain}/${image}`;
}

export const filterEvents = (events: EventType[]): { upcomingEvents: EventType[], pastEvents: EventType[] } => {
  if (!events || !Array.isArray(events)) {
    return { upcomingEvents: [], pastEvents: [] };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcomingEvents = events.filter(event => {
    if (!event.event_date) return false;
    const eventDate = new Date(event.event_date);
    eventDate.setHours(0, 0, 0, 0);
    return eventDate >= today;
  });

  const pastEvents = events.filter(event => {
    if (!event.event_date) return false;
    const eventDate = new Date(event.event_date);
    eventDate.setHours(0, 0, 0, 0);
    return eventDate < today;
  });

  return { upcomingEvents, pastEvents };
};
