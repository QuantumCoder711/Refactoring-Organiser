import { SidebarItems } from '@/constants';
import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar: React.FC = () => {

    const path = useLocation();

    useEffect(() => {
        console.log(path);
    }, [path]);

    return (
        <aside className='w-52 lg:w-56 bg-brand-background p-3 pt-5 h-full'>
            <ul className='flex flex-col gap-2'>
                {SidebarItems.map((item) => (
                    <li key={item.label}>
                        <Link to={item.path} className={`flex items-center gap-3 p-3 hover:bg-brand-light-gray rounded-md ${path.pathname.includes(item.path) ? 'bg-brand-light-gray shadow-blur' : ''}`}>
                            <item.icon className='size-5' />
                            {item.label}
                        </Link>
                    </li>
                ))}
            </ul>
        </aside>
    )
}

export default Sidebar;
