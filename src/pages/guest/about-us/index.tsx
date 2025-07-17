// import { Separator } from '@/components/ui/separator';
import India from "@/assets/india.svg";
import React from 'react';

const AboutUs: React.FC = () => {
    return (
        <div className='min-h-screen w-full flex flex-col'>
            {/* <div className='max-w-6xl mx-auto my-10 w-full'>
                <h1 className='text-4xl font-bold text-black'>About Us</h1>
            </div>
            <Separator className='bg-brand-dark max-w-6xl mx-auto' /> */}

            <h2 className='text-4xl font-semibold text-center mt-10'>We're not just about events. <br />
            We're about elevating human connection.</h2>
            <div className='max-w-5xl mx-auto my-10 space-y-8 text-black flex-grow'>
                <div className='space-y-4'>
                    <h2 className='text-3xl font-semibold'>Our Philosophy</h2>
                    <p className='font-semibold text-lg'>In a world flooded with business cards, Zoom fatigue, and cold LinkedIn requests, Klout Club was born with a simple idea: <span className='italic'>"What if networking could feel natural again?"</span></p>
                    <p>We're a bunch of product nerds, event lovers, and data dreamers who believe real conversations happen not just on stage—but in hallways, food lines, and coffee breaks.</p>
                </div>

                <div className='space-y-4'>
                    <h2 className='text-3xl font-semibold'>What We Do</h2>
                    <ul className='list-disc pl-6 space-y-2'>
                        <li>One-tap QR check-ins (goodbye Excel chaos)</li>
                        <li>Live attendee lists (meet who's actually in the room)</li>
                        <li>AI-powered photos + summaries (because memories matter)</li>
                        <li>Thought Leadership Scores (yes, you're kind of a big deal)</li>
                        <li>Networking that works (talk to people worth talking to)</li>
                    </ul>
                </div>

                <div className='space-y-4'>
                    <h2 className='text-3xl font-semibold'>Thought Leadership Score (TLS)</h2>
                    <p>TLS is your professional influence—quantified. It's based on your job title, industry relevance, event engagement, and networking behaviour.</p>
                    <ul className='list-disc pl-6 space-y-2'>
                        <li>Stand out in event settings</li>
                        <li>Attract more meaningful networking</li>
                        <li>Showcase your TLS badge on LinkedIn or your resume</li>
                        <li>Know your rank in a room full of decision-makers</li>
                    </ul>
                    <p className='italic'>It's not about clout. It's about real-world credibility.</p>
                </div>

                <div className='space-y-4'>
                    <h2 className='text-3xl font-semibold'>Why We Exist</h2>
                    <p>We believe business networking is broken. Too formal. Too fake. Too forced.</p>
                    <p>We're here to build a world where people connect based on shared value, not shared Wi-Fi. Where events become launchpads for partnerships, ideas, and unexpected friendships.</p>
                </div>

                <div className='space-y-4'>
                    <h2 className='text-3xl font-semibold'>Who We Are</h2>
                    <ul className='list-disc pl-6 space-y-2'>
                        <li>Used by professionals across cities, campuses & communities</li>
                        <li>Backed by real-time feedback, not VC slides</li>
                        <li>Proudly independent and passionate about design</li>
                        <li>We might be a tech platform, but at heart—we're a people platform.</li>
                    </ul>
                </div>

                <img src={India} alt="Make in India" sizes='131px' className='mx-auto my-4' />
            </div>
        </div>
    )
}

export default AboutUs;
