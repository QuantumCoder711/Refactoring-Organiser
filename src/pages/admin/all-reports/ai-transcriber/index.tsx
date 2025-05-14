import React, { useState, useCallback } from 'react';
import GoBack from '@/components/GoBack';

import { useDropzone } from "react-dropzone";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { Download, FileUp, FileText } from 'lucide-react';
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
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

const AiTranscriber: React.FC = () => {

  const [form, setForm] = useState<{ file: File | null, video_url: string }>({ file: null, video_url: '' });

  const [currentPage, setCurrentPage] = useState(1);
  const imagesPerPage = 15;
  const totalImages = 100; // Replace with actual total number of images
  const totalPages = Math.ceil(totalImages / imagesPerPage);

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
              value="summary"
              className="max-h-9 px-4 h-full font-medium text-xl !py-0 cursor-pointer data-[state=active]:text-white data-[state=active]:bg-brand-dark-gray"
            >
              Summary
            </TabsTrigger></TabsList>
          <TabsContent value="upload" className="mt-5 flex gap-5 flex-col">

            <div className='flex flex-col gap-2'>
              <Label className='font-semibold'>Video URL<span className='text-brand-secondary'>*</span></Label>
              <Input
                type="text"
                value={form.video_url}
                onChange={(e) => setForm({ ...form, video_url: e.target.value })}
                className='input !h-12 min-w-full text-base'
              />
            </div>

            <div className="input relative overflow-hidden !h-12 min-w-full text-base cursor-pointer flex items-center justify-between p-2 gap-4">
              <span className="w-fit text-nowrap justify-center font-semibold bg-brand-background px-2 h-[34px] rounded-md text-base flex items-center">Choose File</span>
              <p className="w-full text-nowrap overflow-hidden text-ellipsis font-semibold text-brand-dark-gray">{form.file ? form.file?.name : 'No file Chosen'}</p>
              <Input
                id="image"
                name="image"
                type='file'
                accept="image/*"
                className='input absolute left-0 top-0 opacity-0 !h-12 min-w-full text-base cursor-pointer'
                onChange={(e) => setForm({ ...form, file: e.target.files ? e.target.files[0] : null })}
              />
            </div>

            <div className='w-full flex justify-center mt-9'>
              <Button className='w-36 bg-brand-secondary text-white cursor-pointer hover:bg-brand-secondary'>Upload</Button>
            </div>
          </TabsContent>

          <TabsContent value="summary">
            <p className='text-left mt-8'>
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Repellendus, quas?
            </p>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default AiTranscriber;