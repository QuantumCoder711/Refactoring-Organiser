import SendReminderIcon from '@/assets/template-message-icons/send-reminder.svg';
import VisitBoothReminderIcon from '@/assets/template-message-icons/visit-booth-reminder.svg';
import SessionReminderIcon from '@/assets/template-message-icons/session-reminder.svg';
import SendSameDayReminderIcon from '@/assets/template-message-icons/send-same-day-reminder.svg';
import DayTwoReminderIcon from '@/assets/template-message-icons/day-two-reminder.svg';
import DayTwoSameDayReminderIcon from '@/assets/template-message-icons/day-two-same-day-reminder.svg';

export const templates = [
  {
    title: "Send Reminder",
    path: `/all-events/event/all-template-messages/send-reminder`,
    sendBy: "both",
    message: "This is a reminder message for the event.",
    icon: SendReminderIcon,
    sendTo: false,
    paragraph: "Send a follow-up reminder message to all your guests. Ideally, send it one day before the event."
  },
  {
    title: "Send Same Day Reminder",
    path: `/all-events/event/all-template-messages/send-same-day-reminder`,
    icon: SendSameDayReminderIcon,
    sendBy: "whatsapp",
    sendTo: true,
    paragraph: "Send a follow-up reminder message to all your guests on the day of the event. Ideally, send it at 7:00 AM in the morning."
  },
  {
    title: "Session Reminder",
    path: `/all-events/event/all-template-messages/session-reminder`,
    icon: SessionReminderIcon,
    sendBy: "whatsapp",
    sendTo: true,
    paragraph: "Send reminders to all your checked-in guests about the start of a session."
  },
  {
    title: "Visit Booth Reminder",
    path: `/all-events/event/all-template-messages/visit-booth-reminder`,
    icon: VisitBoothReminderIcon,
    sendBy: "whatsapp",
    sendTo: true,
    paragraph: "Send a notification to all your checked-in guests to visit the booth stalls."
  },
  {
    title: "Day Two Reminder",
    path: `/all-events/event/all-template-messages/day-two-reminder`,
    icon: DayTwoReminderIcon,
    sendBy: "whatsapp",
    sendTo: true,
    paragraph: "Send a follow-up reminder message to all your guests for Day 2 of the event. Ideally, send it the evening before the event."
  },
  {
    title: "Day Two Same Day Reminder",
    path: `/all-events/event/all-template-messages/day-two-same-day-reminder`,
    icon: DayTwoSameDayReminderIcon,
    sendBy: "whatsapp",
    sendTo: true,
    paragraph: "Send a follow-up reminder message to all your guests for Day 2 of the event. Ideally, send it at 7 AM on the morning of Day 2."
  }
];