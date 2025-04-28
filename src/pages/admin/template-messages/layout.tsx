import GoBack from '@/components/GoBack';
import useEventStore from '@/store/eventStore';
import React from 'react';
import { Outlet, useParams } from 'react-router-dom';

const MessageTemplateLayout: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();

  const { getEventBySlug } = useEventStore(state => state);
  const event = getEventBySlug(slug);

  return (
    <div>
      <div className="flex items-center gap-7">
        <GoBack /> <h1 className='text-xl font-semibold'>{event?.title}</h1>
      </div>
      <div className='mt-8'>
        <Outlet />
      </div>
    </div>
  )
}

export default MessageTemplateLayout;