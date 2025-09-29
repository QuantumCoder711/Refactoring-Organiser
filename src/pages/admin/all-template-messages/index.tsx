import GoBack from '@/components/GoBack';
import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { templates } from './templatesData';

const AllTemplateMessages: React.FC = () => {
  const navigate = useNavigate();
  const { slug } = useParams<{ slug: string }>();

  return (
    <div className=''>
      <div className="flex items-center gap-7">
        <GoBack /> <h1 className='text-xl font-semibold'>Send Whatsapp/E-Mail</h1>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
        {templates.filter(t => t.title !== "Invite Registrations").map((template, index) => (
          <div
            key={index}
            onClick={() => navigate(`${template.path}/${slug}`)}
            className="bg-muted p-4 rounded-[10px] h-52 cursor-pointer group flex flex-col justify-between"
          >
            <div className='flex flex-col gap-2'>
              <img src={template.icon as string} alt={template.title} className="size-10" />
              <h2 className="text-lg font-medium group-hover:text-primary duration-300">{template.title}</h2>
            </div>

            <div className='w-full flex justify-between items-end'>
              <p className='text-sm w-3/4'>{template.paragraph}</p>
              <div className='bg-background grid w-8 h-8 p-1.5 place-content-center rounded-full'>
                <ArrowRight className='h-full w-full group-hover:text-primary duration-300' />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AllTemplateMessages;