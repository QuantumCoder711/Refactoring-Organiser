import React from 'react';
import {Button} from "@/components/ui/button";
import { ArrowUp } from 'lucide-react';
import { Link } from 'react-router-dom';

const LaunchEvent:React.FC = () => {
    return (
        <section className="flex max-w-[788px] mx-auto h-full flex-col items-center gap-9 flex-shrink-0 text-lg lg:text-2xl my-14">
            <h2 className='capitalize text-center text-2xl lg:text-[40px] font-bold'>Build Lasting Business Connections with Klout Club</h2>
            <p className='text-center'>Host smarter events, empower professionals, and grow real communities — not just one-time gatherings.</p>
            <span className='text-center'>Get started free today.</span>
            <Link to="/add-first-event">
            <Button className='btn rounded-full font-semibold lg:text-xl flex items-center gap-5 lg:w-[342px] !h-12'>Launch your free event today <ArrowUp className='rotate-45 size-5'/></Button>
            </Link>
        </section>
    )
}

export default LaunchEvent;