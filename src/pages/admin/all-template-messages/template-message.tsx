  import React from 'react';
  import { useLocation } from 'react-router-dom';
  import { templates } from './templatesData';
  import NotifcationsForm from '@/components/NotificationsForm';

  const TemplateMessage: React.FC = () => {
    const location = useLocation();
    const { pathname } = location;
    const templateName = pathname.split('/')[pathname.split('/').length - 2];

    const matchingTemplate = templates.find(template => template.path.includes(templateName));

    return (
      <div className='w-full h-full'>
        <NotifcationsForm 
          message={'Template'}
          sendBy={matchingTemplate?.sendBy as "email" | "whatsapp" | "both"}
          sendTo={matchingTemplate?.sendTo || false}
        />
      </div>
    );
  };

  export default TemplateMessage;
