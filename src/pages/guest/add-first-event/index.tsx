import useAuthStore from '@/store/authStore';
import React, { useCallback, useEffect, useState, useRef } from 'react';
import { toast } from 'sonner';
import * as htmlToImage from 'html-to-image';

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useNavigate } from 'react-router-dom';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import useExtrasStore from '@/store/extrasStore';
import { CompanyType } from '@/types';
import Wave from '@/components/Wave';
import { Checkbox } from '@/components/ui/checkbox';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CircleCheck, CircleX } from 'lucide-react';
import axios from 'axios';
import { domain, googleMapsApiKey, UserAvatar } from '@/constants';
import { Autocomplete, useLoadScript } from '@react-google-maps/api';
import Template1 from '@/assets/templates/template_1.jpg';
import Template2 from '@/assets/templates/template_2.jpg';
import Template3 from '@/assets/templates/template_3.jpg';
import Template4 from '@/assets/templates/template_4.jpg';
import Template5 from '@/assets/templates/template_5.jpg';
import { AddEventType } from '@/types';
import { beautifyDate, getRandomOTP } from '@/lib/utils';
import useEventStore from '@/store/eventStore';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import GoogleMap from '@/components/GoogleMap';
import { login } from '@/api/auth';

const AddFirstEvent: React.FC = () => {

    const { token } = useAuthStore(state => state);
    const [open, setOpen] = useState<boolean>(false);
    const [userAccount, setUserAccount] = useState({
        first_name: "",
        last_name: "",
        email: "",
        mobile_number: "",
        password: "",
        company_name: "",
        company: 0,
        confirm_password: "",
        tnc: false,
        notifications: false,
        mobile_otp: "",
        email_otp: "",
        step: "1",
        source_website: true,
    });

    const { getAllCompanies, companies, loading } = useExtrasStore(state => state);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const navigate = useNavigate();

    const { isLoaded } = useLoadScript({
        googleMapsApiKey,
        libraries: ['places'],
    });

    const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);
    const [coords, setCoords] = useState<{ lat: number, lng: number }>({
        lat: 0,
        lng: 0
    });

    const [textConfig, setTextConfig] = useState<{
        size: number;
        color: string;
    }>({
        size: 16,
        color: '#000'
    });

    const templates: string[] = [Template1, Template2, Template3, Template4, Template5];

    const [showTemplates, setShowTemplates] = useState<boolean>(false);
    const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
    const [imageSource, setImageSource] = useState<'upload' | 'template' | null>(null);
    const imageRef = useRef<HTMLDivElement | null>(null);
    const [formData, setFormData] = useState<AddEventType>({
        title: "",
        image: null,
        description: "",
        event_start_date: "",
        event_date: "",
        start_time: "",
        start_minute_time: "",
        start_time_type: "",
        end_time: "",
        end_minute_time: "",
        end_time_type: "",
        status: 1,
        feedback: 1,
        event_otp: getRandomOTP(),
        view_agenda_by: 0,
        google_map_link: "",
        event_fee: "0",
        paid_event: 0,
        printer_count: 0,
        pincode: '',
        state: '',
        city: '',
        country: '',
        event_venue_name: '',
        event_venue_address_1: '',
        event_venue_address_2: '',
        break_out: 0,
    });

    const handlePlaceSelect = () => {
        if (autocomplete) {
            const place = autocomplete.getPlace();

            if (place && place.address_components) {
                const addressComponents = place.address_components as google.maps.GeocoderAddressComponent[];

                // Find pincode from address components
                let pincode = '000000';
                for (const component of addressComponents) {
                    if (component.types.includes('postal_code')) {
                        pincode = component.long_name;
                        break;
                    }
                }

                setFormData(prevState => ({
                    ...prevState,
                    event_venue_name: place.name as string,
                    event_venue_address_1: place.formatted_address as string,
                    event_venue_address_2: place.vicinity as string,
                    google_map_link: place.url as string,
                    pincode: pincode,
                    country: addressComponents[addressComponents.length - 2]?.long_name as string,
                    state: addressComponents[addressComponents.length - 3]?.long_name as string,
                    city: addressComponents[addressComponents.length - 4]?.long_name as string,
                }));
            }

            if (place.geometry?.location) {
                setCoords({
                    lat: place.geometry.location.lat(),
                    lng: place.geometry.location.lng()
                });
            }
        }
    };

    const handleInputChangeEventForm = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: name === 'printer_count' ? (value === '' ? 0 : Number(value)) : value
        }));
    };

    const handleSwitchChange = (checked: boolean, name: string) => {
        setFormData(prevState => ({
            ...prevState,
            [name]: checked ? 1 : 0,
            event_fee: checked ? "1" : "0"
        }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        if (file) {
            setImageSource('upload');
            setSelectedTemplate(null);
            setFormData(prevState => ({
                ...prevState,
                image: file
            }));
        }
    };

    const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>, timeType: 'start' | 'end') => {
        const [hours, minutes] = e.target.value.split(':');
        const ampm = parseInt(hours) >= 12 ? 'PM' : 'AM';
        const formattedHours = parseInt(hours) % 12 || 12;

        setFormData(prevState => ({
            ...prevState,
            [`${timeType}_time`]: formattedHours.toString(),
            [`${timeType}_minute_time`]: minutes,
            [`${timeType}_time_type`]: ampm
        }));
    };

    const handleTemplateSelect = (template: string) => {
        setImageSource('template');
        setSelectedTemplate(template);
        setFormData(prevState => ({
            ...prevState,
            image: template
        }));
    };

    const toggleTemplates = () => {
        const newShowTemplates = !showTemplates;
        setShowTemplates(newShowTemplates);

        if (newShowTemplates) {
            if (imageSource === 'upload') {
                setFormData(prevState => ({
                    ...prevState,
                    image: null
                }));
                setImageSource(null);
            }
        } else {
            if (imageSource === 'template') {
                setFormData(prevState => ({
                    ...prevState,
                    image: null
                }));
                setSelectedTemplate(null);
                setImageSource(null);
            }
        }
    };

    const validateForm = useCallback((data: AddEventType) => {
        const requiredFields: (keyof AddEventType)[] = [
            'title',
            'description',
            'image',
            'event_start_date',
            'event_date',
            'start_time',
            'start_minute_time',
            'start_time_type',
            'end_time',
            'end_minute_time',
            'end_time_type',
            'google_map_link',
        ];

        const missingFields = requiredFields.filter(field => {
            if (field === 'image') {
                return !data[field];
            }
            return !data[field] || data[field] === '';
        });

        if (missingFields.length > 0) {
            console.log(missingFields);
            toast("Please fill in all required fields marked with *", {
                className: "!bg-red-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
                icon: <CircleX className='size-5' />
            });
            return false;
        }

        if (data.event_start_date && data.event_date) {
            const startDate = new Date(data.event_start_date);
            const endDate = new Date(data.event_date);

            if (endDate < startDate) {
                toast("End date cannot be before start date", {
                    className: "!bg-red-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
                    icon: <CircleX className='size-5' />
                });
                return false;
            }
        }

        if (isNaN(Number(data.printer_count)) || Number(data.printer_count) < 0) {
            toast("Printer count must be a valid number", {
                className: "!bg-red-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
                icon: <CircleX className='size-5' />
            });
            return false;
        }

        if (data.paid_event === 1 && (isNaN(Number(data.event_fee)) || Number(data.event_fee) <= 0)) {
            toast("Please enter a valid event fee", {
                className: "!bg-red-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
                icon: <CircleX className='size-5' />
            });
            return false;
        }

        return true;
    }, []);

    const handleSubmit = async () => {
        if (!validateForm(formData)) {
            return;
        }

        setIsLoading(true);

        try {
            let updatedFormData = { ...formData };

            if (imageSource === 'template' && selectedTemplate && imageRef.current) {
                try {
                    // Clone the node to avoid modifying the original
                    const clonedNode = imageRef.current.cloneNode(true) as HTMLElement;

                    // Create a temporary container
                    const container = document.createElement('div');
                    container.style.position = 'absolute';
                    container.style.left = '-9999px';
                    container.style.top = '-9999px';
                    container.appendChild(clonedNode);
                    document.body.appendChild(container);

                    try {
                        // Generate the image from the cloned content
                        const dataUrl = await htmlToImage.toPng(clonedNode, {
                            quality: 1.0,
                            pixelRatio: 2,
                            backgroundColor: 'white',
                            skipFonts: true,
                            filter: (node) => {
                                return !node.classList?.contains('google-map') &&
                                    !node.classList?.contains('map-container');
                            }
                        });

                        // Convert the Data URL to a Blob and create a File
                        const response = await fetch(dataUrl);
                        const blob = await response.blob();
                        const file = new File([blob], 'template.png', { type: 'image/png' });

                        updatedFormData.image = file;
                    } finally {
                        // Clean up the temporary container
                        document.body.removeChild(container);
                    }
                } catch (error) {
                    console.error('Error processing template:', error);
                    toast("Error creating image from template", {
                        className: "!bg-red-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
                        icon: <CircleX className='size-5' />
                    });
                    setIsLoading(false);
                    return;
                }
            }

            if (token) {
                const response = await useEventStore.getState().addEvent(updatedFormData);
                if (response.status === 200) {
                    toast("Event added successfully", {
                        className: "!bg-green-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
                        icon: <CircleCheck className='size-5' />
                    });
                    navigate("/dashboard");
                }
            } else {
                setOpen(true);
            }
        } catch (error) {
            toast(error instanceof Error ? error.message : "Something went wrong", {
                className: "!bg-red-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
                icon: <CircleX className='size-5' />
            });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        getAllCompanies();
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.target;
        setUserAccount(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleCompanyChange = (value: string) => {
        const companyId = parseInt(value);
        setUserAccount(prevState => ({
            ...prevState,
            company: companyId
        }));
    };

    // Fixed: Added dedicated handler for custom company name input
    const handleCompanyNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setUserAccount(prevState => ({
            ...prevState,
            company_name: e.target.value
        }));
    };

    const handleCreateAccount = async () => {
        const { first_name, last_name, email, mobile_number, password, confirm_password, company_name, tnc, notifications, company } = userAccount;

        // Fixed: Updated validation logic for company name
        if (!first_name) {
            toast("Please enter your first name", {
                className: "!bg-red-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
                icon: <CircleX className='size-5' />
            });
            return;
        }

        if (!last_name) {
            toast("Please enter your last name", {
                className: "!bg-red-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
                icon: <CircleX className='size-5' />
            });
            return;
        }

        if (!email) {
            toast("Please enter your email", {
                className: "!bg-red-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
                icon: <CircleX className='size-5' />
            });
            return;
        }

        if (!mobile_number) {
            toast("Please enter your mobile number", {
                className: "!bg-red-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
                icon: <CircleX className='size-5' />
            });
            return;
        }

        if (!password) {
            toast("Please enter your password", {
                className: "!bg-red-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
                icon: <CircleX className='size-5' />
            });
            return;
        }

        if (password !== confirm_password) {
            toast("Passwords don't match", {
                className: "!bg-red-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
                icon: <CircleX className='size-5' />
            });
            return;
        }

        // Fixed: Updated company validation logic
        if (company === 0) {
            toast("Please select your company", {
                className: "!bg-red-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
                icon: <CircleX className='size-5' />
            });
            return;
        }

        if (company === 439 && !company_name) {
            toast("Please enter your company name", {
                className: "!bg-red-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
                icon: <CircleX className='size-5' />
            });
            return;
        }

        if (!tnc) {
            toast("Please agree to terms and conditions", {
                className: "!bg-red-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
                icon: <CircleX className='size-5' />
            });
            return;
        }

        if (!notifications) {
            toast("Please agree to receive important updates", {
                className: "!bg-red-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
                icon: <CircleX className='size-5' />
            });
            return;
        }

        try {
            setIsLoading(true);
            const res = await axios.post(`${domain}/api/register`, userAccount, {
                headers: {
                    "Content-Type": "application/json"
                }
            });

            if (res.data.status === 200) {
                setUserAccount((prev) => ({
                    ...prev,
                    step: "2"
                }));
            }
            else if (res.data.status === 422) {
                toast("Email or Phone No. already exists", {
                    className: "!bg-red-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
                    icon: <CircleX className='size-5' />
                });
            } else {
                toast(res.data.message || "Something went wrong", {
                    className: "!bg-red-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
                    icon: <CircleX className='size-5' />
                });
            }
        } catch (error: any) {
            toast(error.data.message || "Something went wrong", {
                className: "!bg-red-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
                icon: <CircleX className='size-5' />
            });


        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateEvent = async () => {
        try {
            setIsLoading(true);
            const res = await axios.post(`${domain}/api/register`, userAccount, {
                headers: {
                    "Content-Type": "application/json"
                }
            });

            if (res.data.status === 200) {
                const loginResponse = await login(userAccount.email, userAccount.password);
                if (loginResponse.status === 200) {
                    let updatedFormData = { ...formData };

                    if (imageSource === 'template' && selectedTemplate && imageRef.current) {
                        try {
                            // Clone the node to avoid modifying the original
                            const clonedNode = imageRef.current.cloneNode(true) as HTMLElement;

                            // Create a temporary container
                            const container = document.createElement('div');
                            container.style.position = 'absolute';
                            container.style.left = '-9999px';
                            container.style.top = '-9999px';
                            container.appendChild(clonedNode);
                            document.body.appendChild(container);

                            try {
                                // Generate the image from the cloned content
                                const dataUrl = await htmlToImage.toPng(clonedNode, {
                                    quality: 1.0,
                                    pixelRatio: 2,
                                    backgroundColor: 'white',
                                    skipFonts: true,
                                    filter: (node) => {
                                        return !node.classList?.contains('google-map') &&
                                            !node.classList?.contains('map-container');
                                    }
                                });

                                // Convert the Data URL to a Blob and create a File
                                const response = await fetch(dataUrl);
                                const blob = await response.blob();
                                const file = new File([blob], 'template.png', { type: 'image/png' });

                                updatedFormData.image = file;
                            } finally {
                                // Clean up the temporary container
                                document.body.removeChild(container);
                            }
                        } catch (error) {
                            console.error('Error processing template:', error);
                            toast("Error creating image from template", {
                                className: "!bg-red-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
                                icon: <CircleX className='size-5' />
                            });
                            setIsLoading(false);
                            return;
                        }
                    }

                    const response = await useEventStore.getState().addEvent(updatedFormData, loginResponse.access_token);
                    if (response.status === 200) {
                        toast("Event added successfully", {
                            className: "!bg-green-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
                            icon: <CircleCheck className='size-5' />
                        });
                        navigate("/dashboard");
                    }
                }
            }
        } catch (error) {
            toast(error instanceof Error ? error.message : "Something went wrong", {
                className: "!bg-red-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
                icon: <CircleX className='size-5' />
            });
        } finally {
            setIsLoading(false);
        }
    }

    if (loading || isLoading) {
        return <Wave />
    }

    return (
        <div className='min-h-full min-w-full'>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className='bg-brand-light'>
                    <DialogHeader>
                        <DialogTitle className='text-center text-2xl'>Create Account</DialogTitle>

                        {userAccount.step == "1" && <div>
                            <div className='flex gap-5 justify-between'>
                                <div className='flex mt-5 gap-2 flex-col w-full'>
                                    <Label className='font-semibold'>First Name</Label>
                                    <div className='input !h-12 !min-w-full relative !p-1 flex items-center justify-end'>
                                        <Input
                                            value={userAccount.first_name}
                                            onChange={handleInputChange}
                                            name='first_name'
                                            className='input !h-full min-w-full absolute right-0 text-base z-10'
                                        />
                                    </div>
                                </div>

                                <div className='flex mt-5 gap-2 flex-col w-full'>
                                    <Label className='font-semibold'>Last Name</Label>
                                    <div className='input !h-12 !min-w-full relative !p-1 flex items-center justify-end'>
                                        <Input
                                            value={userAccount.last_name}
                                            onChange={handleInputChange}
                                            name='last_name'
                                            className='input !h-full min-w-full absolute right-0 text-base z-10'
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className='flex gap-5 justify-between mt-5'>
                                <div className='flex gap-2 flex-col w-full'>
                                    <Label className='font-semibold'>Email</Label>
                                    <div className='input !h-12 !min-w-full relative !p-1 flex items-center justify-end'>
                                        <Input
                                            value={userAccount.email}
                                            onChange={handleInputChange}
                                            name='email'
                                            className='input !h-full min-w-full absolute right-0 text-base z-10'
                                        />
                                    </div>
                                </div>

                                <div className='flex gap-2 flex-col w-full'>
                                    <Label className='font-semibold'>Mobile Number</Label>
                                    <div className='input !h-12 !min-w-full relative !p-1 flex items-center justify-end'>
                                        <Input
                                            value={userAccount.mobile_number}
                                            onChange={handleInputChange}
                                            name='mobile_number'
                                            className='input !h-full min-w-full absolute right-0 text-base z-10'
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className='flex gap-5 justify-between mt-5'>
                                <div className='flex gap-2 flex-col w-full'>
                                    <Label className='font-semibold'>Company Name</Label>
                                    <Select onValueChange={handleCompanyChange}>
                                        <SelectTrigger className="w-full bg-white !h-12 cursor-pointer">
                                            <SelectValue placeholder="Company Name" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {companies.map((company: CompanyType) => (
                                                <SelectItem
                                                    key={company.id}
                                                    value={company.id.toString()}
                                                    className='cursor-pointer'
                                                >
                                                    {company.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className='flex gap-5 justify-between mt-5'>
                                <div className='flex gap-2 flex-col w-full'>
                                    <Label className='font-semibold'>Password</Label>
                                    <div className='input !h-12 !min-w-full relative !p-1 flex items-center justify-end'>
                                        <Input
                                            value={userAccount.password}
                                            onChange={handleInputChange}
                                            name='password'
                                            type='password'
                                            className='input !h-full min-w-full absolute right-0 text-base z-10'
                                        />
                                    </div>
                                </div>

                                <div className='flex gap-2 flex-col w-full'>
                                    <Label className='font-semibold'>Confirm Password</Label>
                                    <div className='input !h-12 !min-w-full relative !p-1 flex items-center justify-end'>
                                        <Input
                                            value={userAccount.confirm_password}
                                            onChange={handleInputChange}
                                            name='confirm_password'
                                            type='password'
                                            className='input !h-full min-w-full absolute right-0 text-base z-10'
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className='mt-5 space-y-5'>
                                <div className="flex items-center space-x-2 cursor-pointer" onClick={() => setUserAccount(prevState => ({
                                    ...prevState,
                                    tnc: !prevState.tnc
                                }))}>
                                    <Checkbox id="tnc" checked={userAccount.tnc} className='bg-white' />
                                    <label
                                        htmlFor="tnc"
                                        className="text-sm leading-none"
                                    >
                                        I agree to company <Link to='#' className='text-brand-primary'>Terms & Conditions</Link> and <Link to='#' className='text-brand-primary'>Privacy Policy</Link>
                                    </label>
                                </div>

                                <div className="flex items-center space-x-2 cursor-pointer" onClick={() => setUserAccount(prevState => ({
                                    ...prevState,
                                    notifications: !prevState.notifications
                                }))}>
                                    <Checkbox id="notifications" checked={userAccount.notifications} className='bg-white' />
                                    <label
                                        htmlFor="notifications"
                                        className="text-sm leading-none"
                                    >
                                        I agree to receive Important updates on SMS, Email & Whatsapp.
                                    </label>
                                </div>
                            </div>

                            <Button onClick={handleCreateAccount} className='mt-5 btn mx-auto w-full'>Create Account</Button>
                            <p className="text-center mt-2">Already have an account ? <Link to={"/login"} className='text-brand-primary'><span>Login Here</span></Link></p>
                        </div>}

                        {userAccount.step == "2" && <div>
                            <div className='flex gap-5 justify-between'>
                                <div className='flex mt-5 gap-2 flex-col w-full'>
                                    <Label className='font-semibold'>Email OTP</Label>
                                    <div className='input !h-12 !min-w-full relative !p-1 flex items-center justify-end'>
                                        <Input
                                            value={userAccount.email_otp}
                                            onChange={handleInputChange}
                                            name='email_otp'
                                            className='input !h-full min-w-full absolute right-0 text-base z-10'
                                        />
                                    </div>
                                </div>

                                <div className='flex mt-5 gap-2 flex-col w-full'>
                                    <Label className='font-semibold'>Mobile OTP</Label>
                                    <div className='input !h-12 !min-w-full relative !p-1 flex items-center justify-end'>
                                        <Input
                                            value={userAccount.mobile_otp}
                                            onChange={handleInputChange}
                                            name='mobile_otp'
                                            className='input !h-full min-w-full absolute right-0 text-base z-10'
                                        />
                                    </div>
                                </div>
                            </div>

                            <Button onClick={handleCreateEvent} className='mt-5 btn mx-auto w-full'>Create Account</Button>
                        </div>}
                    </DialogHeader>
                </DialogContent>
            </Dialog>

            <div className=''>
                <div className='max-w-[700px] mx-auto rounded-[10px] p-8 bg-brand-background'>
                    <div className="flex flex-col gap-2 w-full">
                        <Label className="font-semibold" htmlFor='title'>
                            Event Name <span className="text-brand-secondary">*</span>
                        </Label>
                        <Input
                            id="title"
                            name='title'
                            type="text"
                            value={formData.title}
                            onChange={handleInputChangeEventForm}
                            className='input !h-12 min-w-full text-base'
                        />
                    </div>

                    <div className='flex gap-7 mt-5 items-center'>
                        <div className='flex flex-col w-full gap-5'>
                            <div className="flex flex-col gap-2 w-full">
                                <Label className="font-semibold" htmlFor='paid_event'>
                                    Event Type <span className="text-brand-secondary">*</span>
                                </Label>
                                <div className='input !h-12 min-w-full flex items-center text-base pl-4 !py-1.5'>
                                    <div className='flex gap-4 items-center text-brand-dark-gray'>
                                        <Label htmlFor="paid_event" className='cursor-pointer'>Free</Label>

                                        <Switch
                                            id="paid_event"
                                            checked={formData.paid_event === 1}
                                            onCheckedChange={(checked) => handleSwitchChange(checked, 'paid_event')}
                                            className="data-[state=checked]:bg-brand-primary"
                                        />

                                        <Label htmlFor="paid_event" className='cursor-pointer'>Paid</Label>

                                    </div>
                                    {formData.paid_event === 1 && <div className='flex flex-1 border-l border-brand-dark-gray !ml-4'>
                                        <div className='relative w-full'>
                                            <Input
                                                id='event_fee'
                                                name='event_fee'
                                                type='number'
                                                value={formData.event_fee}
                                                placeholder='Event Fee'
                                                onChange={handleInputChangeEventForm}
                                                className='input !h-11 focus-visible:!ring-0 focus-visible:!ring-offset-0 w-full text-base'
                                            />
                                        </div>
                                    </div>}
                                </div>
                            </div>

                            <div className="flex flex-col gap-2">
                                <Label className="font-semibold" htmlFor="image">Banner <span className='text-brand-secondary'>*</span></Label>
                                <div className={`input relative overflow-hidden !h-12 min-w-full text-base ${showTemplates ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} flex items-center justify-between p-2 gap-4`}>
                                    <span className="w-full bg-brand-background px-2 h-[34px] rounded-md text-base font-normal flex items-center">Choose File</span>
                                    <p className="w-full text-nowrap overflow-hidden text-ellipsis">
                                        {formData.image
                                            ? formData.image instanceof File
                                                ? (formData.image as File).name
                                                : typeof formData.image === 'string'
                                                    ? "Template selected"
                                                    : "No file Chosen"
                                            : "No file Chosen"
                                        }
                                    </p>
                                    <Input
                                        id="image"
                                        name="image"
                                        type='file'
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        disabled={showTemplates}
                                        className='input absolute left-0 top-0 opacity-0 !h-12 min-w-full text-base cursor-pointer'
                                    />
                                </div>
                            </div>

                            <p className='font-semibold text-center -my-4'>Or</p>

                            <button
                                onClick={toggleTemplates}
                                type="button"
                                className='btn !h-12 !w-full !rounded-[10px] !font-semibold !text-base'
                            >
                                {showTemplates ? 'Hide Templates' : 'Create Event Banner'}
                            </button>
                        </div>

                        <div ref={imageRef} className='h-[237px] max-w-[237px] w-full rounded-[10px] relative'>
                            {formData.event_start_date && showTemplates && <p
                                style={{ color: textConfig.color }}
                                className='absolute top-0 w-11/12 bg-white/10 backdrop-blur-3xl mx-auto right-0 left-0 text-center p-1 rounded-b-full'>{beautifyDate(new Date(formData.event_start_date))}
                            </p>}

                            {showTemplates && <h3
                                style={{ fontSize: textConfig.size + 'px', color: textConfig.color }}
                                className='text-center w-11/12 text-xl leading-[1] font-semibold absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2'>{formData.title}</h3>}
                            <img
                                src={
                                    formData.image instanceof File
                                        ? URL.createObjectURL(formData.image)
                                        : typeof formData.image === 'string' && formData.image
                                            ? formData.image
                                            : UserAvatar
                                }
                                className='h-full w-full object-cover bg-brand-light-gray rounded-[10px]'
                            />
                        </div>
                    </div>

                    {showTemplates && (
                        <div className='flex justify-between mt-5'>
                            {templates.map((template, index) => (
                                <img
                                    onClick={() => handleTemplateSelect(template)}
                                    key={index}
                                    src={template}
                                    alt={`template ${index + 1}`}
                                    width={100}
                                    height={100}
                                    className={`bg-brand-light-gray size-24 object-cover rounded-[10px] cursor-pointer hover:border-2 hover:border-brand-primary transition-all ${selectedTemplate === template ? 'border-2 border-brand-primary' : ''}`}
                                />
                            ))}
                        </div>
                    )}

                    {showTemplates && (
                        <div className='flex justify-between items-center mt-[26px] gap-9'>
                            <div className='flex gap-[18px] items-center flex-1'>
                                <Label className='font-semibold text-nowrap'>Text Size: </Label>
                                <Slider
                                    defaultValue={[textConfig.size]}
                                    value={[textConfig.size]}
                                    onValueChange={(value) => setTextConfig(prev => ({ ...prev, size: value[0] }))}
                                    className='cursor-pointer'
                                    min={16}
                                    max={48}
                                    step={1}
                                />
                            </div>
                            <div className='w-fit flex gap-[18px]'>
                                <Label className='font-semibold text-nowrap'>Select Text Color: </Label>
                                <Input type='color' value={textConfig.color} onChange={(e) => setTextConfig(prev => ({ ...prev, color: e.target.value }))} className='w-[75px] h-6 p-0 outline-0 border-0' />
                            </div>
                        </div>
                    )}

                    <div className='flex flex-col gap-2 mt-5'>
                        <Label className="font-semibold" htmlFor='description'>
                            Description <span className="text-brand-secondary">*</span>
                        </Label>
                        <Textarea
                            id="description"
                            name='description'
                            value={formData.description}
                            onChange={handleInputChangeEventForm}
                            className='input min-w-full !h-32 text-base'
                        />
                    </div>

                    <div className='flex gap-5 w-full mt-5'>
                        <div className='flex flex-col gap-2 w-full'>
                            <Label className='font-semibold'>
                                Start Time <span className="text-brand-secondary">*</span>
                            </Label>

                            <div className='w-full rounded-[10px] relative flex h-12 bg-white p-1'>
                                <div className='bg-brand-light h-full w-full relative rounded-l-md border-white border-r'>
                                    <Input
                                        type='date'
                                        name='event_start_date'
                                        value={formData.event_start_date}
                                        onChange={handleInputChangeEventForm}
                                        className='w-full custom-input h-full absolute opacity-0'
                                    />
                                    <p className='h-full px-3 flex items-center'>
                                        {formData.event_start_date ? beautifyDate(new Date(formData.event_start_date)) : 'DD/MM/YYYY'}
                                    </p>
                                </div>

                                <div className='bg-brand-light h-full w-28 relative rounded-r-md'>
                                    <Input
                                        type='time'
                                        name='start_time'
                                        value={
                                            formData.start_time && formData.start_minute_time
                                                ? `${formData.start_time}:${formData.start_minute_time} ${formData.start_time_type}`
                                                : '00:00 AM'
                                        }
                                        onChange={(e) => handleTimeChange(e, 'start')}
                                        className='w-full custom-input h-full absolute opacity-0'
                                    />
                                    <p className='h-full px-3 flex items-center text-nowrap'>
                                        {formData.start_time && formData.start_minute_time
                                            ? `${formData.start_time}:${formData.start_minute_time} ${formData.start_time_type}`
                                            : '00:00 AM'
                                        }
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className='flex flex-col gap-2 w-full'>
                            <Label className='font-semibold'>
                                End Time <span className="text-brand-secondary">*</span>
                            </Label>

                            <div className='w-full rounded-[10px] relative flex h-12 bg-white p-1'>
                                <div className='bg-brand-light h-full w-full relative rounded-l-md border-white border-r'>
                                    <Input
                                        type='date'
                                        name='event_date'
                                        value={formData.event_date}
                                        onChange={handleInputChangeEventForm}
                                        className='w-full custom-input h-full absolute opacity-0'
                                    />
                                    <p className='h-full px-3 flex items-center'>
                                        {formData.event_date ? beautifyDate(new Date(formData.event_date)) : 'DD/MM/YYYY'}
                                    </p>
                                </div>

                                <div className='bg-brand-light h-full w-28 relative rounded-r-md'>
                                    <Input
                                        type='time'
                                        name='end_time'
                                        value={
                                            formData.end_time && formData.end_minute_time
                                                ? `${formData.end_time}:${formData.end_minute_time} ${formData.end_time_type}`
                                                : '00:00 AM'
                                        }
                                        onChange={(e) => handleTimeChange(e, 'end')}
                                        className='w-full custom-input h-full absolute opacity-0'
                                    />
                                    <p className='h-full px-3 flex items-center text-nowrap'>
                                        {formData.end_time && formData.end_minute_time
                                            ? `${formData.end_time}:${formData.end_minute_time} ${formData.end_time_type}`
                                            : '00:00 AM'
                                        }
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className='flex flex-col gap-2 mt-5'>
                        <Label className='font-semibold' htmlFor='google_map_link'>
                            Location <span className="text-brand-secondary">*</span>
                        </Label>
                        <div className='relative'>
                            {isLoaded ? (
                                <Autocomplete
                                    onLoad={autocomplete => setAutocomplete(autocomplete)}
                                    onPlaceChanged={handlePlaceSelect}
                                >
                                    <Input
                                        id='google_map_link'
                                        name='google_map_link'
                                        type='text'
                                        value={formData.google_map_link}
                                        onChange={handleInputChangeEventForm}
                                        placeholder='Enter Location'
                                        className='input !h-12 min-w-full text-base'
                                    />
                                </Autocomplete>
                            ) : (
                                <Input
                                    id='google_map_link'
                                    name='google_map_link'
                                    type='text'
                                    value={formData.google_map_link}
                                    onChange={handleInputChangeEventForm}
                                    placeholder='Enter Location'
                                    className='input !h-12 min-w-full text-base'
                                />
                            )}
                        </div>

                        <div className='w-full h-60'>
                            <GoogleMap isLoaded={isLoaded} latitude={coords.lat} longitude={coords.lng} />
                        </div>
                    </div>

                    <div className='flex items-center justify-between gap-5 mt-5'>
                        <div className="flex flex-col gap-2 w-full">
                            <Label className="font-semibold" htmlFor='printer_count'>
                                No. of Printers
                            </Label>
                            <Input
                                id="printer_count"
                                name='printer_count'
                                type="number"
                                min="0"
                                value={formData.printer_count || 0}
                                onChange={handleInputChangeEventForm}
                                className='input !h-12 min-w-full text-base'
                            />
                        </div>

                        <div className="flex flex-col gap-2 w-full">
                            <Label className="font-semibold" htmlFor='break_out'>
                                Break Out
                            </Label>
                            <Input
                                id="break_out"
                                name='break_out'
                                type="number"
                                min="0"
                                value={formData.break_out || 0}
                                onChange={handleInputChangeEventForm}
                                className='input !h-12 min-w-full text-base'
                            />
                        </div>

                        <div className="flex flex-col gap-2 w-full">
                            <Label className="font-semibold" htmlFor='view_agenda_by'>
                                View Agenda By <span className="text-brand-secondary">*</span>
                            </Label>
                            <div className='input !h-12 min-w-full flex items-center text-base px-4'>
                                <div className='flex gap-4 items-center text-brand-dark-gray'>
                                    <Label htmlFor="view_agenda_by" className='cursor-pointer'>All</Label>

                                    <Switch
                                        id="view_agenda_by"
                                        checked={formData.view_agenda_by === 1}
                                        onCheckedChange={(checked) => handleSwitchChange(checked, 'view_agenda_by')}
                                        className="data-[state=checked]:bg-brand-primary"
                                    />

                                    <Label htmlFor="view_agenda_by" className='cursor-pointer'>Checked In</Label>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className='flex mt-5 gap-2 flex-col'>
                        <Label className='font-semibold'>Event OTP</Label>
                        <div className='input !h-12 !min-w-full relative !p-1 flex items-center justify-end'>
                            <Input
                                value={formData.event_otp}
                                onChange={handleInputChangeEventForm}
                                name='event_otp'
                                className='input !h-full min-w-full absolute text-base z-10'
                            />
                            <Button
                                onClick={() => setFormData(prev => ({ ...prev, event_otp: getRandomOTP() }))}
                                className='btn-rounded !h-[40px] !rounded-[10px] z-20'
                            >
                                Generate
                            </Button>
                        </div>
                    </div>

                    <Button onClick={handleSubmit} className='btn !mt-9 flex !font-semibold justify-center !h-12 w-80 mx-auto'>Submit</Button>
                </div>
            </div>
        </div>
    )
}

export default AddFirstEvent;