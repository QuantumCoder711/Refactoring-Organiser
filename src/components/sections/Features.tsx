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
        <section className='px-3 sm:px-6 lg:px-8 py-4 max-w-[1205px] mx-auto'>
            <h2 className='text-xl sm:text-2xl lg:text-[40px] font-bold text-center text-gray-900 dark:text-white'>
                How Klout Works
            </h2>

            {/* Mobile: Vertical Stack */}
            <div className='mt-6 lg:mt-[66px] flex flex-col lg:flex-row justify-center gap-3 lg:gap-5'>
                {features.map((feature, index) => (
                    <div
                        key={index}
                        className={`overflow-hidden rounded-xl transition-all duration-300 ease-in-out relative cursor-pointer shadow-lg border border-gray-200 dark:border-gray-700
                            ${activeIndex === index 
                                ? 'w-full lg:max-w-[530px] h-auto lg:h-[500px] bg-white dark:bg-gray-800' 
                                : 'w-full lg:max-w-[120px] h-16 lg:h-[500px] bg-gray-100 dark:bg-gray-900 hover:bg-gray-200 dark:hover:bg-gray-800'
                            }`}
                        onClick={() => setActiveIndex(index)}
                    >
                        {/* Mobile Layout */}
                        <div className='lg:hidden flex items-center gap-3 p-3'>
                            <div className='flex-shrink-0'>
                                {React.cloneElement(feature.icon, { 
                                    size: activeIndex === index ? 32 : 28,
                                    className: activeIndex === index 
                                        ? 'text-blue-600 dark:text-blue-400' 
                                        : 'text-gray-600 dark:text-gray-400'
                                })}
                            </div>
                            <div className='flex-1 min-w-0'>
                                <h4 className={`font-semibold truncate ${
                                    activeIndex === index 
                                        ? 'text-base text-gray-900 dark:text-white' 
                                        : 'text-sm text-gray-700 dark:text-gray-300'
                                }`}>
                                    {feature.heading}
                                </h4>
                                {activeIndex === index && (
                                    <p className='text-xs mt-1 text-gray-600 dark:text-gray-300 leading-relaxed'>
                                        {feature.description}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Desktop Layout */}
                        <div className={`hidden lg:flex ${activeIndex === index ? 'flex-row items-start gap-4 p-5' : 'flex-col items-center justify-center h-full p-4'}`}>
                            {React.cloneElement(feature.icon, {
                                size: 50,
                                className: activeIndex === index 
                                    ? 'text-blue-600 dark:text-blue-400' 
                                    : 'text-gray-600 dark:text-gray-400'
                            })}
                            <h4 
                                className={`font-semibold transition-all duration-300 ${
                                    activeIndex === index
                                        ? 'text-left text-xl text-gray-900 dark:text-white'
                                        : 'text-left mt-4 writing-mode-vertical text-gray-700 dark:text-gray-300 text-lg'
                                } text-nowrap`}
                                style={{
                                    writingMode: activeIndex === index ? 'horizontal-tb' : 'vertical-rl',
                                    transform: activeIndex === index ? 'none' : 'rotate(180deg)'
                                }}
                            >
                                {feature.heading}
                            </h4>
                        </div>

                        {/* Desktop Description */}
                        {activeIndex === index && (
                            <p className='hidden lg:block text-lg mt-5 px-5 text-gray-600 dark:text-gray-300'>
                                {feature.description}
                            </p>
                        )}

                        {/* Desktop Image */}
                        {activeIndex === index && (
                            <img 
                                src={feature.image} 
                                alt={feature.heading} 
                                className='hidden lg:block mt-5 absolute bottom-5 right-0 left-5 max-w-[80%] rounded-lg'
                            />
                        )}

                        {/* Mobile Image - Show below content */}
                        {activeIndex === index && (
                            <img 
                                src={feature.image} 
                                alt={feature.heading} 
                                className='lg:hidden mt-3 w-full max-w-[320px] mx-auto rounded-lg shadow-sm'
                            />
                        )}
                    </div>
                ))}
            </div>

            {/* Mobile Navigation Dots */}
            <div className='lg:hidden flex justify-center gap-2 mt-4'>
                {features.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => setActiveIndex(index)}
                        className={`w-2 h-2 rounded-full transition-colors ${
                            activeIndex === index 
                                ? 'bg-blue-600' 
                                : 'bg-gray-300 dark:bg-gray-600'
                        }`}
                        aria-label={`Go to feature ${index + 1}`}
                    />
                ))}
            </div>
        </section>
    );
};

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