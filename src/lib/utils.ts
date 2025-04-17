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

export const isEventLive = (event: EventType | null): boolean => {
  if (!event) return false;
  if (!event.event_date) return false;

  const now = new Date();
  const eventDate = new Date(event.event_date);

  // Parse event start time
  const startTimeParts = `${event.start_time}:${event.start_minute_time} ${event.start_time_type}`.match(/(\d+):(\d+) (AM|PM)/i);
  // Parse event end time
  const endTimeParts = `${event.end_time}:${event.end_minute_time} ${event.end_time_type}`.match(/(\d+):(\d+) (AM|PM)/i);

  if (!startTimeParts || !endTimeParts) return false;

  // Create start and end datetime objects
  const eventStart = new Date(eventDate);
  let startHours = parseInt(startTimeParts[1]);
  if (startTimeParts[3].toUpperCase() === 'PM' && startHours < 12) startHours += 12;
  if (startTimeParts[3].toUpperCase() === 'AM' && startHours === 12) startHours = 0;
  eventStart.setHours(startHours, parseInt(startTimeParts[2]), 0, 0);

  const eventEnd = new Date(eventDate);
  let endHours = parseInt(endTimeParts[1]);
  if (endTimeParts[3].toUpperCase() === 'PM' && endHours < 12) endHours += 12;
  if (endTimeParts[3].toUpperCase() === 'AM' && endHours === 12) endHours = 0;
  eventEnd.setHours(endHours, parseInt(endTimeParts[2]), 0, 0);

  // Event is live if current time is between start and end times
  return now >= eventStart && now <= eventEnd;
}

export const isEventUpcoming = (event: EventType | null): boolean => {
  if (!event) return false;
  if (!event.event_date) return false;

  const now = new Date();

  // Parse event start time
  const startTimeParts = `${event.start_time}:${event.start_minute_time} ${event.start_time_type}`.match(/(\d+):(\d+) (AM|PM)/i);

  if (!startTimeParts) return false;

  // Create event datetime object
  const eventDate = new Date(event.event_date);
  let startHours = parseInt(startTimeParts[1]);
  if (startTimeParts[3].toUpperCase() === 'PM' && startHours < 12) startHours += 12;
  if (startTimeParts[3].toUpperCase() === 'AM' && startHours === 12) startHours = 0;
  eventDate.setHours(startHours, parseInt(startTimeParts[2]), 0, 0);

  // Event is upcoming if it's after current time
  return now < eventDate;
}

// Helper function to calculate the difference in days
export const dateDifference = (startDate: string, endDate: string): number => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  return (end.getTime() - start.getTime()) / (1000 * 3600 * 24);
};


// Helper function to format date time
export const formatDateTime = (dateString: string): string => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  
  // Get month name (short version)
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = months[date.getMonth()];
  
  // Get day
  const day = date.getDate();
  
  // Get year
  const year = date.getFullYear();
  
  // Get hours in 12-hour format
  let hours = date.getHours();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  
  // Get minutes and seconds
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');
  
  // Return formatted date string
  return `(${hours}:${minutes}:${seconds} ${ampm}) ${day}/${month}/${year}`;
};
