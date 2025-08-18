import React from 'react';
import Qrcode from "@/assets/blue-qr.svg";
import Attendence from "@/assets/attendence.svg";
import AiPhoto from "@/assets/ai-photo.svg";
import BlueNetwork from "@/assets/blue-network.svg";
import Tls from "@/assets/tls.svg";
import SessionReports from "@/assets/session-reports.svg";
import { ArrowRight } from 'lucide-react';

const ToolsSection: React.FC = () => {

    const toolsData = [
        {
            image: Qrcode,
            heading: "Instant QR Check-in",
            paragraph: "Skip the long lines — guests check in easily via a QR scan.",
            link: "#",
        },
        {
            image: Attendence,
            heading: "Live Attendee List",
            paragraph: "See who's attending in real time and foster meaningful introductions.",
            link: "#",
        },
        {
            image: AiPhoto,
            heading: "AI Event Photos",
            paragraph: "Delight attendees with stunning AI-enhanced portraits during your event.",
            link: "#",
        },
        {
            image: BlueNetwork,
            heading: "Smart Business Networking",
            paragraph: "Help guests connect during and after your event through secure profiles.",
            link: "#",
        },
        {
            image: Tls,
            heading: "Thought Leadership Score",
            paragraph: "Give attendees a way to showcase their influence and expertise — and discover rising stars.",
            link: "#",
        },
        {
            image: SessionReports,
            heading: "Post-Event Session Reports",
            paragraph: "Get full reports including attendance data, engagement insights, and downloadable lists.",
            link: "#",
        },
    ];
    
    return (
        <section className='max-w-[1205px] flex items-center flex-col justify-center mx-auto p-5'>
            <h2 className='capitalize text-center mt-14 mb-[70px] text-2xl lg:text-[40px] font-bold'>Everything you need, in one simple tool</h2>
            <div className='grid sm:grid-cols-2 lg:grid-cols-3 gap-12'>
                {toolsData.map((tool, index) => (
                    <div
                        key={index}
                        onClick={() => tool.link}
                        className="bg-brand-background shadow-blur p-6 rounded-[10px] max-h-96 cursor-pointer group flex flex-col justify-between"
                    >
                        <div className='flex flex-col gap-5'>
                            <img src={tool.image} alt={tool.heading} height={75} width={75} className='h-[75px] w-fit' />
                            <h2 className="text-2xl font-medium group-hover:text-brand-primary duration-300">{tool.heading}</h2>
                            <p className=''>{tool.paragraph}</p>
                        </div>

                        <div className='w-full flex justify-end'>
                            <div className='bg-white grid w-8 h-8 p-1.5 place-content-center rounded-full'>
                                <ArrowRight className='h-full w-full group-hover:text-brand-primary duration-300' />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    )
}

export default ToolsSection;
