import React from 'react';
import Logo from '../assets/logo.png';
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
      <header className='flex items-center bg-brand-background'>
        {/* <div className='border-r-2 border-b-2 border-white h-12 p-3 w-60'>
          <img src={Logo} alt="logo" className='filter invert mx-auto border-2 border-teal-400' />
        </div> */}
        <nav className='w-full h-full flex justify-between items-center p-3'>
          <h2 className='text-xl font-semibold'>Dashboard</h2>
          <ul className='flex gap-5 items-center'>
            <li>
              <Button className='bg-brand-secondary text-white font-semibold rounded-full hover:bg-brand-secondary/90 duration-300 cursor-pointer'>Create New Event</Button>
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
