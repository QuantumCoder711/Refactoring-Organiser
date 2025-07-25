import { Separator } from '@/components/ui/separator';
import React from 'react'

import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from '@/components/ui/button';
import AppQr from '@/assets/download-app-qr.png';
import AppleStore from '@/components/AppleStore';
import GooglePlay from '@/components/GooglePlay';

const Careers: React.FC = () => {
    return (
        <div className="min-h-screen w-full flex flex-col">
            <div className="max-w-6xl mx-auto my-10 w-full">
                <h1 className="text-7xl text-center font-bold text-black">Join Klout Club Team</h1>
            </div>

            <p className="text-center">Looking for a job where you can help make business networking truly transformational? <br />
                <span className="font-semibold">You're in the right place!</span></p>

            <Separator className="bg-brand-dark max-w-6xl mx-auto my-10" />


            <h3 className="font-semibold text-3xl text-center">Open Positions</h3>

            <div className="max-w-3xl border-b border-black mx-auto my-10 w-full flex flex-col gap-5">
                <Accordion type="single" collapsible defaultValue='item-growth-research'>
                    <AccordionItem className='border-b border-black' value="item-growth-research">
                        <AccordionTrigger className="cursor-pointer hover:no-underline text-xl">
                            Partnership Specialist
                        </AccordionTrigger>
                        <AccordionContent className="text-lg space-y-6">
                            <div>
                                <h4 className="mb-2">Are you fascinated by user behavior, obsessed with conversion funnels, and love turning chaos into growth?</h4>
                                <p>At <span className="font-semibold">Klout Club</span>, we're looking for a curious, analytical, action-oriented generalist who thrives at the intersection of user research, experimentation, and product growth.</p>
                            </div>
                            <div>
                                <h5 className="font-semibold text-xl mb-2">Who You Are</h5>
                                <ul className="list-disc pl-6 space-y-2">
                                    <li>1-2 years of experience in product, growth, research, or analytics.</li>
                                    <li>Curious about why users behave the way they do — not just what they click.</li>
                                    <li>Comfortable moving from user interviews to A/B tests to insight decks in a day.</li>
                                    <li>Blend empathy of a researcher with the hustle of a growth marketer.</li>
                                    <li>See growth as a system, not a hack.</li>
                                    <li>Love storytelling as much as data crunching.</li>
                                </ul>
                            </div>
                            <div>
                                <h5 className="font-semibold text-xl mb-2">What You'll Do</h5>
                                <ul className="list-disc pl-6 space-y-2">
                                    <li>
                                        <span className="font-semibold">User Discovery</span>
                                        <ul className="list-disc pl-6">
                                            <li>Talk to users, run surveys/tests, map the Pro upgrade journey.</li>
                                            <li>Share clear, actionable insights that inspire product and marketing.</li>
                                        </ul>
                                    </li>
                                    <li>
                                        <span className="font-semibold">Experiments</span>
                                        <ul className="list-disc pl-6">
                                            <li>Run A/B, pricing, and messaging tests.</li>
                                            <li>Validate what works (and what doesn't) fast.</li>
                                        </ul>
                                    </li>
                                    <li>
                                        <span className="font-semibold">Insights</span>
                                        <ul className="list-disc pl-6">
                                            <li>Analyze behavior patterns, cohorts, funnels.</li>
                                            <li>Maintain evolving user personas and journeys.</li>
                                        </ul>
                                    </li>
                                    <li>
                                        <span className="font-semibold">Product & Marketing</span>
                                        <ul className="list-disc pl-6">
                                            <li>Influence feature priorities and onboarding flows.</li>
                                            <li>Craft user-first messaging and lifecycle campaigns.</li>
                                        </ul>
                                    </li>
                                </ul>
                            </div>
                            <div>
                                <h5 className="font-semibold text-xl mb-2">What You Bring</h5>
                                <ul className="list-disc pl-6 space-y-2">
                                    <li>1-2 years of hands-on experience in research, product, or growth roles.</li>
                                    <li>Strong curiosity and empathy - must have.</li>
                                    <li>Experience with interviews, surveys, or usability tests.</li>
                                    <li>Comfortable with both qualitative and quantitative data.</li>
                                    <li>Familiar with tools like GA, Mixpanel, Hotjar, Sheets/SQL is a plus.</li>
                                    <li>Interest in behavioral psychology, growth strategy, or retention.</li>
                                </ul>
                            </div>
                            <div>
                                <h5 className="font-semibold text-xl mb-2">Ideal For</h5>
                                <ul className="list-disc pl-6 space-y-2">
                                    <li>Early-career professionals ready to wear multiple hats.</li>
                                    <li>People who love solving real user problems.</li>
                                    <li>Those who believe “build it and they will come” is a myth — and want to understand why they come, or don't.</li>
                                </ul>
                            </div>
                            <div>
                                <h5 className="font-semibold text-xl mb-2">Why Klout Club?</h5>
                                <p><span className="font-semibold">Klout Club</span> is the world's largest cricket network with <span className="font-semibold">40+ million users</span>, empowering grassroots cricketers through the power of data. If you're ready to turn insights into impact — join us.</p>
                                <ul className="list-disc pl-6 space-y-1 mt-2">
                                    <li>This is your chance to directly impact the growth of a product loved by millions.</li>
                                    <li>Work across teams, influence real decisions, and be the voice of our users.</li>
                                    <li>You'll research. You'll experiment. You'll help millions fall in love with CricHeroes Pro.</li>
                                </ul>
                                <p className="mt-4">If this excites you, kindly fill up this form:</p>
                                {/* TODO: Insert application form link/button here */}
                                <div className='text-center mt-5'>
                                    <Button className='btn'>Apply Now</Button>
                                </div>
                            </div>
                        </AccordionContent>
                    </AccordionItem>

                    <AccordionItem className='border-b border-black' value="item-qc-specialist">
                        <AccordionTrigger className="cursor-pointer hover:no-underline text-xl">
                            QC Specialist
                        </AccordionTrigger>
                        <AccordionContent className="text-lg space-y-6">

                        </AccordionContent>
                    </AccordionItem>

                    <AccordionItem className='border-b border-black' value="item-digital-marketing-specialist">
                        <AccordionTrigger className="cursor-pointer hover:no-underline text-xl">
                            Digital Marketing Specialist
                        </AccordionTrigger>
                        <AccordionContent className="text-lg space-y-6">

                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </div>

            <div className='mb-10 text-center'>
                <p>Excited to play a key role in our innings? Send your resume to <span className='font-semibold text-brand-primary'>value@klout.club</span> <br /> For other profiles, please <span className='font-semibold text-brand-primary'>click here.</span></p>
            </div>

            <Separator className="bg-brand-dark max-w-6xl mx-auto my-20" />

            <div className='space-y-4'>
                <h3 className="font-semibold text-3xl text-center">Klout Club In Numbers</h3>
                <p className='text-lg text-center'>Our journey of growth and impact.</p>

                <div className='flex gap-4 justify-center max-w-5xl mx-auto'>
                    {
                        [
                            {
                                heading: "17th Oct 2024",
                                text: "First Event Hosted"
                            },
                            {
                                heading: "100+",
                                text: "Event Held"
                            },
                            {
                                heading: "3000+",
                                text: "Active Thought Leaders"
                            },
                            {
                                heading: "25000+",
                                text: "Event Attendees"
                            },
                        ].map((item, index) => (
                            <div key={index} className='p-2 w-full rounded-lg border border-brand-dark-gray'>
                                <h4 className='text-3xl font-bold text-center'>{item.heading}</h4>
                                <p className='text-sm text-brand-dark-gray text-center mt-2'>{item.text}</p>
                            </div>
                        ))
                    }
                </div>
            </div>

            <Separator className="bg-brand-dark max-w-6xl mx-auto my-20" />

            <div>
                <h3 className="font-semibold text-3xl text-center">Join the top thought leaders and grow your network.</h3>
                <p className='text-lg text-center mt-4'>Let's chase together. Join our team and change the way cricket is played forever.</p>

                <div className='flex gap-1 mt-8 border border-brand-light-gray py-2 rounded-xl items-center justify-center text-center max-w-3xl mx-auto'>
                    Please send your resume to <span className='font-semibold text-brand-primary'>value@klout.club</span>
                </div>
            </div>


            <Separator className="bg-brand-dark max-w-6xl mx-auto my-20" />
            <div className='max-w-fit mx-auto space-y-8 mb-10'>
                <h2 className='capitalize text-center text-[40px] font-bold'>Download Available</h2>
                <div className='flex items-center gap-[30px]'>
                    <AppleStore />
                    <GooglePlay />
                </div>
                <p className='text-center'>Or scan this <strong>QR code</strong> to download the <strong>App</strong></p>
                <img src={AppQr} alt="QR code for app download" className='mx-auto'/>
            </div>
        </div>
    )
}

export default Careers;
