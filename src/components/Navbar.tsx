import React, { useEffect } from 'react';
import Logo from '@/assets/logo.svg';
import InsightnerLogo from '@/assets/insightnerLogo.svg';
import { Button } from '@/components/ui/button';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { UserAvatar } from '@/constants';
import { Link, useLocation } from 'react-router-dom';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import useAuthStore from '@/store/authStore';
import { useNavigate } from 'react-router-dom';
import { getImageUrl } from '@/lib/utils';

interface NavbarProps {
  isAuthenticated: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ isAuthenticated }) => {
  const navigate = useNavigate();
  const { logout } = useAuthStore();
  const user = useAuthStore(state => state.user);
  const location = useLocation();

  useEffect(() => {
    
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  }

  return (
    !isAuthenticated ?
      <header className='flex justify-between p-3'>
        <nav className='w-full flex justify-between items-center'>
          <Link to="/">
            <img src={Logo} alt="logo" />
          </Link>

          <ul className='flex gap-5 items-center'>
            <li>
              <Link to="#">Explore Events</Link>
            </li>
            <li>
              <Link to="/login">Login</Link>
            </li>
          </ul>
        </nav>
      </header>
      :
      <header className='flex items-center bg-brand-background max-h-16'>
        <div className='border-r border-b border-white min-w-52 lg:min-w-56 max-h-16 grid place-content-center !p-3'>
          <img src={user?.company_logo ? getImageUrl(user?.company_logo) : InsightnerLogo} alt="logo" className='h-14 object-contain object-center' />
        </div>
        <nav className='w-full h-full flex justify-between items-center p-3 md:px-5 lg:px-10'>
          <h2 className='text-xl font-semibold'>Dashboard</h2>
          <ul className='flex gap-5 items-center'>
            <li>
              <Button className='btn-rounded !px-3'>Create New Event</Button>
            </li>
            <li className=''>
              <DropdownMenu>
                <DropdownMenuTrigger className='flex gap-2 items-center cursor-pointer focus:outline-none'>
                  <Avatar className='w-10 h-10'>
                    <AvatarImage src={UserAvatar} alt="User" />
                    <AvatarFallback>CN</AvatarFallback>
                  </Avatar>
                  <span className='font-semibold text-sm'>John Doe</span>
                </DropdownMenuTrigger>
                <DropdownMenuContent className='w-40'>
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className='cursor-pointer'>Profile</DropdownMenuItem>
                  <DropdownMenuItem className='cursor-pointer'>Billing</DropdownMenuItem>
                  <DropdownMenuItem className='cursor-pointer'>Team</DropdownMenuItem>
                  <DropdownMenuItem className='cursor-pointer'>Subscription</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className='cursor-pointer !text-destructive'>Logout</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </li>
          </ul>
        </nav>
      </header>
  )
}

export default Navbar;