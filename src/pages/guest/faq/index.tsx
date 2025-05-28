import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import React, { useState } from 'react';

const faqData = [
    {
        category: "GENERAL",
        questions: [
            {
                question: "What is Klout Club?",
                answer: "Klout Club is a free, AI-powered event management platform that makes networking, check-ins, and post-event engagement smarter and simpler for business events, conferences, and meetups."
            },
            {
                question: "Who can use Klout Club?",
                answer: "Event organizers, community builders, corporate teams, and professionals attending business events can all benefit from Klout Club."
            },
            {
                question: "Is Klout Club really free?",
                answer: "Yes! Our core event check-in and networking features are completely free. We also offer premium upgrades for advanced features like paid ticketing and branded event experiences."
            }
        ]
    },
    {
        category: "FOR ATTENDEES",
        questions: [
            {
                question: "Do I need to download an app to use Klout Club?",
                answer: "No app needed! You can use Klout Club directly from your browser via the mobile-friendly link shared by the organizer."
            },
            {
                question: "What is the Thought Leadership Score (TLS)?",
                answer: "TLS is a dynamic score that reflects your professional influence based on your title, company, and event engagement. You can showcase it on your resume or LinkedIn."
            },
            {
                question: "How is my data used?",
                answer: "Your data is never sold. It's used only to improve your experience within the platform, such as smarter networking, profile scoring, and post-event summaries. Read our full for more details."
            },
            {
                question: "Can I download my photos from the event?",
                answer: "Yes! If the event has AI facial photo capture enabled, you'll receive a link to your private gallery."
            }
        ]
    },
    {
        category: "FOR ORGANIZERS",
        questions: [
            {
                question: "How do I set up an event on Klout Club?",
                answer: "Just visit organiser.klout.club, log in, and click \"Create Event.\" It takes less than 10 minutes to go live."
            },
            {
                question: "What are the key features for organizers?",
                answer: (
                    <ul className="list-disc pl-6 space-y-2">
                        <li>QR code check-ins</li>
                        <li>Live attendee list</li>
                        <li>Post-event session summaries</li>
                        <li>Business card-style networking</li>
                        <li>Facial photos (optional)</li>
                        <li>TLS scoring of attendees</li>
                        <li>Paid ticketing (optional)</li>
                    </ul>
                )
            },
            {
                question: "Can I customize my event page?",
                answer: "Yes, you can add your branding, event agenda, and even host multiple sessions in one event."
            },
            {
                question: "How secure is attendee data?",
                answer: "We follow strict security protocols and encryption. Only you (the event creator) have access to the attendee list. Data is not shared or sold."
            },
            {
                question: "Can I export my attendee list?",
                answer: "Yes, you can export a full CSV of check-ins and engagement stats after the event."
            }
        ]
    },
    {
        category: "PRICING & PAYMENTS",
        questions: [
            {
                question: "What's included in the free plan?",
                answer: "Everything you need for a powerful event experience: check-ins, live list, TLS scores, and basic analytics."
            },
            {
                question: "What's included in premium plans?",
                answer: "Premium includes paid ticket sales, advanced branding, analytics, and VIP audience segmentation. Custom quotes available."
            },
            {
                question: "How does ticketing work?",
                answer: "You can set up paid or free tickets within your event settings. Klout Club handles registrations, payment processing, and check-ins."
            }
        ]
    },
    {
        category: "OTHER QUESTIONS",
        questions: [
            {
                question: "How do I get support?",
                answer: "You can reach us anytime at <span className='text-brand-primary'>value@klout.club</span> or via WhatsApp on our support page."
            },
            {
                question: "Can I invite others to my event via Klout Club?",
                answer: "Yes! Each event has a unique shareable link and built-in QR code to invite attendees easily."
            },
            {
                question: "Is Klout Club GDPR compliant?",
                answer: "Yes. We respect all user privacy and data protection laws, including GDPR and Indian DPDP Act guidelines."
            }
        ]
    }
];

const FAQ: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState("");

    const highlightText = (text: string, query: string) => {
        if (!query) return text;
        const regex = new RegExp(`(${query})`, 'gi');
        return text.replace(regex, '<mark class="bg-brand-primary/20 text-brand-primary font-medium">$1</mark>');
    };

    const filteredData = faqData.map(category => ({
        ...category,
        questions: category.questions.filter(item =>
            item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (typeof item.answer === 'string' && item.answer.toLowerCase().includes(searchQuery.toLowerCase()))
        )
    })).filter(category => category.questions.length > 0);

    return (
        <div className='min-h-screen w-full flex flex-col'>
            <div className='max-w-6xl mx-auto my-10 w-full'>
                <h1 className='text-4xl font-bold text-center text-black'>Frequently Asked Questions</h1>
            </div>
            {/* <Separator className='bg-brand-dark max-w-6xl mx-auto' /> */}

            <div className='max-w-3xl w-full mx-auto space-y-8 text-black flex-grow'>
                    <p className='text-center mb-5'>Have Questions? We are here to help</p>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <Input
                        type="text"
                        placeholder="Search questions..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 py-6 text-lg border !border-gray-400"
                    />
                </div>

                {filteredData.map((category, index) => (
                    <div key={index} className="space-y-4">
                        <h2 className="text-2xl font-semibold">{category.category}</h2>
                        <Accordion type="single" collapsible className="w-full">
                            {category.questions.map((item, qIndex) => (
                                <AccordionItem 
                                    key={qIndex} 
                                    value={`item-${index}-${qIndex}`}
                                    className="border-b border-gray-800"
                                >
                                    <AccordionTrigger className="text-left font-medium !no-underline cursor-pointer text-lg">
                                        <div dangerouslySetInnerHTML={{ 
                                            __html: highlightText(item.question, searchQuery)
                                        }} />
                                    </AccordionTrigger>
                                    <AccordionContent>
                                        {typeof item.answer === 'string' ? (
                                            <div 
                                                className="text-gray-600 text-base" 
                                                dangerouslySetInnerHTML={{ 
                                                    __html: highlightText(
                                                        item.answer.replace(
                                                            'value@klout.club',
                                                            '<span class="text-brand-primary">value@klout.club</span>'
                                                        ),
                                                        searchQuery
                                                    )
                                                }} 
                                            />
                                        ) : (
                                            <div className="text-gray-600 text-base">
                                                {item.answer}
                                            </div>
                                        )}
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default FAQ; 