import Linea from '@/components/Linea';
import { Button } from '@/components/ui/button';
import React from 'react';
import OpenMail from "@/assets/open-mail.svg";
import Contact from "@/assets/contact.svg";
import EventsCheck from "@/assets/EventsCheck.svg";
import LaptopContact from "@/assets/laptop-contact.svg";
import TLS from "@/assets/tls.svg";

const preEvent = [
    {
        title: "Delegate Invitations",
        description: "Create and send personalized messaging",
        icon: OpenMail
    },
    {
        title: "Invite Builder",
        description: "Upload your contacts or build your invitations list with klout club users.",
        icon: Contact
    },
    {
        title: "Event Page with Interest Validation",
        description: "Dynamic Event pages that validate attendee interest",
        icon: EventsCheck
    },
    {
        title: "WhatsApp/Email Follow-ups",
        description: "Automated Multi-channel communication sequences",
        icon: LaptopContact
    },
    {
        title: "Thought Leadership Score",
        description: "Track and measure influence and engagement metrics",
        icon: TLS
    }
];

const liveEvent = [
    {
        title: "Delegate Invitations",
        description: "Create and send personalized messaging",
        icon: OpenMail
    }
];

const postEvent = [
    {
        title: "WhatsApp/Email Follow-ups",
        description: "Automated Multi-channel communication sequences",
        icon: LaptopContact
    },
    {
        title: "Thought Leadership Score",
        description: "Track and measure influence and engagement metrics",
        icon: TLS
    }
];

const Features: React.FC = () => {
    const [selectedTab, setSelectedTab] = React.useState(0);
    return (
        <div className='p-10 py-20'>
            <h1 className="font-sf-pro font-bold max-w-5xl mx-auto text-[55px] leading-[60px] text-center">
                Powering Memorable Events From Start to Finish
            </h1>
            <p className="font-sf-pro my-5 font-medium text-center text-[18px] leading-[23px]">
                Klout Club delivers smart, AI-driven features for organizers before, during and after every event
            </p>

            <div className='text-center'>
                <Button className='btn btn-primary !mx-auto !px-6 !py-3'>Get Started</Button>
            </div>

            <div className='my-10'>
                <Linea />
            </div>

            <div className='w-fit mx-auto'>
                <h1 className="font-sf-pro font-bold max-w-5xl mx-auto text-[55px] leading-[60px] text-center">
                    Your Event Journey
                </h1>
                <span className='block mx-auto h-[2px] bg-black' />
            </div>

            {/* Tab Functionality */}
            <div className='w-full grid grid-cols-3 gap-7 mt-28 max-w-5xl mx-auto'>
                <Button className={`btn !py-5 rounded-full !font-bold text-lg !bg-transparent !text-black !border !border-brand-primary !w-full ${selectedTab === 0 ? '!bg-brand-primary !text-white' : ''}`} onClick={() => setSelectedTab(0)}>Pre-Event</Button>
                <Button className={`btn !py-5 rounded-full !font-bold text-lg !bg-transparent !text-black !border !border-brand-primary !w-full ${selectedTab === 1 ? '!bg-brand-primary !text-white' : ''}`} onClick={() => setSelectedTab(1)}>Live-Event</Button>
                <Button className={`btn !py-5 rounded-full !font-bold text-lg !bg-transparent !text-black !border !border-brand-primary !w-full ${selectedTab === 2 ? '!bg-brand-primary !text-white' : ''}`} onClick={() => setSelectedTab(2)}>Post-Event</Button>
            </div>

            {/* Tab Content */}
            <div className='mt-28 max-w-5xl mx-auto'>
                {selectedTab === 0 &&
                    <div className='grid grid-cols-3 w-full gap-7'>
                        {preEvent.map((item, index) => (
                            <div key={index} className='p-5 bg-white/20 rounded-[10px] shadow-blur-lg flex flex-col gap-[15px]'>
                                <img src={item.icon} alt="" sizes="56px" width={56} height={56} className='!size-14' />
                                <h3 className='font-bold text-2xl'>{item.title}</h3>
                                <p className='text-base font-medium'>{item.description}</p>
                            </div>
                        ))}
                    </div>
                }
                {selectedTab === 1 &&
                    <div className='grid grid-cols-3 w-full gap-7'>
                        {liveEvent.map((item, index) => (
                            <div key={index} className='p-5 bg-white/20 rounded-[10px] shadow-blur-lg flex flex-col gap-[15px]'>
                                <img src={item.icon} alt="" sizes="56px" width={item.icon === TLS ? 154 : 56} height={56} />
                                <h3 className='font-bold text-2xl'>{item.title}</h3>
                                <p className='text-base font-medium'>{item.description}</p>
                            </div>
                        ))}
                    </div>
                }
                {selectedTab === 2 &&
                    <div className='grid grid-cols-3 w-full gap-7'>
                        {postEvent.map((item, index) => (
                            <div key={index} className='p-5 bg-white/20 rounded-[10px] shadow-blur-lg flex flex-col gap-[15px]'>
                                <img src={item.icon} alt="" sizes="56px" width={56} height={56} />
                                <h3 className='font-bold text-2xl'>{item.title}</h3>
                                <p className='text-base font-medium'>{item.description}</p>
                            </div>
                        ))}
                    </div>
                }
            </div>
        </div>
    )
}

export default Features;
