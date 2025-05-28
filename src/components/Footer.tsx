import React from 'react';
import { Link } from "react-router-dom";
import Facebook from "@/assets/social-media/facebook.svg"
import Twitter from "@/assets/social-media/twitter.svg"
import Linkedin from "@/assets/social-media/linkedIn.svg"
import Instagram from "@/assets/social-media/instagram.svg"
import LogoFullWhite from "@/assets/logo-full-white.svg";
import LogoWhite from "@/assets/logo-white.svg";
import FooterBg from "@/assets/footerbg.png";
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import AppleStore from './AppleStore';
import GooglePlay from './GooglePlay';
import AwsSsl from "@/assets/aws-ssl.png";
import { HeartIcon } from 'lucide-react';

interface FooterProps {
    type?: "styled" | "basic";
}

const Footer: React.FC<FooterProps> = ({ type = "basic" }) => {

    const currentYear = new Date().getFullYear();

    const footerLinks = [
        {
            title: "Product",
            links: [
                "Features",
                "Pricing",
                "Integrations",
                "API",
                "Security",
                "Support"
            ]
        },
        {
            title: "Company",
            links: [
                "About Us",
                "Careers",
                "Blog",
                "Press",
                "Contact Us"
            ]
        },
        {
            title: "Resources",
            links: [
                "Documentation",
                "Community",
                "Tutorials",
                "FAQs"
            ]
        }
    ];

    return (
        type === "basic" ? <footer className='flex items-center justify-between p-3'>
            <img width={80} height={25} src={LogoFullWhite} className='invert' alt="logo" />

            <div className=''>
                <p className='flex gap-1 items-center font-light text-xs text-brand'>Copyright &copy; {currentYear} - {(currentYear + 1).toString().slice(2)} All rights reserved | The Klout Club is made with <HeartIcon className='w-4 h-4 stroke-1' /></p>
                <p className='flex gap-2 items-center justify-center font-light text-xs text-brand'>
                    <Link to="/privacy-policy" className='underline'>Privacy Policy</Link>
                    <span className='text-brand'>|</span>
                    <Link to="/terms-and-conditions" className='underline'>Terms and Conditions</Link>
                    <span className='text-brand'>|</span>
                    <Link to="/refund-policy" className='underline'>Refund Policy</Link>
                    <span className='text-brand'>|</span>
                    <Link to="/faq" className='underline'>FAQ</Link>
                </p>
            </div>

            <div className='flex items-center gap-4'>
                <Link target='_blank' to="https://www.facebook.com/thekloutclub">
                    <img src={Facebook} alt="facebook" />
                </Link>
                <Link to="https://twitter.com/thekloutclub">
                    <img src={Twitter} alt="twitter" />
                </Link>
                <Link to="https://www.linkedin.com/company/klout-club">
                    <img src={Linkedin} alt="linkedin" />
                </Link>
                <Link to="https://www.instagram.com/klout_club">
                    <img src={Instagram} alt="instagram" />
                </Link>
            </div>
        </footer> :
            <footer className='w-full' style={{ backgroundImage: `url(${FooterBg})`, backgroundSize: "cover", backgroundPosition: "center" }}>
                <div className='max-w-7xl flex mx-auto gap-40 p-5 py-10'>
                    <div className='flex flex-col gap-[60px] w-1/2'>
                        <img src={LogoWhite} alt="logo" className='w-[200px] h-[50px]' />
                        <div className='bg-white rounded-full h-16 relative w-[503px]'>
                            <Input placeholder='Enter your email address' className='bg-white focus-visible:ring-0 absolute top-0 left-0 !pl-3 !text-xl !h-full rounded-full outline-none border-none' />
                            <Button className='absolute btn top-0 right-0 !h-full !w-[172px] !text-xl rounded-full'>Subscribe</Button>
                        </div>
                        <div className='flex items-center gap-10 invert'>
                            <AppleStore />
                            <GooglePlay />
                        </div>
                        <img src={AwsSsl} width={220} alt="AWS SSL" />
                    </div>

                    <div className='w-full flex justify-between items-center text-xl text-brand-light-gray'>

                        <div className='flex justify-between w-full'>
                            {footerLinks.map((item, index) => (
                                <div key={index}>
                                    <h5 className='text-xl font-semibold text-white mb-8'>{item.title}</h5>

                                    <ul>
                                        {item.links.map((link, linkIndex) => (
                                            <li key={linkIndex} className='text-white text-base font-light my-2'>
                                                <Link to="#">{link}</Link>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className='flex items-center justify-between text-white p-3'>
                    <img width={80} height={25} src={LogoFullWhite} alt="logo" />

                    <div className=''>
                        <p className='flex gap-1 items-center font-light text-xs text-brand'>Copyright &copy; {currentYear} - {(currentYear + 1).toString().slice(2)} All rights reserved | The Klout Club is made with <HeartIcon className='w-4 h-4 stroke-1' /></p>
                        <p className='flex gap-2 items-center justify-center font-light text-xs text-brand'>
                            <Link to="/privacy-policy" className='underline'>Privacy Policy</Link>
                            <span className='text-brand'>|</span>
                            <Link to="/terms-and-conditions" className='underline'>Terms and Conditions</Link>
                            <span className='text-brand'>|</span>
                            <Link to="/refund-policy" className='underline'>Refund Policy</Link>
                            <span className='text-brand'>|</span>
                            <Link to="/faq" className='underline'>FAQ</Link>
                        </p>
                    </div>

                    <div className='flex items-center gap-4 invert'>
                        <Link to="https://www.facebook.com/thekloutclub">
                            <img src={Facebook} alt="facebook" />
                        </Link>
                        <Link to="https://twitter.com/thekloutclub">
                            <img src={Twitter} alt="twitter" />
                        </Link>
                        <Link to="https://www.linkedin.com/company/klout-club">
                            <img src={Linkedin} alt="linkedin" />
                        </Link>
                        <Link to="https://www.instagram.com/klout_club">
                            <img src={Instagram} alt="instagram" />
                        </Link>
                    </div>
                </div>
            </footer>
    )
}

export default Footer;