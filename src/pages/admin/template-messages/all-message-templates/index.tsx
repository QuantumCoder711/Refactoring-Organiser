import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const AllMessageTemplates: React.FC = () => {
  const navigate = useNavigate();
  const { slug } = useParams<{ slug: string }>();

  const templates = [
    {
      title: "Send Reminder",
      path: `/all-events/event/template-messages/send-reminder/${slug}`
    },
    {
      title: "Visit Booth Reminder",
      path: `/all-events/event/template-messages/visit-booth-reminder/${slug}`
    },
    {
      title: "Session Reminder",
      path: `/all-events/event/template-messages/session-reminder/${slug}`
    },
    {
      title: "Send Same Day Reminder",
      path: `/all-events/event/template-messages/send-same-day-reminder/${slug}`
    },
    {
      title: "Day Two Reminder",
      path: `/all-events/event/template-messages/day-two-reminder/${slug}`
    },
    {
      title: "Day Two Same Day Reminder",
      path: `/all-events/event/template-messages/day-two-same-day-reminder/${slug}`
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {templates.map((template, index) => (
        <div
          key={index}
          onClick={() => navigate(template.path)}
          className="p-4 bg-white rounded-lg shadow-blur cursor-pointer hover:bg-brand-background duration-300"
        >
          <h2 className="text-lg font-medium">{template.title}</h2>
        </div>
      ))}
    </div>
  );
};

export default AllMessageTemplates;