import React from 'react';
import NotificationForm from '@/components/NotificationsForm';

const TemplateMessage: React.FC = () => {
  return (
    <div>
      <NotificationForm
        handleSubmit={() => console.log("Hello")}
        sendBy="email"
        messageBoxType="simplex"
        message="Hello, this is a test message." />
    </div>
  )
}

export default TemplateMessage;
