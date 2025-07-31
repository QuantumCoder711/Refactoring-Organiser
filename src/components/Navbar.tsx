import React, { useEffect, useRef } from 'react';
import Logo from '@/assets/logo.svg';
import WhiteLogo from '@/assets/white_logo.png';
import { Button } from '@/components/ui/button';
import Coins from '@/assets/coins.svg';
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
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { AlignRight, Plus, Search } from 'lucide-react';

interface ProgressRingProps {
  percentage: number;
  size?: number;
}

const ProgressRing: React.FC<ProgressRingProps> = ({ percentage, size = 72 }) => {
  const strokeWidth = 4;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <svg width={size} height={size} className='-rotate-90'>
      <circle
        stroke='#E5E5EA'
        strokeWidth={strokeWidth}
        fill='transparent'
        r={radius}
        cx={size / 2}
        cy={size / 2}
      />
      <circle
        stroke='#2563EB'
        strokeWidth={strokeWidth}
        fill='transparent'
        r={radius}
        cx={size / 2}
        cy={size / 2}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap='round'
      />
    </svg>
  );
};

const formatNumber = (value: number): string => {
  return new Intl.NumberFormat('en-US').format(value);
};

interface NavbarProps {
  isAuthenticated: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ isAuthenticated }) => {
  const navigate = useNavigate();
  const { logout } = useAuthStore();
  const { user } = useAuthStore(state => state);
  const location = useLocation();
  const { pathname } = location;
  const [heading, setHeading] = React.useState<string>('');

  // Wallet popup state
  const [showWallet, setShowWallet] = React.useState<boolean>(false);
  const walletTimeout = useRef<NodeJS.Timeout | null>(null);

  const handleWalletEnter = () => {
    if (walletTimeout.current) clearTimeout(walletTimeout.current);
    setShowWallet(true);
  };
  const handleWalletLeave = () => {
    walletTimeout.current = setTimeout(() => setShowWallet(false), 150);
  };

  // Wallet calculations
  const walletTotal = 1000;
  const walletRemaining = user?.wallet_balance ?? 0;
  const walletRemainingPercent = (walletRemaining / walletTotal) * 100;

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
                  <DrawerTitle>Menu</DrawerTitle>
                </DrawerHeader>
                <div className="px-4 py-2">
                  <ul className='flex flex-col gap-4'>
                    {navbarLinks.map((link, index) => (
                      <li key={index}>
                        {link.path === "/organiser/login" ?
                          <DrawerClose asChild>
                            <Link to={link.path} className='block px-4 py-2.5 rounded-full border border-black'>Organiser Login</Link>
                          </DrawerClose> :
                          <DrawerClose asChild>
                            <Link to={link.path} className='block px-4 py-2.5'>{link.label}</Link>
                          </DrawerClose>
                        }
                      </li>
                    ))}
                  </ul>
                </div>
                <DrawerFooter>
                  <DrawerClose asChild className='cursor-pointer'>
                    <Button variant="outline">Close</Button>
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
            {user?.feature_permission?.search_people === 1 && !pathname.includes("/search-people") && <li>
              <Link to={`/search-people`}>
                <Button className='btn-rounded !px-3 !h-8 !bg-brand-primary hover:!bg-brand-primary-dark'><Search size={16} /> Search People</Button>
              </Link>
            </li>}
            <li>
              <Link to={"/add-event"}>
                <Button className='btn-rounded !px-3 !h-8'><Plus size={16} /> Create New Event</Button>
              </Link>
            </li>

            {/* Wallet Balance */}
            {user?.feature_permission?.wallet === 1 && <li
              className='relative'
              onMouseEnter={handleWalletEnter}
              onMouseLeave={handleWalletLeave}
            >
              <span className='flex gap-2 items-center cursor-pointer'>
                <img src={Coins} width={28} height={24} alt="coins" />
                <span className='font-semibold text-sm'>{user?.wallet_balance}</span>
              </span>

              {/* Wallet popover */}
              <div
                className={`${showWallet ? 'flex' : 'hidden'} absolute top-10 left-1/2 -translate-x-1/2 z-50`}
                onMouseEnter={handleWalletEnter}
                onMouseLeave={handleWalletLeave}
              >
                <div className='flex items-center gap-8 rounded-xl border border-gray-200 bg-white shadow-lg px-6 py-5'>
                  {/* Circular progress */}
                  <div className='flex flex-col items-center'>
                    <ProgressRing percentage={walletRemainingPercent} size={72} />
                    <span className='mt-2 font-semibold text-sm'>Credits</span>
                  </div>

                  {/* Statistics */}
                  <div className='flex flex-col gap-1'>
                    {/* <div className='flex items-center gap-6'>
                      <span className='text-sm text-gray-500'>Total</span>
                      <span className='font-semibold text-base'>{formatNumber(walletTotal)}</span>
                    </div> */}
                    <div className='flex items-center gap-6'>
                      <span className='text-sm text-gray-500'>Remaining</span>
                      <span className='font-semibold text-base'>{formatNumber(walletRemaining)}</span>
                    </div>

                    {/* Upgrade button */}
                    <Button onClick={() => { navigate('/profile'); handleWalletLeave() }} className='btn-rounded px-6 mt-4 ml-auto'>
                      Upgrade
                    </Button>
                  </div>
                </div>
              </div>
            </li>}

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
                  {user?.role === 'admin' && <Link to="/add-subuser">
                    <DropdownMenuItem className='cursor-pointer'>Add Sub-User</DropdownMenuItem>
                  </Link>}
                  <Link to="/organiser/change-password">
                    <DropdownMenuItem className='cursor-pointer'>Change Password</DropdownMenuItem>
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