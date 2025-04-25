import React from 'react';
import { Outlet } from 'react-router-dom';

const MessageTemplateLayout: React.FC = () => {
  return (
    <div>
      <Outlet />
    </div>
  )
}

export default MessageTemplateLayout;