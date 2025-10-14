import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import AppleStore from '@/components/AppleStore';
import GooglePlay from '@/components/GooglePlay';
import AppQr from '@/assets/download-app-qr.png';
import { Textarea } from '@/components/ui/textarea';
import { CircleCheck, CircleX } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import { domain } from '@/constants';
import { Input } from '../ui/input';

const DownloadOptions: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    phone: '',
    email: '',
    message: '',
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    if (
      !formData.name ||
      !formData.subject ||
      !formData.phone ||
      !formData.email ||
      !formData.message
    ) {
      toast('Please fill in all required fields', {
        className:
          '!bg-red-800 !text-white tracking-wide flex items-center gap-2',
        icon: <CircleX className="size-4" />,
      });
      return;
    }

    try {
      const response = await axios.post(`${domain}/api/contact-us`, formData, {
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.data.status === 422) {
        toast(response.data.error.email, {
          className: '!bg-red-800 !text-white tracking-wide flex items-center gap-2',
          icon: <CircleX className="size-4" />,
        });
      }

      if (response.data.status === 200) {
        setFormData({
          name: '',
          subject: '',
          phone: '',
          email: '',
          message: '',
        });
        toast(response.data.message || 'Message sent successfully', {
          className: '!bg-green-700 !text-white tracking-wide flex items-center gap-2',
          icon: <CircleCheck className="size-4" />,
        });
      }
    } catch (error) {
      toast('Failed to send message', {
        className: '!bg-red-800 !text-white tracking-wide flex items-center gap-2',
        icon: <CircleX className="size-4" />,
      });
    }
  };

  return (
    <section className="flex w-full max-w-[1205px] mx-auto h-full flex-col items-center gap-6 md:gap-10 my-14 px-4 sm:px-6">
      {/* Heading */}
      <h2 className="capitalize text-center text-2xl sm:text-3xl md:text-[40px] font-bold">
        Download Available
      </h2>

      {/* Store Buttons */}
      <div className="flex flex-col dark:invert sm:flex-row items-center gap-4 sm:gap-8">
        <AppleStore />
        <GooglePlay />
      </div>

      {/* QR Section */}
      <p className="text-center text-base sm:text-lg">
        Or scan this <strong>QR code</strong> to download the <strong>App</strong>
      </p>
      <img
        src={AppQr}
        alt="QR code for app download"
        className="w-32 sm:w-40 md:w-52"
      />

      {/* Contact Section */}
      <div className="mt-12 md:mt-16 flex flex-col md:flex-row items-start md:items-center gap-8 md:gap-14 w-full">
        {/* Left Info */}
        <div className="flex flex-col gap-5 sm:gap-6 w-full md:w-1/2">
          <h2 className="capitalize text-2xl sm:text-3xl md:text-[32px] font-bold leading-snug">
            Plan your next event with ease
          </h2>
          <h4 className="text-lg sm:text-xl md:text-2xl font-medium">
            Let us help you create unforgettable corporate experiences.
          </h4>
          <p className="text-sm sm:text-base md:text-lg text-accent-foreground/50">
            Whether you're organizing a roundtable, awards night, or networking
            event - we're just a message away.
          </p>
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div>
              <span className="text-sm sm:text-base font-semibold text-brand-dark-gray">
                Phone
              </span>
              <p className="text-base font-semibold">+91 96433 14331</p>
            </div>
            <div>
              <span className="text-sm sm:text-base font-semibold text-brand-dark-gray">
                Mail
              </span>
              <p className="text-base font-semibold break-words">
                value@klout.club
              </p>
            </div>
          </div>
        </div>

        {/* Right Form */}
        <div className="w-full md:w-1/2 p-5 sm:p-8 bg-accent rounded-lg shadow-md">
          <form className="flex flex-col gap-4 sm:gap-5 text-sm sm:text-base">
            {/* Input Fields */}
            {['name', 'email', 'phone', 'subject'].map((field, i) => (
              <div
                key={i}
                // className="flex items-center gap-2 border border-gray-300 rounded-md px-3 py-2 focus-within:border-brand-dark-gray transition"
              >
                <Input
                  name={field}
                  value={(formData as any)[field]}
                  onChange={handleInputChange}
                  type="text"
                  className='h-10'
                  placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                />
              </div>
            ))}

            {/* Message */}
            <div>
              <Textarea
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                rows={3}
                placeholder="Write your message..."
              />
            </div>
          </form>
          <Button
            onClick={handleSubmit}
            className='mt-5'
          >
            Send Message
          </Button>
        </div>
      </div>

      {/* Footer Text */}
      <h2 className="capitalize mt-16 md:mt-24 mb-16 md:mb-28 text-center text-base sm:text-xl md:text-2xl font-semibold leading-snug text-accent-foreground">
        Klout Club is free for basic events. Optional upgrades available for
        advanced insights and premium networking tools.
      </h2>
    </section>
  );
};

export default DownloadOptions;
