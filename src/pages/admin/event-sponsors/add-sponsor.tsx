import GoBack from '@/components/GoBack';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { FileUp, CircleX, FileText } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { toast } from 'sonner';
import React, { useCallback, useState } from 'react';
import { Button } from '@/components/ui/button';

const AddSponsor: React.FC = () => {
    const [bulkFile, setBulkFile] = useState<File | null>(null);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        if (acceptedFiles && acceptedFiles.length > 0) {
            const file = acceptedFiles[0];
            if (file.size > 10 * 1024 * 1024) { // 10MB limit
                toast('File size should be less than 10MB', {
                    className: "!bg-red-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
                    icon: <CircleX className='size-5' />
                });
                return;
            }
            setBulkFile(file);
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'application/pdf': ['.pdf'],
            'application/vnd.ms-powerpoint': ['.ppt'],
            'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx']
        },
        multiple: false
    });

    return (
        <div>
            <div className='flex items-center gap-2'>
                <GoBack />
                <h1 className='text-xl font-semibold'>Add Sponsor</h1>
            </div>

            <div className='mt-5 max-w-2xl flex flex-col gap-5 mx-auto bg-brand-background p-5 rounded-xl'>

                {/* Company Logo */}
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-4">
                        <div className='size-28 rounded-full bg-brand-primary/10 flex items-center justify-center overflow-hidden'>
                            {/* Logo preview will be shown here */}
                            <span className="text-brand-primary text-sm font-medium">Logo</span>
                        </div>
                        <div className="flex-1 gap-2 flex flex-col">
                            <Label className="font-semibold" htmlFor="logo">Company Logo <span className='text-brand-secondary'>*</span></Label>
                            <div className='flex gap-4'>
                                <div className="input relative overflow-hidden !h-9 max-w-fit text-base cursor-pointer flex items-center justify-between p-2 gap-4">
                                    <span className="w-full bg-brand-background px-2 rounded-md text-base font-normal flex items-center">Choose File</span>
                                    <p className="w-full text-nowrap overflow-hidden text-ellipsis">
                                        No file Chosen
                                    </p>
                                    <Input
                                        id="logo"
                                        name="logo"
                                        type='file'
                                        accept="image/*"
                                        className='absolute left-0 top-0 opacity-0 !h-12 min-w-full text-base cursor-pointer'
                                    />
                                </div>
                                <Button className='bg-white  hover:bg-white h-9 text-black'>Remove</Button>
                            </div>
                            <p className="text-xs text-gray-500">Recommended size: 512x512px (1:1 ratio)</p>
                        </div>
                    </div>
                </div>

                {/* Company Name */}
                <div className="flex flex-col gap-2 w-full">
                    <Label className="font-semibold" htmlFor='company_name'>
                        Company Name
                    </Label>
                    <Input
                        id='company_name'
                        name='company_name'
                        className='input min-w-full text-base'
                    />
                </div>

                {/* About Company */}
                <div className='flex flex-col gap-2'>
                    <Label className="font-semibold" htmlFor='description'>
                        About Company
                    </Label>
                    <Textarea
                        id='description'
                        name='description'
                        className='input min-w-full !h-32 text-base'
                    />
                </div>

                {/* Website */}
                <div className="flex flex-col gap-2 w-full">
                    <Label className="font-semibold" htmlFor='video_link'>
                        Add Video Link
                    </Label>
                    <Input
                        id='video_link'
                        name='video_link'
                        type='url'
                        className='input min-w-full text-base'
                    />
                </div>

                {/* File Upload */}
                <div className="flex flex-col gap-2 w-full">
                    <Label className="font-semibold">
                        Upload File
                    </Label>

                    <div className="w-full">
                        <div {...getRootProps()} className={`border group duration-300 hover:border-brand-primary border-brand-light-gray shadow-blur rounded-lg bg-white p-6 cursor-pointer transition-colors ${isDragActive ? 'border-brand-secondary bg-brand-secondary/10' : 'border-gray-300'}`}>
                            <input {...getInputProps()} />
                            <div className="flex flex-col items-center justify-center gap-2 text-center">
                                <FileUp width={24} className="group-hover:stroke-brand-primary duration-300" />
                                {isDragActive ? (
                                    <p className="text-brand-secondary font-medium">Drop the file here...</p>
                                ) : (
                                    <>
                                        <p className="text-lg"><span className="text-brand-primary font-semibold">Click Here</span> to Upload your File or Drag</p>
                                        <p className="">Supported file: <span className="font-semibold">.pdf, .pptx, .ppt (Max 10MB)</span></p>
                                    </>
                                )}
                                {bulkFile && (
                                    <div className="mt-4 flex items-center gap-2 p-2 bg-gray-100 rounded-md w-full">
                                        <FileText className="size-5 text-brand-secondary" />
                                        <span className="text-sm font-medium truncate">{bulkFile.name}</span>
                                        <span className="text-xs text-gray-500 ml-auto">{(bulkFile.size / 1024 / 1024).toFixed(2)} MB</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    )
}

export default AddSponsor;
