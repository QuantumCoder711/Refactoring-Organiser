import GoBack from '@/components/GoBack';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { FileUp, CircleX, FileText, CircleCheck, ChevronDown, Check } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { toast } from 'sonner';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import axios from 'axios';
import { domain } from '@/constants';
import useAuthStore from '@/store/authStore';
import { useParams } from 'react-router-dom';
import useEventStore from '@/store/eventStore';
import useExtrasStore from '@/store/extrasStore';
import { Progress } from '@/components/ui/progress';
import { getImageUrl } from '@/lib/utils';
import DocumentRenderer from '@/components/DocumentRenderer';
import Wave from '@/components/Wave';

// Custom Combo Box Component for company names with filtering and creation
const CustomComboBox = React.memo(({
    label,
    value,
    onValueChange,
    placeholder,
    options,
    required = false,
    setFormData
}: {
    label: string;
    value: string;
    onValueChange: (value: string) => void;
    placeholder: string;
    options: { id: number; name: string; about: string }[];
    required?: boolean;
    setFormData: React.Dispatch<React.SetStateAction<{
        company_logo: File | null;
        company_name: string;
        about_company: string;
        video_link: string;
        upload_deck: File | null;
    }>>;

}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [inputValue, setInputValue] = useState(value);
    const inputRef = useRef<HTMLInputElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Filter options based on search term
    const filteredOptions = options.filter(option =>
        option.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Handle input change
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        setInputValue(newValue);
        setSearchTerm(newValue);
        setIsOpen(true);
        onValueChange(newValue);
    };

    // Handle option selection
    const handleOptionSelect = (option: { id: number; name: string; about: string }) => {
        setInputValue(option.name);
        setSearchTerm('');
        setFormData(prev => ({ ...prev, about_company: option.about }));
        setIsOpen(false);
        onValueChange(option.name);
        inputRef.current?.blur();
    };

    // Handle creating new option
    const handleCreateNew = () => {
        setInputValue(searchTerm);
        setIsOpen(false);
        onValueChange(searchTerm);
        inputRef.current?.blur();
    };

    // Handle click outside to close dropdown
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                setSearchTerm('');
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Update input value when value prop changes
    useEffect(() => {
        setInputValue(value);
    }, [value]);

    return (
        <div className="flex flex-col gap-2" ref={dropdownRef}>
            <Label className="font-semibold">
                {label} {required && <span className="text-brand-secondary">*</span>}
            </Label>
            <div className="relative">
                <div className="relative">
                    <Input
                        ref={inputRef}
                        type="text"
                        value={inputValue}
                        onChange={handleInputChange}
                        onFocus={() => setIsOpen(true)}
                        placeholder={placeholder}
                        className="input capitalize !h-12 min-w-full text-base pr-10"
                    />
                    <ChevronDown
                        className={`absolute right-3 top-1/2 transform -translate-y-1/2 size-4 opacity-50 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                        onClick={() => {
                            setIsOpen(!isOpen);
                            inputRef.current?.focus();
                        }}
                    />
                </div>

                {isOpen && (
                    <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map((option) => (
                                <div
                                    key={option.id}
                                    className="px-3 py-2 capitalize cursor-pointer hover:bg-gray-50 flex items-center justify-between text-sm"
                                    onClick={() => handleOptionSelect(option)}
                                >
                                    <span>{option.name}</span>
                                    {inputValue === option.name && (
                                        <Check className="size-4 text-brand-secondary" />
                                    )}
                                </div>
                            ))
                        ) : searchTerm ? (
                            <div
                                className="px-3 py-2 cursor-pointer hover:bg-gray-50 text-brand-secondary text-sm font-medium"
                                onClick={handleCreateNew}
                            >
                                Create "{searchTerm}"
                            </div>
                        ) : (
                            <div className="px-3 py-2 text-gray-500 text-sm">
                                No companies found
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
});

const UpdateSponsor: React.FC = () => {
    const { slug, id } = useParams<{ slug: string | undefined; id: string | undefined }>();
    const event = useEventStore(state => state).getEventBySlug(slug);
    const [bulkFile, setBulkFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState<number>(0);
    const [formData, setFormData] = useState({
        company_logo: null,
        company_name: '',
        about_company: '',
        video_link: '',
        upload_deck: bulkFile,
    });

    const [filePaths, setFilePaths] = useState<string[]>([]);
    const [showUpload, setShowUpload] = useState<boolean>(false);

    const [loading, setLoading] = useState<boolean>(false);

    const { companies, getCompanies } = useExtrasStore(state => state);

    const { token } = useAuthStore(state => state);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        if (acceptedFiles && acceptedFiles.length > 0) {
            const file = acceptedFiles[0];
            if (file.size > 1024 * 1024 * 1024) { // 1GB limit
                toast('File size should be less than 1GB', {
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
            'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
            'application/msword': ['.doc'],
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
        },
        multiple: false
    });

    useEffect(() => {
        if (!id && formData) return;
        setLoading(true);
        axios.get(`${domain}/api/display-sponsors/${id}`, {
            headers: {
                "Authorization": `Bearer ${token}`,
            }
        }).then(res => {
            if (res.data.success) {
                const obj = { ...res.data.sponsor, attendees: res.data.attendees }
                setFormData(obj);
                toast(res.data.message || "Event sponsor attendees retrieved successfully", {
                    className: "!bg-green-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
                    icon: <CircleCheck className='size-5' />
                });
                setFilePaths(res.data.sponsor.upload_deck);
            } else {
                toast(res.data.message || "Error while fetching sponsor details", {
                    className: "!bg-red-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
                    icon: <CircleX className='size-5' />
                });
            }
        }).finally(() => {
            setLoading(false);
        });
    }, [id]);

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;

        // Check if the target is an HTMLInputElement and if it has the 'files' property
        if (e.target instanceof HTMLInputElement && e.target.files) {
            const file = e.target.files[0];
            setFormData((prev) => ({ ...prev, [name]: file }));
        } else {
            // In case it's a textarea or input of type text
            setFormData((prev) => ({ ...prev, [name]: value }));
        }
    };

    useEffect(() => {
        getCompanies(formData.company_name);
    }, [formData.company_name]);

    const handleSubmit = async () => {
        if (!formData.company_logo || !formData.company_name || !formData.about_company) {
            toast('Please fill all required fields', {
                className: "!bg-red-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
                icon: <CircleX className='size-5' />
            });
            return;
        }

        setLoading(true);

        const form = new FormData();
        form.append('event_id', String(event?.id));
        form.append('company_logo', formData.company_logo);
        form.append('company_name', formData.company_name);
        form.append('about_company', formData.about_company);
        form.append('video_link', formData.video_link);
        form.append('upload_deck', bulkFile || '');
        form.append('_method', "PUT");

        try {
            const response = await axios.post(`${domain}/api/update-sponsor/${id}`, form, {
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "multipart/form-data"
                },
                onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / (progressEvent?.total || 1));
                    setUploading(percentCompleted);
                }
            });
            if (response.data.success) {
                setUploading(0);
                toast(response.data.message || 'Sponsor Updated successfully', {
                    className: "!bg-green-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
                    icon: <CircleCheck className='size-5' />
                });
            }
        } catch (error) {
            toast('Failed to add sponsor', {
                className: "!bg-red-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
                icon: <CircleX className='size-5' />
            });
        } finally {
            setLoading(false);
        }
    }

    if (loading && uploading === 0) {
        return <Wave />
    }

    return (
        <div>
            <div className='flex items-center gap-5'>
                <GoBack />
                <h1 className='text-xl font-semibold'>{event?.title}</h1>
            </div>

            <div className='mt-5 max-w-2xl flex flex-col gap-5 mx-auto bg-brand-background p-5 rounded-xl'>

                {/* Company Logo */}
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-4">

                        <div className='size-28 rounded-full bg-brand-primary/10 flex items-center justify-center overflow-hidden'>
                            {/* Logo preview will be shown here */}
                            {formData.company_logo ? (
                                <div>
                                    <img
                                        src={formData.company_logo as any instanceof File ? URL.createObjectURL(formData.company_logo) : getImageUrl(formData.company_logo)}
                                        alt="Logo Preview"
                                        className="object-cover w-full h-full"
                                    />
                                </div>
                            ) : (
                                <span className="text-brand-primary text-sm font-medium">Logo</span>
                            )}
                        </div>

                        <div className="flex-1 gap-2 flex flex-col">
                            <Label className="font-semibold" htmlFor="company_logo">Company Logo <span className='text-brand-secondary'>*</span></Label>
                            <div className='flex gap-4'>
                                <div className="input relative overflow-hidden !h-9 max-w-fit text-base cursor-pointer flex items-center justify-between p-2 gap-4">
                                    <span className="w-full bg-brand-background px-2 rounded-md text-base font-normal flex items-center">Choose File</span>
                                    <p className="w-full text-nowrap overflow-hidden text-ellipsis">
                                        No file Chosen
                                    </p>
                                    <Input
                                        id="company_logo"
                                        name="company_logo"
                                        type='file'
                                        accept="image/*"
                                        onChange={(e) => handleFormChange(e)}
                                        className='absolute left-0 top-0 opacity-0 !h-12 min-w-full text-base cursor-pointer'
                                    />
                                </div>
                                <Button className='bg-white  hover:bg-white h-9 text-black cursor-pointer' onClick={() => setFormData((prev) => ({ ...prev, company_logo: null }))}>Remove</Button>
                            </div>
                            <p className="text-xs text-gray-500">Recommended size: 512x512px (1:1 ratio)</p>
                        </div>
                    </div>
                </div>

                {/* Company Name */}
                <div className="flex flex-col gap-2 w-full">
                    <CustomComboBox
                        label="Company Name"
                        value={formData.company_name}
                        onValueChange={(value: string) => setFormData(prev => ({ ...prev, company_name: value }))}
                        placeholder="Type or select company"
                        options={companies.map((company, index) => ({ id: index + 1, name: company.company, about: company.overview }))}
                        required
                        setFormData={setFormData as React.Dispatch<React.SetStateAction<{
                            company_logo: File | null;
                            company_name: string;
                            about_company: string;
                            video_link: string;
                            upload_deck: File | null;
                        }>>}
                    />
                </div>

                {/* About Company */}
                <div className='flex flex-col gap-2'>
                    <Label className="font-semibold" htmlFor='about_company'>
                        About Company <span className='text-brand-secondary'>*</span>
                    </Label>
                    <Textarea
                        id='about_company'
                        name='about_company'
                        value={formData.about_company}
                        onChange={(e) => handleFormChange(e)}
                        className='input min-w-full !h-60 text-base'
                    />

                </div>

                {/* Video Link */}
                <div className="flex flex-col gap-2 w-full">
                    <Label className="font-semibold" htmlFor='video_link'>
                        Add Video Link
                    </Label>
                    <Input
                        id='video_link'
                        name='video_link'
                        type='url'
                        value={formData?.video_link}
                        onChange={(e) => handleFormChange(e)}
                        className='input min-w-full text-base'
                    />
                </div>

                {/* Preview */}
                <div hidden={showUpload} className='flex flex-col gap-2 mt-5 w-full'>
                    <div className='flex items-center justify-between'>
                        <Label className="font-semibold">Preview</Label>
                        <Button onClick={() => setShowUpload(prev => !prev)} className='btn'>Upload New</Button>
                    </div>
                    <DocumentRenderer filePaths={filePaths} />
                </div>

                {/* File Upload */}
                <div hidden={!showUpload} className="flex flex-col gap-2 mt-5 w-full">
                    <div className='flex items-center justify-between'>
                        <Label className="font-semibold">
                            Upload File
                        </Label>
                        <Button onClick={() => {setShowUpload(prev => !prev); setBulkFile(null)}} className='btn'>Show Preview</Button>
                    </div>

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
                                        <p className="">Supported file: <span className="font-semibold">.pdf, .pptx, .ppt (Max 1GB)</span></p>
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

                <div hidden={uploading === 0} className='relative'>
                    <Progress value={uploading} className='h-6' />
                    <p hidden={uploading === 100} className='absolute text-center top-0 right-0 left-0 text-brand-secondary font-semibold'>Uploaded {uploading}%</p>
                    <p hidden={(loading && uploading === 100) ? false : true} className='absolute text-center top-0 right-0 left-0 text-brand-secondary font-semibold'>Processing...</p>
                </div>

                <Button disabled={loading && uploading!==100} onClick={handleSubmit} className='btn w-fit mx-auto'>Submit</Button>
            </div>
        </div>
    )
}

export default UpdateSponsor;