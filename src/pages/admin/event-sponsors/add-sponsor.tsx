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
    const [selectedIndex, setSelectedIndex] = useState(-1); // Track selected index
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
        setSelectedIndex(-1); // Reset selected index
        onValueChange(newValue);
    };

    // Handle key down for navigation
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (isOpen) {
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSelectedIndex((prevIndex) =>
                    prevIndex < filteredOptions.length - 1 ? prevIndex + 1 : prevIndex
                );
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSelectedIndex((prevIndex) => (prevIndex > 0 ? prevIndex - 1 : prevIndex));
            } else if (e.key === 'Enter') {
                e.preventDefault();
                if (selectedIndex >= 0 && selectedIndex < filteredOptions.length) {
                    handleOptionSelect(filteredOptions[selectedIndex]);
                }
            }
        }
    };

    // Handle option selection
    const handleOptionSelect = (option: { id: number; name: string; about: string }) => {
        setInputValue(option.name);
        setSearchTerm('');
        setFormData(prev => ({
            ...prev,
            company_name: option.name,
            about_company: option.about,
        }));
        setIsOpen(false);
        setSelectedIndex(-1); // Reset selected index
        onValueChange(option.name);
        inputRef.current?.blur();
    };

    // Handle creating new option
    const handleCreateNew = () => {
        setInputValue(searchTerm);
        setIsOpen(false);
        setSelectedIndex(-1); // Reset selected index
        setFormData(prev => ({
            ...prev,
            company_name: searchTerm,
            about_company: ""  // Set empty about_company for new companies
        }));
        onValueChange(searchTerm);
        inputRef.current?.blur();
    };

    // Handle click outside to close dropdown
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                setSearchTerm('');
                setSelectedIndex(-1); // Reset selected index
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Update input value when value prop changes (to maintain controlled input)
    useEffect(() => {
        setInputValue(value);
    }, [value]);

    // Scroll to selected option when the selectedIndex changes
    useEffect(() => {
        if (selectedIndex >= 0 && dropdownRef.current) {
            const selectedOption = dropdownRef.current.querySelectorAll('.option')[selectedIndex];
            if (selectedOption) {
                selectedOption.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        }
    }, [selectedIndex]);

    return (
        <div className="flex flex-col gap-2" ref={dropdownRef}>
            <Label className="font-semibold">
                {label} {required && <span className="text-secondary">*</span>}
            </Label>
            <div className="relative">
                <div className="relative">
                    <Input
                        ref={inputRef}
                        type="text"
                        value={inputValue}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyDown}
                        onFocus={() => setIsOpen(true)}
                        placeholder={placeholder}
                        className="capitalize !h-12 min-w-full text-base pr-10"
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
                    <div className="absolute z-50 w-full mt-1 bg-background/70 border backdrop-blur-xl rounded-md shadow-lg max-h-60 overflow-y-auto">
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map((option, index) => (
                                <div
                                    key={option.id}
                                    className={`px-3 py-2 capitalize cursor-pointer hover:bg-accent flex items-center justify-between text-sm ${selectedIndex === index ? 'bg-accent' : ''} option`}
                                    onClick={() => handleOptionSelect(option)}
                                >
                                    <span>{option.name}</span>
                                    {inputValue === option.name && (
                                        <Check className="size-4 text-secondary" />
                                    )}
                                </div>
                            ))
                        ) : searchTerm ? (
                            <div
                                className="px-3 py-2 cursor-pointer hover:bg-accent text-secondary text-sm font-medium"
                                onClick={handleCreateNew}
                            >
                                Create "{searchTerm}"
                            </div>
                        ) : (
                            <div className="px-3 py-2 text-foreground/50 text-sm">
                                No companies found
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
});

