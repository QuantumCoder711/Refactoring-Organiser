import React, { useState, useCallback } from 'react';
import GoBack from '@/components/GoBack';

import { useDropzone } from "react-dropzone";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { FileUp, FileText } from 'lucide-react';
import { UserAvatar } from '@/constants';
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";

const AiPhotos: React.FC = () => {
    const [,setFiles] = useState<File[]>([]);
    const [bulkFile, setBulkFile] = useState<File | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const imagesPerPage = 15;
    const totalImages = 100; // Replace with actual total number of images
    const totalPages = Math.ceil(totalImages / imagesPerPage);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        setFiles(acceptedFiles);
        if (acceptedFiles.length > 0) {
            setBulkFile(acceptedFiles[0]);
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        // Here you would typically fetch the images for the new page
    };

    return (
        <div className='relative w-full h-full'>
            <div className='absolute top-0 left-0'>
                <GoBack />
            </div>

            <div className='max-w-3xl bg-brand-background mx-auto rounded-[10px] p-7'>
                <Tabs defaultValue="upload" className="mx-auto">
                    <TabsList className="bg-white p-0 max-w-[390px] mx-auto !max-h-9">
                        <TabsTrigger
                            value="upload"
                            className="max-h-9 px-4 h-full font-medium text-xl !py-0 cursor-pointer data-[state=active]:text-white data-[state=active]:bg-brand-dark-gray"
                        >
                            Upload Files
                        </TabsTrigger>
                        <TabsTrigger
                            value="photos"
                            className="max-h-9 px-4 h-full font-medium text-xl !py-0 cursor-pointer data-[state=active]:text-white data-[state=active]:bg-brand-dark-gray"
                        >
                            Photos
                        </TabsTrigger></TabsList>
                    <TabsContent value="upload" className="mt-5">
                        <h3 className='font-semibold'>Event Zip Files<span className='text-brand-secondary'>*</span></h3>
                        <div {...getRootProps()} className={`border group duration-300 hover:border-brand-primary border-brand-light-gray shadow-blur rounded-lg bg-white p-6 cursor-pointer transition-colors ${isDragActive ? 'border-brand-secondary bg-brand-secondary/10' : 'border-gray-300'}`}>
                            <input {...getInputProps()} />
                            <div className="flex flex-col items-center justify-center gap-2 text-center">
                                <FileUp width={24} className="group-hover:stroke-brand-primary duration-300" />
                                {isDragActive ? (
                                    <p className="text-brand-secondary font-medium">Drop the file here...</p>
                                ) : (
                                    <>
                                        <p className="text-lg"><span className="text-brand-primary font-semibold">Click Here</span> to Upload your File or Drag</p>
                                        <p className="">Supported file: <span className="font-semibold">.csv, .xlsx, .xls (Max 10MB)</span></p>
                                    </>
                                )}
                                {bulkFile && (
                                    <div className="mt-4 flex items-center gap-2 p-2 bg-gray-100 rounded-md w-full">
                                        <FileText className="size-5 text-brand-secondary" />
                                        <span className="text-sm font-medium truncate">{bulkFile.name}</span>
                                        <span className="text-xs text-gray-500">({(bulkFile.size / (1024 * 1024)).toFixed(2)} MB)</span>
                                    </div>
                                )}
                            </div>

                        </div>
                        <div className='w-full flex justify-center mt-9'>
                            <Button className='w-36 bg-brand-secondary text-white cursor-pointer hover:bg-brand-secondary'>Upload</Button>
                        </div>
                    </TabsContent>

                    <TabsContent value="photos">
                        <div className='grid grid-cols-3 grid-rows-5 gap-4 mt-5'>
                            {/* Replace this with your actual image rendering logic */}
                            {Array.from({ length: 15 }, (_, index) => (
                                <img key={index} src={UserAvatar} alt={`User Avatar ${index + 1}`} className='rounded-[10px] w-full' />
                            ))}
                        </div>
                        {/* Pagination */}
                        <Pagination className='mt-[26px] flex justify-end'>
                            <PaginationContent>
                                <PaginationItem>
                                    <PaginationPrevious
                                        onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
                                        className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                                    />
                                </PaginationItem>

                                {/* Show first page */}
                                {totalPages > 0 && (
                                    <PaginationItem>
                                        <PaginationLink
                                            isActive={currentPage === 1}
                                            onClick={() => handlePageChange(1)}
                                            className="cursor-pointer"
                                        >
                                            1
                                        </PaginationLink>
                                    </PaginationItem>
                                )}

                                {/* Show ellipsis if needed */}
                                {currentPage > 3 && (
                                    <PaginationItem>
                                        <PaginationEllipsis />
                                    </PaginationItem>
                                )}

                                {/* Show current page and adjacent pages */}
                                {totalPages > 1 && currentPage > 2 && (
                                    <PaginationItem>
                                        <PaginationLink
                                            onClick={() => handlePageChange(currentPage - 1)}
                                            className="cursor-pointer"
                                        >
                                            {currentPage - 1}
                                        </PaginationLink>
                                    </PaginationItem>
                                )}

                                {totalPages > 1 && currentPage > 1 && currentPage < totalPages && (
                                    <PaginationItem>
                                        <PaginationLink
                                            isActive={true}
                                            className="cursor-pointer"
                                        >
                                            {currentPage}
                                        </PaginationLink>
                                    </PaginationItem>
                                )}

                                {totalPages > 2 && currentPage < totalPages - 1 && (
                                    <PaginationItem>
                                        <PaginationLink
                                            onClick={() => handlePageChange(currentPage + 1)}
                                            className="cursor-pointer"
                                        >
                                            {currentPage + 1}
                                        </PaginationLink>
                                    </PaginationItem>
                                )}

                                {/* Show ellipsis if needed */}
                                {currentPage < totalPages - 2 && (
                                    <PaginationItem>
                                        <PaginationEllipsis />
                                    </PaginationItem>
                                )}

                                {/* Show last page */}
                                {totalPages > 1 && (
                                    <PaginationItem>
                                        <PaginationLink
                                            isActive={currentPage === totalPages}
                                            onClick={() => handlePageChange(totalPages)}
                                            className="cursor-pointer"
                                        >
                                            {totalPages}
                                        </PaginationLink>
                                    </PaginationItem>
                                )}

                                <PaginationItem>
                                    <PaginationNext
                                        onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)}
                                        className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                                    />
                                </PaginationItem>
                            </PaginationContent>
                        </Pagination>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}

export default AiPhotos;
