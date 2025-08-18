import React, { useState } from 'react';
import { Brain, ChartNetwork, Network, QrCode, RadioTower, Trophy } from 'lucide-react';

import SetupEvent from '@/assets/setup-event.png';
import InstantCheckin from '@/assets/instant-checkin.png';
import RealTimeNetwork from '@/assets/realtime-network.png';
import AiImages from '@/assets/ai-images.png';
import EventNetworking from '@/assets/event-networking.png';
import EventInsights from '@/assets/event-insights.png';

const features = [
    {
        heading: "Set Up Your Event (in Min.)",
        description: "Easily create your event page, generate a QR check-in code, and invite attendees — no tech skills needed.",
        icon: <Trophy size={50} />,
        image: SetupEvent,
    },
    {
        heading: "Instant Guest Check-In",
        description: "Guests scan the QR code to check in quickly and securely, building a live attendee list.",
        icon: <QrCode size={50} />,
        image: InstantCheckin,
    },
    {
        heading: "Real-Time Business Networking",
        description: "Guests can view who's attending and connect through private profiles during the event.",
        icon: <RadioTower size={50} />,
        image: RealTimeNetwork,
    },
    {
        heading: "Capture Professional AI Photos",
        description: "Offer free, AI-enhanced portraits to your attendees — perfect for LinkedIn, resumes, or personal keepsakes.",
        icon: <Brain size={50} />,
        image: AiImages,
    },
    {
        heading: "Keep Networking After the Event",
        description: "With Klout Club, attendees can continue connecting, messaging, and collaborating even after the event is over.",
        icon: <Network size={50} />,
        image: EventNetworking,
    },
    {
        heading: "Access Post-Event Insights",
        description: "Download full event reports, engagement stats, and Thought Leadership Scores — a unique way to recognize your most influential attendees.",
        icon: <ChartNetwork size={50} />,
        image: EventInsights,
    },
];

const Features: React.FC = () => {
    const [activeIndex, setActiveIndex] = useState<number>(0);

    return (
        <section className='p-5 mt-7 max-w-[1205px] mx-auto'>
            <h2 className='text-2xl sm:text-[40px] font-bold text-center'>How Klout Works</h2>

            <div className='mt-[66px] flex flex-row justify-center gap-5'>
                {features.map((feature, index) => (
                    <div
                        key={index}
                        className={`bg-white overflow-clip rounded-md transition-all duration-300 ease-in-out p-5 h-[500px] relative cursor-pointer
                            ${activeIndex === index ? 'max-w-[530px]' : 'max-w-[120px]'}`}
                        onClick={() => setActiveIndex(index)}
                    >
                        <div className={`flex ${activeIndex === index ? 'flex-row items-center gap-4' : 'flex-col items-center'}`}>
                            {feature.icon}
                            <h4 className={`text-xl font-semibold transition-all duration-300 ${activeIndex === index
                                    ? 'text-left'
                                    : 'text-left mt-4 writing-mode-vertical'
                                } text-nowrap`}
                                style={{
                                    writingMode: activeIndex === index ? 'horizontal-tb' : 'vertical-rl',
                                    transform: activeIndex === index ? 'none' : ''
                                }}>
                                {feature.heading}
                            </h4>
                        </div>
                        {activeIndex === index && <p className='text-sm lg:text-lg mt-5'>{feature.description}</p>}
                        {activeIndex === index && <img src={feature.image} alt={feature.heading} className='mt-5 absolute right-0 left-4' />}
                    </div>
                ))}
            </div>
        </section>
    )
}

export default Features;










































































// import React, { useState } from "react";

// const features = [
//   "Set Up Your Event (in Min.)",
//   "Instant Guest Check-In",
//   "Real-Time Business Networking",
//   "Capture Professional AI Photos",
//   "Keep Networking After the Event",
//   "Access Post-Event Insights",
// ];

// const featureDescriptions = [
//   "Easily create your event page, generate a QR check-in code, and invite attendees — no tech skills needed.",
//   "Let guests check in quickly with a QR code — no app or hardware required.",
//   "Enable instant business connections and networking during the event.",
//   "Automatically capture and deliver high-quality AI-processed professional photos.",
//   "Stay connected with attendees after the event ends through smart follow-ups.",
//   "Analyze engagement, attendance, and feedback with post-event insights.",
// ];

// export default function EventFeatureSlider() {
//   const [activeIndex, setActiveIndex] = useState(0);

//   return (
//     <div className="relative w-full p-10 h-full overflow-hidden">
//       {/* Row of small feature boxes */}
//       <div className="flex gap-6 z-10 relative">
//         {features.map((title, index) => (
//           <div
//             key={index}
//             onMouseEnter={() => setActiveIndex(index)}
//             className={`h-[698px] rounded-lg bg-white border text-xs text-center px-2 py-4 shadow transition-all duration-300 cursor-pointer flex items-center justify-center
//               ${index === activeIndex ? "w-64" : "w-20"}
//             `}
//           >
//             {title}
//           </div>
//         ))}
//       </div>

//       {/* Floating big content box */}
//       <div
//         className="absolute top-10 left-10 h-52 w-64 bg-white border p-5 rounded-lg shadow-lg transition-transform duration-500 ease-in-out z-20 pointer-events-none"
//         style={{
//           transform: `translateX(${activeIndex * 104}px)`, // 80 (w-20) + 24 (gap)
//         }}
//       >
//         <h2 className="font-semibold text-sm mb-2">
//           {features[activeIndex]}
//         </h2>
//         <p className="text-xs text-gray-700">
//           {featureDescriptions[activeIndex]}
//         </p>
//       </div>
//     </div>
//   );
// }