const AddSponsor: React.FC = () => {
    const { slug } = useParams<{ slug: string | undefined }>();
    const event = useEventStore(state => state).getEventBySlug(slug);
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [bulkFile, setBulkFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState<number>(0);
    const [formData, setFormData] = useState({
        company_logo: null,
        company_name: '',
        about_company: '',
        video_link: '',
        upload_deck: bulkFile,
    });

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

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;

        // Check if the target is an HTMLInputElement and if it has the 'files' property
        if (e.target instanceof HTMLInputElement && e.target.files) {
            const file = e.target.files[0];
            setSelectedImage(file);
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

        try {
            const response = await axios.post(`${domain}/api/sponsors`, form, {
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
                toast(response.data.message || 'Sponsor added successfully', {
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

    // if (loading && uploading === 100) {
    //     return <Wave />
    // }

    return (
        <div>
            <div className='flex items-center gap-5'>
                <GoBack />
                <h1 className='text-xl font-semibold'>{event?.title}</h1>
            </div>

            <div className='mt-5 max-w-2xl flex flex-col gap-5 mx-auto bg-muted p-5 rounded-xl'>

                {/* Company Logo */}
                <div className="flex flex-col gap-2">
                    <div className="flex items-center sm:flex-row flex-col w-full gap-4">
                        <div className='size-28 min-w-28 min-h-28 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden'>
                            {/* Logo preview will be shown here */}
                            {formData.company_logo ? <div>
                                <img src={URL.createObjectURL(formData.company_logo)} alt="Logo Preview" className="object-cover w-full h-full" />
                            </div> : <span className="text-primary text-sm font-medium">Logo</span>}
                        </div>
                        <div className="gap-2 flex flex-col w-full flex-1 overflow-hidden">
                            <Label className="font-semibold" htmlFor="company_logo">Company Logo <span className='text-secondary'>*</span></Label>
                            <div className='flex flex-1 w-full min-[480px]:flex-row flex-col overflow-hidden gap-4'>
                                <div className="bg-background/50 rounded-md relative overflow-hidden !h-10 text-base cursor-pointer flex flex-1 items-center justify-between p-2 gap-4">
                                    <span className="max-w-fit text-nowrap px-2 rounded-md text-base font-normal flex items-center">Choose File</span>
                                    <p className="text-foreground/80 text-left text-nowrap overflow-hidden text-ellipsis">
                                        {selectedImage ? selectedImage.name : 'No file Chosen'}
                                    </p>
                                    <Input
                                        id="company_logo"
                                        name="company_logo"
                                        type='file'
                                        accept="image/*"
                                        onChange={(e) => handleFormChange(e)}
                                        className='absolute left-0 top-0 opacity-0 !h-12 w-full overflow-hidden text-base cursor-pointer'
                                    />
                                </div>
                                <Button onClick={() => {setFormData((prev) => ({ ...prev, company_logo: null })); setSelectedImage(null)}}>Remove</Button>
                            </div>
                            <p className="text-xs text-foreground/50">Recommended size: 512x512px (1:1 ratio)</p>
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
                        About Company <span className='text-secondary'>*</span>
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
                        onChange={(e) => handleFormChange(e)}
                        className='min-w-full !h-12 text-base'
                    />
                </div>

                {/* File Upload */}
                <div className="flex flex-col gap-2 w-full">
                    <Label className="font-semibold">
                        Upload File
                    </Label>

                    <div className="w-full">
                        <div {...getRootProps()} className={`border group duration-300 hover:border-primary border-brand-light-gray shadow-blur rounded-lg bg-background/50 p-6 cursor-pointer transition-colors ${isDragActive && 'border-secondary bg-secondary/10'}`}>
                            <input {...getInputProps()} />
                            <div className="flex flex-col items-center justify-center gap-2 text-center">
                                <FileUp width={24} className="group-hover:stroke-primary duration-300" />
                                {isDragActive ? (
                                    <p className="text-secondary font-medium">Drop the file here...</p>
                                ) : (
                                    <>
                                        <p className="text-lg"><span className="text-primary font-semibold">Click Here</span> to Upload your File or Drag</p>
                                        <p className="">Supported file: <span className="font-semibold">.pdf, .pptx, .ppt (Max 1GB)</span></p>
                                    </>
                                )}
                                {bulkFile && (
                                    <div className="mt-4 flex items-center gap-2 p-2 bg-accent rounded-md w-full">
                                        <FileText className="size-5 text-secondary" />
                                        <span className="text-sm font-medium truncate">{bulkFile.name}</span>
                                        <span className="text-xs text-muted-foreground ml-auto">{(bulkFile.size / 1024 / 1024).toFixed(2)} MB</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Progress Bar */}
                {/* <div hidden={uploading === 0} className='w-full rounded-full p-1 relative'>
                    <div style={{ width: `${uploading}%` }} className='h-full bg-brand-primary absolute top-0 left-0 rounded-full' />
                    <p className='text-center font-semibold invert-0 text-sm text-secondary'>Uploaded {uploading}%</p>
                </div> */}

                <div hidden={uploading === 0} className='relative'>
                    <Progress value={uploading} className='h-6' />
                    <p hidden={uploading === 100} className='absolute text-center top-0 right-0 left-0 text-secondary font-semibold'>Uploaded {uploading}%</p>
                    <p hidden={(loading && uploading === 100) ? false : true} className='absolute text-center top-0 right-0 left-0 text-secondary font-semibold'>Processing...</p>
                </div>

                <Button onClick={handleSubmit} className='btn w-fit mx-auto'>Submit</Button>
            </div>
        </div>
    )
}

export default AddSponsor;
