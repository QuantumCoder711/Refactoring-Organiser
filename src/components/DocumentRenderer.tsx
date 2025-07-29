import React from 'react';

import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel";

interface DocumentRendererProps {
    filePath?: string;
}

const DocumentRenderer: React.FC<DocumentRendererProps> = ({ filePath }) => {
    return (
        <Carousel className='h-full w-full rounded-xl border-2 border-emerald-500'>
            <CarouselContent>
                <CarouselItem>...</CarouselItem>
                <CarouselItem>...</CarouselItem>
                <CarouselItem>...</CarouselItem>
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
        </Carousel>
    )
}

export default DocumentRenderer;
