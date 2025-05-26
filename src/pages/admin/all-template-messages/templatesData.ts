import SendReminderIcon from '@/assets/template-message-icons/send-reminder.svg';
import VisitBoothReminderIcon from '@/assets/template-message-icons/visit-booth-reminder.svg';
import SessionReminderIcon from '@/assets/template-message-icons/session-reminder.svg';
import SendSameDayReminderIcon from '@/assets/template-message-icons/send-same-day-reminder.svg';
import DayTwoReminderIcon from '@/assets/template-message-icons/day-two-reminder.svg';
import DayTwoSameDayReminderIcon from '@/assets/template-message-icons/day-two-same-day-reminder.svg';
import SendPoll from "@/assets/template-message-icons/send-poll.svg";
import SendInApp from "@/assets/template-message-icons/send-in-app.svg";
import ThankYou from "@/assets/template-message-icons/thank-you.svg";

export const templates = [
  {
    title: "Send Reminder",
    path: `/all-events/event/all-template-messages/send-reminder`,
    sendBy: "both",
    message: `<p>Dear <strong>"Attendee Name"</strong>,<br><br>Thank you for registering for <strong>{title}</strong>. <br>This is a reminder message that the event will be held on <strong>{event_start_date}</strong> at <strong>{event_venue_name}</strong>. <br><br>Registration and check-in for the event will happen with the Klout Club app. <br>To ensure a smooth check-in and networking experience. You can download it here: <strong>"Link"</strong>. <br>We look forward to welcoming you to the event! <br><br>Regards, Team <strong>{company_name}</strong> <br></p>`,
    icon: SendReminderIcon,
    sendTo: false,
    paragraph: "Send a follow-up reminder message to all your guests. Ideally, send it one day before the event."
  },
  {
    title: "Send Same Day Reminder",
    path: `/all-events/event/all-template-messages/send-same-day-reminder`,
    message: `<p>Dear <strong>"Attendee Name"</strong>, <br><br>Thank you for registering for <strong>{title}</strong>. <br>This is a reminder message that the event is scheduled for <strong>{event_start_date}</strong> at <strong>{event_venue_name}</strong>. <br><br>Registration and check-in for the event will happen with the Klout Club app. <br>To ensure a smooth check-in and networking experience. You can download it here: <strong>"Link"</strong>. <br>We look forward to welcoming you to the event! <br><br>Regards, Team  <strong>{company_name}</strong> <br></p>`,
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
    message: `<p>Hi <strong>"Attendee Name"</strong> <br><br>The next session is about to begin. We kindly request you to join us back inside the hall. Thank you! <br><br>Regards, <br><strong>{company_name}</strong></p>`,
    paragraph: "Send reminders to all your checked-in guests about the start of a session."
  },
  {
    title: "Visit Booth Reminder",
    path: `/all-events/event/all-template-messages/visit-booth-reminder`,
    icon: VisitBoothReminderIcon,
    message: `<p>Hi <strong>"Attendee Name"</strong>, <br> <br>Just a friendly reminder to take this opportunity to network with fellow attendees and explore the booths in the exhibition area. It's a great chance to connect, learn, and discover new insights! <br> <br>Enjoy the event! <br> <br>Regards, <strong>{company_name}</strong> <br></p>`,
    sendBy: "whatsapp",
    sendTo: true,
    paragraph: "Send a notification to all your checked-in guests to visit the booth stalls."
  },
  {
    title: "Day Two Reminder",
    path: `/all-events/event/all-template-messages/day-two-reminder`,
    icon: DayTwoReminderIcon,
    message: `<p>Hi <strong>"Attendee Name"</strong> <br> <br>This is a friendly reminder that Day 2 of <strong>{title}</strong> will commence at <strong>{start_time}</strong> at <strong>{event_venue_name}</strong> <br> <br>We request you to check in and mark your attendance by scanning the QR code at the registration desk. <br><br>The agenda, speaker details, and participant list are all available on the Klout Club app <strong>"Link"</strong> <br> <br>Looking forward to seeing you. <br><br>Regards, <br><strong>{company_name}</strong></p>`,
    sendBy: "whatsapp",
    sendTo: true,
    paragraph: "Send a follow-up reminder message to all your guests for Day 2 of the event. Ideally, send it the evening before the event."
  },
  {
    title: "Day Two Same Day Reminder",
    path: `/all-events/event/all-template-messages/day-two-same-day-reminder`,
    icon: DayTwoSameDayReminderIcon,
    message: `<p>Dear <strong>"Attendee Name", </strong> <br> <br>This is a friendly reminder that Day 2 of <strong>{title}</strong> will be starting at <strong> 10:00 AM</strong> at <strong>{event_venue_name}</strong> <br> <br>Regards, <br><strong>{company_name}</strong></p>`,
    sendBy: "whatsapp",
    sendTo: true,
    paragraph: "Send a follow-up reminder message to all your guests for Day 2 of the event. Ideally, send it at 7 AM on the morning of Day 2."
  },
  {
    title: "Send Poll",
    path: `/all-events/event/all-template-messages/send-poll`,
    icon: SendPoll,
    message: ` <p>Hi <strong>User</strong>, <br /> <br />Hope you're enjoying the <strong>{title}</strong> 🎉 We'd love for you to take a moment to fill out this quick poll/survery: <strong>link</strong> <br /> <br />Thank you for your time! <br /> <br />Regards, Team <strong>{company_name}</strong> <br /></p>`,
    sendBy: "whatsapp",
    sendTo: true,
    paragraph: "Use the Send Poll feature to share a poll link via WhatsApp with all checked-in attendees—boost engagement instantly!"
  },
  {
    title: "Send In-App Message",
    path: `/all-events/event/all-template-messages/send-in-app-message`,
    icon: SendInApp,
    message: `<p>App Messge</p>`,
    sendBy: "whatsapp",
    sendTo: true,
    paragraph: "Send custom in-app messages to checked-in or non-checked-in event delegates instantly on the Klout Club app!"
  },
  {
    title: "Thank You Message",
    path: `/all-events/event/all-template-messages/thank-you-message`,
    icon: ThankYou,
    message: `<p>Thank you for being part of <strong> {title} </strong><br /> <br />It was a privilege to host you at this distinguished gathering of Senior Leaders and industry Trailblazers from diverse Sectors. <br /> <br />We hope you found the conference insightful and impactful, gaining valuable perspectives to drive innovation and excellence in your field. <br /> <br />Your active participation made the event truly memorable, and we are excited about staying connected and welcoming you to future editions of <strong> {title} </strong>and other events organised by <strong>{company_name}</strong>  <br /> <br />Warm regards, <br />Team <strong>{company_name}</strong></p>`,
    sendBy: "whatsapp",
    sendTo: true,
    paragraph: "Send a quick thank you via WhatsApp to all checked-in delegates—make your appreciation personal and instant!"
  },
];