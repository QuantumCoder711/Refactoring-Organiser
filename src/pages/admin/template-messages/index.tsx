import GoBack from '@/components/GoBack';
import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import SendReminderIcon from '@/assets/template-message-icons/send-reminder.svg';
import VisitBoothReminderIcon from '@/assets/template-message-icons/visit-booth-reminder.svg';
import SessionReminderIcon from '@/assets/template-message-icons/session-reminder.svg';
import SendSameDayReminderIcon from '@/assets/template-message-icons/send-same-day-reminder.svg';
import DayTwoReminderIcon from '@/assets/template-message-icons/day-two-reminder.svg';
import DayTwoSameDayReminderIcon from '@/assets/template-message-icons/day-two-same-day-reminder.svg';
import { ArrowRight } from 'lucide-react';

const AllMessageTemplates: React.FC = () => {
  const navigate = useNavigate();
  const { slug } = useParams<{ slug: string }>();

  const templates = [
    {
      title: "Send Reminder",
      path: `/all-events/event/template-messages/send-reminder/${slug}`,
      icon: SendReminderIcon,
      paragraph: "Send a follow-up reminder message to all your guests. Ideally, send it one day before the event."
    },
    {
      title: "Send Same Day Reminder",
      path: `/all-events/event/template-messages/send-same-day-reminder/${slug}`,
      icon: SendSameDayReminderIcon,
      paragraph: "Send a follow-up reminder message to all your guests on the day of the event. Ideally, send it at 7:00 AM in the morning."
    },
    {
      title: "Session Reminder",
      path: `/all-events/event/template-messages/session-reminder/${slug}`,
      icon: SessionReminderIcon,
      paragraph: "Send reminders to all your checked-in guests about the start of a session."
    },
    {
      title: "Visit Booth Reminder",
      path: `/all-events/event/template-messages/visit-booth-reminder/${slug}`,
      icon: VisitBoothReminderIcon,
      paragraph: "Send a notification to all your checked-in guests to visit the booth stalls."
    },
    {
      title: "Day Two Reminder",
      path: `/all-events/event/template-messages/day-two-reminder/${slug}`,
      icon: DayTwoReminderIcon,
      paragraph: "Send a follow-up reminder message to all your guests for Day 2 of the event. Ideally, send it the evening before the event."
    },
    {
      title: "Day Two Same Day Reminder",
      path: `/all-events/event/template-messages/day-two-same-day-reminder/${slug}`,
      icon: DayTwoSameDayReminderIcon,
      paragraph: "Send a follow-up reminder message to all your guests for Day 2 of the event. Ideally, send it at 7 AM on the morning of Day 2."
    }
  ];

  return (
    <div className=''>
      <div className="flex items-center gap-7">
        <GoBack /> <h1 className='text-xl font-semibold'>Send Whatsapp/E-Mail</h1>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
        {templates.map((template, index) => (
          <div
            key={index}
            onClick={() => navigate(template.path)}
            className="bg-brand-background p-4 rounded-[10px] h-52 cursor-pointer group flex flex-col justify-between"
          >
            <div className='flex flex-col gap-2'>
              <img src={template.icon} alt={template.title} className="size-10" />
              <h2 className="text-lg font-medium group-hover:text-brand-primary duration-300">{template.title}</h2>
            </div>

            <div className='w-full flex justify-between items-end'>
              <p className='text-sm w-3/4'>{template.paragraph}</p>
              <div className='bg-white grid w-8 h-8 p-1.5 place-content-center rounded-full'>
                <ArrowRight className='h-full w-full group-hover:text-brand-primary duration-300' />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AllMessageTemplates;