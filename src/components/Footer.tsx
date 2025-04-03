import React from 'react';
import logo from "@/assets/half_logo.svg";
import { Facebook, HeartIcon, Linkedin, Twitter, Instagram } from 'lucide-react';
import { Link } from "react-router-dom";

const Footer: React.FC = () => {

    const currentYear = new Date().getFullYear();

    return (
        <footer className='flex items-center justify-between p-3'>
            <img width={9} height={15} src={logo} alt="logo" />

            <div className=''>
                <p className='flex gap-1 items-center font-light text-xs text-brand'>Copyright &copy; {currentYear} - {(currentYear + 1).toString().slice(2)} All rights reserved | The Klout Club is made with <HeartIcon className='w-4 h-4 stroke-1' /></p>
                <p className='flex gap-2 items-center justify-center font-light text-xs text-brand'>
                    <Link to="#" className='underline'>Privacy Policy</Link>
                    <span className='text-brand'>|</span>
                    <Link to="#" className='underline'>Terms and Conditions</Link>
                    <span className='text-brand'>|</span>
                    <Link to="#" className='underline'>Refund Policy</Link>
                </p>
            </div>

            <div className='flex items-center gap-2'>
                <Link to="#">
                    <Facebook height={10} width={10} className='fill-black storke-white'/>
                </Link>
                <Link to="#">
                    <Twitter height={10} width={10} className='fill-black storke-white'/>
                </Link>
                <Link to="#">
                    <Linkedin height={10} width={10} className='fill-black storke-white'/>
                </Link>
                <Link to="#">
                    <Instagram height={10} width={10} className='fill-black stroke-white'/>
                </Link>
            </div>
        </footer>
    )
}

export default Footer;