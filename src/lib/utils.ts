import { domain, UserAvatar } from "@/constants";
import { AgendaType, EventType, UserType } from "@/types";
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
  if (!event.event_date || !event.event_start_date) return false;

  const now = new Date();
  const eventStartDate = new Date(event.event_start_date);
  const eventEndDate = new Date(event.event_date);

  // Parse event start time
  const startTimeParts = `${event.start_time}:${event.start_minute_time} ${event.start_time_type}`.match(/(\d+):(\d+) (AM|PM)/i);
  // Parse event end time
  const endTimeParts = `${event.end_time}:${event.end_minute_time} ${event.end_time_type}`.match(/(\d+):(\d+) (AM|PM)/i);

  if (!startTimeParts || !endTimeParts) return false;

  // Create start datetime object
  const eventStart = new Date(eventStartDate);
  let startHours = parseInt(startTimeParts[1]);
  if (startTimeParts[3].toUpperCase() === 'PM' && startHours < 12) startHours += 12;
  if (startTimeParts[3].toUpperCase() === 'AM' && startHours === 12) startHours = 0;
  eventStart.setHours(startHours, parseInt(startTimeParts[2]), 0, 0);

  // Create end datetime object
  const eventEnd = new Date(eventEndDate);
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

  // Return formatted date string
  return `${day}, ${month}, ${year}`;
};
// Helper function to format date time
export const formatDateTimeReport = (dateString: string): string => {
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
  return `${day}/${month}/${year} ${hours}:${minutes}:${seconds} ${ampm}`;
};

export const createImage = (url: File | undefined | null): string => {
  if (url instanceof File) {
    return URL.createObjectURL(url);
  }

  return UserAvatar;
};

export const getToken = (): string | null => {
  const token = localStorage.getItem("klout-organiser-storage");
  return token ? JSON.parse(token).state.token : null;
}

export const formatTemplateMessage = (message: string, event: EventType | null, user: UserType | null): string => {
  if (!event || !user) return message;

  const { company_name } = user;
  const { title, event_venue_name, event_start_date, start_time, start_minute_time, start_time_type } = event;

  return message
    .replace("{title}", title || '')
    .replace("{company_name}", company_name || '')
    .replace("{event_venue_name}", event_venue_name || '')
    .replace("{event_start_date}", event_start_date || '')
    .replace("{start_time}", `${start_time}:${start_minute_time} ${start_time_type}` || '');
}

export const beautifyDate = (date: Date) => {
  const day = date.getDate();
  const month = date.toLocaleString('default', { month: 'short' });
  const year = date.getFullYear();
  return `${day}, ${month}, ${year}`;
};

export const beautifyTime = (time: string): string => {
  // Handle different time formats
  let date: Date;

  if (time.includes(':')) {
    // Handle "HH:MM" or "H:MM" format
    const [hours, minutes] = time.split(':').map(Number);
    date = new Date();
    date.setHours(hours, minutes);
  } else {
    // Handle timestamp
    date = new Date(parseInt(time));
  }

  if (isNaN(date.getTime())) {
    return 'Invalid time';
  }

  let hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  return `${hours}:${minutes} ${ampm}`;
}

export const getRandomOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Function to compress image files
export const compressImage = async (file: File, maxSizeMB: number = 1): Promise<File> => {
  return new Promise((resolve, reject) => {
    // If file is already smaller than max size, return it as is
    if (file.size / 1024 / 1024 < maxSizeMB) {
      resolve(file);
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;

      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Calculate the width and height, preserving the aspect ratio
        const maxDimension = 1200; // Max width or height
        if (width > height && width > maxDimension) {
          height = (height * maxDimension) / width;
          width = maxDimension;
        } else if (height > maxDimension) {
          width = (width * maxDimension) / height;
          height = maxDimension;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);

        // Get the data URL of the resized image
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Canvas to Blob conversion failed'));
              return;
            }

            // Create a new file from the blob
            const newFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now(),
            });

            resolve(newFile);
          },
          file.type,
          0.7 // Quality (0.7 = 70% quality)
        );
      };
    };
    reader.onerror = (error) => reject(error);
  });
}

export const getStartEndTime = (event: EventType | AgendaType | null): string => {
  if (!event) return '';
  const startMinute = event.start_minute_time || '00';
  const endMinute = event.end_minute_time || '00';
  return `${event.start_time}:${startMinute} ${event.start_time_type} - ${event.end_time}:${endMinute} ${event.end_time_type}`;
}