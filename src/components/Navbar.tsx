import React, { useEffect } from 'react';
import Logo from '@/assets/logo.svg';
import WhiteLogo from '@/assets/white_logo.png';
import { Button } from '@/components/ui/button';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { navbarLinks, sidebarItems, UserAvatar } from '@/constants';
import { Link, useLocation } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import useAuthStore from '@/store/authStore';
import { useNavigate } from 'react-router-dom';
import { getImageUrl } from '@/lib/utils';

import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { AlignRight } from 'lucide-react';

interface NavbarProps {
  isAuthenticated: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ isAuthenticated }) => {
  const navigate = useNavigate();
  const { logout } = useAuthStore();
  const user = useAuthStore(state => state.user);
  const location = useLocation();
  const { pathname } = location;
  const [heading, setHeading] = React.useState<string>('');

  useEffect(() => {
    const label = sidebarItems.find(item => item.path === pathname)?.label;
    const segments = pathname.split('/');
    if (segments.length === 2) {
      setHeading(label || pathname.split('/')[pathname.split('/').length - 1]
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
      );

    } else {
      setHeading(label || pathname.split('/')[pathname.split('/').length - 2]
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
      );
    }
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  }

  return (
    !isAuthenticated ?
      <header className={`flex justify-between p-3 ${location.pathname === "/organiser/event" ? 'bg-black/10 backdrop-blur-xs absolute top-0 left-0 right-0 z-50 text-white' : ''}`}>
        <nav className='w-full flex justify-between items-center'>
          <Link to="/">
            <img width={152} src={location.pathname === "/organiser/event" ? WhiteLogo : Logo} alt="logo" />
          </Link>

          <ul className='hidden sm:flex gap-7 items-center'>
            {
              navbarLinks.map((link, index) => (
                <li key={index}>
                  {link.path === "/organiser/login" ?
                    <Link to={link.path} className='px-4 py-2.5 rounded-full border border-black'>Organiser Login</Link> :
                    <Link to={link.path}>{link.label}</Link>
                  }
                </li>
              ))
            }
          </ul>

          {/* Hamburger Menu */}
          <div className='sm:hidden'>
            <Drawer direction='right'>
              <DrawerTrigger asChild>
                <Button className='cursor-pointer'><AlignRight size={24} /></Button>
              </DrawerTrigger>
              <DrawerContent>
                <DrawerHeader>
                  <DrawerTitle>Are you absolutely sure?</DrawerTitle>
                  <DrawerDescription>This action cannot be undone.</DrawerDescription>
                </DrawerHeader>
                <DrawerFooter>
                  <Button>Submit</Button>
                  <DrawerClose asChild>
                    <Button variant="outline">Cancel</Button>
                  </DrawerClose>
                </DrawerFooter>
              </DrawerContent>
            </Drawer>
          </div>

        </nav>
      </header>
      :
      <header className='flex items-center bg-brand-background max-h-16'>
        <Link to="/">
          <div className='border-r border-b border-white min-w-52 lg:min-w-56 max-h-16 grid place-content-center !p-3'>
            <img src={user?.company_logo ? getImageUrl(user?.company_logo) : Logo} alt="logo" className='h-14 object-contain object-center' />
          </div>
        </Link>
        <nav className='w-full h-full flex justify-between items-center p-3 md:px-5 lg:px-10'>
          <h2 className='text-xl font-semibold'>{heading}</h2>
          <ul className='flex gap-5 items-center'>
            <li>
              <Link to={`/search-people`}>
                <Button className='btn-rounded !px-3'>Search People</Button>
              </Link>
            </li>
            <li>
              <Link to={"/add-event"}>
                <Button className='btn-rounded !px-3'>Create New Event</Button>
              </Link>
            </li>
            <li className=''>
              <DropdownMenu>
                <DropdownMenuTrigger className='flex gap-2 items-center cursor-pointer focus:outline-none'>
                  <Avatar className='w-10 h-10'>
                    <AvatarImage src={user?.image ? getImageUrl(user?.image) : UserAvatar} alt="User" />
                    <AvatarFallback>CN</AvatarFallback>
                  </Avatar>
                  <span className='font-semibold text-sm'>{user?.first_name + ' ' + user?.last_name}</span>
                </DropdownMenuTrigger>
                <DropdownMenuContent className='w-40'>
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <Link to="/profile">
                    <DropdownMenuItem className='cursor-pointer'>Profile</DropdownMenuItem>
                  </Link>
                  {/* <DropdownMenuItem className='cursor-pointer'>Billing</DropdownMenuItem>
                  <DropdownMenuItem className='cursor-pointer'>Team</DropdownMenuItem>
                  <DropdownMenuItem className='cursor-pointer'>Subscription</DropdownMenuItem> */}
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