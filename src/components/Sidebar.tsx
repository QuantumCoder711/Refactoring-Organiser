import { sidebarItems } from '@/constants';
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button"
import Panel from "@/assets/panel.svg";
import Logo from "@/assets/logo.svg";
import useAuthStore from '@/store/authStore';

const Sidebar: React.FC = () => {
    const path = useLocation();
    const [isOpen, setIsOpen] = useState<boolean>(true);
    const { user } = useAuthStore(state => state);

    const handleSidebarClose = () => {
        setIsOpen(prev => !prev);
    }

    return (
        <aside className={`${isOpen ? 'w-52 lg:w-56 p-3 pt-5' : 'w-0'} sticky left-0 z-20 bg-brand-background h-full transition-all duration-300`}>
            <ul className={`flex flex-col gap-2 relative h-full overflow-hidden ${isOpen ? 'opacity-100' : 'opacity-0'} transition-opacity duration-500`}>
                {sidebarItems.map((item) => (
                    user?.email !== "raj@gainskillsmedia.com" && <li key={item.label}>
                        <Link to={item.path} className={`flex items-center gap-3 p-3 hover:bg-brand-light-gray rounded-lg ${path.pathname.includes(item.path) ? 'bg-brand-light-gray shadow-blur' : ''}`}>
                            <item.icon className='size-5' />
                            {item.label}
                        </Link>
                    </li>
                ))}
                <li>
                    <Link to="/" className='w-full absolute bottom-0 left-0 mx-auto grid place-content-center rounded-lg bg-white'>
                        <img src={Logo} alt="Klout Club" height={32} />
                    </Link>
                </li>
            </ul>

            {/* <Button onClick={handleSidebarClose} className={`rounded-full fixed p-2 shadow-blur bg-white hover:bg-brand-light-gray cursor-pointer duration-300 z-50 w-fit ${isOpen ? 'left-52 top-1/2' : 'left-20 top-12'}`}> */}
            <Button onClick={handleSidebarClose} className={`rounded-full fixed p-2 shadow-blur bg-white hover:bg-brand-light-gray cursor-pointer transition-all duration-500 z-50 w-fit ${isOpen ? 'inset-x-46 lg:inset-x-[200px] right-2 top-1/2 rotate-y-180' : 'left-20 rotate-y-0 top-12'}`}>
                <img src={Panel} alt="Sidebar Icon" width={32} className="min-w-8" />
            </Button>

        </aside >
    )
}

export default Sidebar;
