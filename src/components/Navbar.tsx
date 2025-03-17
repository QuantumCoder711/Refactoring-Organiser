import React from 'react';
import Logo from '../assets/logo.png';
import InsightnerLogo from '/insightnerLogo.svg';
import { Button } from '@/components/ui/button';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { UserAvatar } from '@/constants';

interface NavbarProps {
  isAuthenticated: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ isAuthenticated }) => {
  return (
    !isAuthenticated ?
      <header>
        <nav className='w-full flex justify-between items-center'>
          <img src={Logo} alt="logo" />
        </nav>
      </header>
      :
      <header className='flex items-center bg-brand-background max-h-16'>
        <div className='border-r border-b border-white min-w-52 lg:min-w-56 max-h-16 grid place-content-center !p-3'>
          <img src={InsightnerLogo} alt="logo" className='h-14 object-contain object-center' />
        </div>
        <nav className='w-full h-full flex justify-between items-center p-3 md:px-5 lg:px-10'>
          <h2 className='text-xl font-semibold'>Dashboard</h2>
          <ul className='flex gap-5 items-center'>
            <li>
              <Button className='bg-brand-secondary text-white font-semibold rounded-full h-6 hover:bg-brand-secondary/90 duration-300 cursor-pointer'>Create New Event</Button>
            </li>
            <li className='flex gap-2 items-center'>
              <Avatar className='w-10 h-10'>
                <AvatarImage src={UserAvatar} alt="User" />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
              <span className='font-semibold text-sm'>John Doe</span>
            </li>
          </ul>
        </nav>
      </header>
  )
}

export default Navbar;
