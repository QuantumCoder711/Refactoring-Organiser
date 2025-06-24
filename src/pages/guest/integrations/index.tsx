import React, { useState, useRef } from 'react';
import LogoGroup from '@/assets/logo-group.png';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { CircleCheck, CircleX } from 'lucide-react';
import axios from 'axios';
import { domain } from '@/constants';

const Integrations: React.FC = () => {
    const formRef = useRef<HTMLDivElement>(null);
    
    const scrollToForm = () => {
        formRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const [formData, setFormData] = useState({
        name: "",
        subject: "",
        phone: "",
        email: "",
        message: "",
    });

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

    return (
        <div className='max-w-[800px] mx-auto pb-20'>
            <h1 className='text-[55px] font-bold leading-[60px] mt-20 mx-auto text-center'>Enjoy seamless Integration, for an effortless Experience</h1>
            <p className='text-[18px] font-medium leading-[25px] mt-[15px] mx-auto text-center'>Integrate Klout Club right inside your existing tools hassle-free and share data in a seamless manner!</p>

            <div className='w-fit mx-auto mt-10'>
                <Button 
                    onClick={scrollToForm}
                    className='btn btn-primary !mx-auto !px-6 !py-3 cursor-pointer'
                >
                    Request a Demo
                </Button>
            </div>

            <h4 className='text-[30px] font-bold mt-32 text-center'>Integrations</h4>
            <img className='mt-10 mx-auto' src={LogoGroup} alt="Logo Group" />

            <p className='text-[18px] font-medium leading-[25px] mt-[115px] mx-auto text-center'>Klout Club, in tandem with most of the leading CRM and content marketing solutions, aims to increase engagement with your prospects and customers. Don’t see your systems listed here? Simply ask us, and we'll let you know if your tech stack is supported.</p>

            <h4 className='text-[30px] font-bold mt-32 text-center'>Learn more about Klout Club Integrations</h4>
            <p className='text-[18px] font-medium leading-[25px] mt-[15px] mx-auto text-center'>Get in touch with our team to discover how we can integrate with your existing workflow</p>
            
            
            <div ref={formRef} className='mt-12 max-w-2xl mx-auto bg-white rounded-2xl shadow-lg p-8' id='contact-form'>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                    {/* Name Field */}
                    <div className='space-y-2'>
                        <label htmlFor='name' className='block text-sm font-medium text-gray-700'>
                            Name <span className='text-red-500'>*</span>
                        </label>
                        <input
                            type='text'
                            id='name'
                            name='name'
                            value={formData.name}
                            onChange={handleInputChange}
                            className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200'
                            placeholder='Enter your name'
                        />
                    </div>

                    {/* Email Field */}
                    <div className='space-y-2'>
                        <label htmlFor='email' className='block text-sm font-medium text-gray-700'>
                            Email <span className='text-red-500'>*</span>
                        </label>
                        <input
                            type='email'
                            id='email'
                            name='email'
                            value={formData.email}
                            onChange={handleInputChange}
                            className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200'
                            placeholder='Enter your email'
                        />
                    </div>

                    {/* Phone Field */}
                    <div className='space-y-2'>
                        <label htmlFor='phone' className='block text-sm font-medium text-gray-700'>
                            Phone <span className='text-red-500'>*</span>
                        </label>
                        <input
                            type='tel'
                            id='phone'
                            name='phone'
                            value={formData.phone}
                            onChange={handleInputChange}
                            className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200'
                            placeholder='Enter your phone number'
                        />
                    </div>

                    {/* Subject Field */}
                    <div className='space-y-2'>
                        <label htmlFor='subject' className='block text-sm font-medium text-gray-700'>
                            Subject <span className='text-red-500'>*</span>
                        </label>
                        <input
                            type='text'
                            id='subject'
                            name='subject'
                            value={formData.subject}
                            onChange={handleInputChange}
                            className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200'
                            placeholder='What is this regarding?'
                        />
                    </div>
                </div>

                {/* Message Field */}
                <div className='mt-6 space-y-2'>
                    <label htmlFor='message' className='block text-sm font-medium text-gray-700'>
                        Your Message <span className='text-red-500'>*</span>
                    </label>
                    <textarea
                        id='message'
                        name='message'
                        rows={4}
                        value={formData.message}
                        onChange={handleInputChange}
                        className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none'
                        placeholder='Tell us about your integration needs...'
                    ></textarea>
                </div>

                {/* Submit Button */}
                <div className='mt-8'>
                    <button
                        onClick={handleSubmit}
                        className='w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
                    >
                        Send Message
                    </button>
                </div>

                <p className='mt-4 text-sm text-gray-500 text-center'>
                    We'll get back to you within 24 hours
                </p>
            </div>
        </div>
    )
}

export default Integrations;
