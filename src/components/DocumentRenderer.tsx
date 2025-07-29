import React from 'react';

import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel";
import { sponsorPdfBucketUrl } from '@/constants';

interface DocumentRendererProps {
    filePaths: string[];
}

const DocumentRenderer: React.FC<DocumentRendererProps> = ({ filePaths }) => {

    // filePaths = [
    //     "https://cdn.pixabay.com/photo/2024/04/20/19/25/leaves-8709253_1280.jpg",
    //     "https://media.istockphoto.com/id/844226534/photo/leaf-background.jpg?s=1024x1024&w=is&k=20&c=sSxXPugfHVNwMq_Ep_gI13dkAXFfNqhyE04fiupLLf0=",
    //     "https://cdn.pixabay.com/photo/2020/02/17/14/43/rhino-4856651_1280.jpg",
    //     "https://cdn.pixabay.com/photo/2020/06/17/18/03/lights-5310589_1280.jpg",
    //     "https://cdn.pixabay.com/photo/2024/01/15/04/29/woman-8509279_1280.jpg"
    // ];



    return (
        <Carousel className='h-full w-full rounded-xl'>
            <CarouselContent className='rounded-xl'>
                {filePaths.map((file) => (
                    <CarouselItem key={file} className='h-96 overflow-hidden rounded-xl'>
                        <img src={`${sponsorPdfBucketUrl}/${file}`} className='w-full h-full object-contain object-center' />
                        {/* <img src={file} className='w-full h-full object-cover rounded-xl object-center' /> */}
                    </CarouselItem>
                ))}
            </CarouselContent>
            <CarouselPrevious className='left-3 cursor-pointer'/>
            <CarouselNext className='right-3 cursor-pointer'/>
        </Carousel>
    )
}

export default DocumentRenderer;
