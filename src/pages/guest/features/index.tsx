import Linea from '@/components/Linea';
import { Button } from '@/components/ui/button';
import React, { useRef, useState } from 'react';
import OpenMail from "@/assets/open-mail.svg";
import Contact from "@/assets/contact.svg";
import EventsCheck from "@/assets/EventsCheck.svg";
import LaptopContact from "@/assets/laptop-contact.svg";
import TLS from "@/assets/tls.svg";
import QRCodeLive from "@/assets/qr-code-live.svg";
import BadgeContact from "@/assets/badge-contact.svg";
import SpeakersInfo from "@/assets/speakers-info.svg";
import SessionReminders from "@/assets/session-reminders.svg";
import SendPoll from "@/assets/send-poll.svg";
import FeedbackReports from "@/assets/feedback-reports.svg";
import EngagementAnalytics from "@/assets/engagement-analytics.svg";
import SessionPerformanceReport from "@/assets/session-performance-report.svg";
import ConnectionSummary from "@/assets/connection-summary.svg";
import ROIDashboards from "@/assets/roi-dashboards.svg";
import { toast } from 'sonner';
import { CircleCheck, CircleX } from 'lucide-react';
import axios from 'axios';
import { domain } from '@/constants';

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
        title: "QR Code Check-in",
        description: "Create and send personalized messaging",
        icon: QRCodeLive
    },
    {
        title: "Badge Printing",
        description: "Seamlessly import of contacts for invites",
        icon: BadgeContact
    },
    {
        title: "Speakers info",
        description: "Dynamic Event pages that validate attendee interest",
        icon: SpeakersInfo
    },
    {
        title: "Session Reminders",
        description: "Automated Multi-channel communication sequences",
        icon: SessionReminders
    },
    {
        title: "Send Poll",
        description: "Track and measure influence and engagement metrics",
        icon: SendPoll
    }
];

const postEvent = [
    {
        title: "Collect Feedback Reports",
        description: "Analyze attendee feedback on sessions",
        icon: FeedbackReports
    },
    {
        title: "Engagement Analytics",
        description: "Measure attendee engagement metrics",
        icon: EngagementAnalytics
    },
    {
        title: "Session Performance Report",
        description: "Evaluate session performance and attendee engagement",
        icon: SessionPerformanceReport
    },
    {
        title: "Connection Summary",
        description: "Summarize the new connections made during the event",
        icon: ConnectionSummary
    },
    {
        title: "ROI Dashboards",
        description: "Visualize and measure event success and ROI",
        icon: ROIDashboards
    }
];

const Features: React.FC = () => {
    const formRef = useRef<HTMLDivElement>(null);
    const [formData, setFormData] = useState({
        name: "",
        subject: "",
        phone: "",
        email: "",
        message: "",
    });

    const scrollToForm = () => {
        formRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSubmit = async () => {
        if (!formData.name || !formData.subject || !formData.phone || !formData.email || !formData.message) {
            toast("Please fill in all required fields", {
                className: "!bg-red-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
                icon: <CircleX className='size-5' />
            });
            return;
        }

        try {
            const response = await axios.post(`${domain}/api/contact-us`, formData, {
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (response.data.status === 422) {
                toast(response.data.error.email, {
                    className: "!bg-red-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
                    icon: <CircleX className='size-5' />
                });
            }

            if (response.data.status === 200) {
                setFormData({
                    name: "",
                    subject: "",
                    phone: "",
                    email: "",
                    message: "",
                });
                toast(response.data.message || "Message sent successfully", {
                    className: "!bg-green-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
                    icon: <CircleCheck className='size-5' />
                });
            }
        } catch (error) {
            toast("Failed to send message", {
                className: "!bg-red-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
                icon: <CircleX className='size-5' />
            });
        }
    };

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
                                <img src={item.icon} alt="" sizes="56px" width={item.icon === TLS ? 128 : 56} height={56} />
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

            <div className='w-fit mx-auto mt-10'>
                <Button onClick={scrollToForm} className='btn btn-primary !px-6 !py-3 cursor-pointer'>Many More...</Button>
            </div>

            {/* Klout Club In Action */}
            <div className='p-20 mt-28 bg-black relative w-full text-white'>
                <h1 className="font-sf-pro font-bold max-w-5xl mx-auto text-[55px] leading-[60px] text-center">
                    Klout Club In Action
                </h1>
                <p className='text-center my-4'>Watch how leading event organisers are transforming their events with our platform</p>
                <iframe className="w-[800px] h-[450px] mx-auto aspect-video" src="https://www.youtube.com/embed/FV7SnaNA5jI?si=Gm52LIuBuK6E4iCk" title="YouTube video player" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen></iframe>
            </div>

            <h3 className='text-center mt-10 font-bold text-4xl'>Ready to transform your events?</h3>
            <p className='text-center text-lg mt-3'>Join 1000+ event organisers wo trust Klout Club</p>


            {/* Form */}
            <div className="mt-12 max-w-2xl mx-auto bg-white rounded-2xl shadow-lg p-8" ref={formRef} id="contact-form">
                <h4 className='text-[30px] font-bold mb-4 text-center'>Get in Touch</h4>
                <p className='text-[18px] font-medium leading-[25px] mb-8 mx-auto text-center'>Contact our team to discover how we can help make your event a success!</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Name Field */}
                    <div className="space-y-2">
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                            Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                            placeholder="Enter your name"
                        />
                    </div>
                    {/* Email Field */}
                    <div className="space-y-2">
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                            Email <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                            placeholder="Enter your email"
                        />
                    </div>
                    {/* Phone Field */}
                    <div className="space-y-2">
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                            Phone <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="tel"
                            id="phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                            placeholder="Enter your phone number"
                        />
                    </div>
                    {/* Subject Field */}
                    <div className="space-y-2">
                        <label htmlFor="subject" className="block text-sm font-medium text-gray-700">
                            Subject <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            id="subject"
                            name="subject"
                            value={formData.subject}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                            placeholder="What is this regarding?"
                        />
                    </div>
                </div>
                {/* Message Field */}
                <div className="mt-6 space-y-2">
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                        Your Message <span className="text-red-500">*</span>
                    </label>
                    <textarea
                        id="message"
                        name="message"
                        rows={4}
                        value={formData.message}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                        placeholder="Tell us about your event needs..."
                    ></textarea>
                </div>
                {/* Submit Button */}
                <div className="mt-8">
                    <button
                        type="button"
                        onClick={handleSubmit}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                        Send Message
                    </button>
                </div>
                <p className="mt-4 text-sm text-gray-500 text-center">
                    We'll get back to you within 24 hours
                </p>
            </div>
        </div>
    )
}

export default Features;
