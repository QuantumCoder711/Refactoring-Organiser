import React, { useState, useCallback, useRef } from 'react';
import * as htmlToImage from 'html-to-image';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { googleMapsApiKey, UserAvatar } from '@/constants';
import Template1 from "@/assets/templates/template_1.jpg";
import Template2 from "@/assets/templates/template_2.jpg";
import Template3 from "@/assets/templates/template_3.jpg";
import Template4 from "@/assets/templates/template_4.jpg";
import Template5 from "@/assets/templates/template_5.jpg";
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { beautifyDate, getRandomOTP } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { AddEventType } from '@/types';
import { useLoadScript, Autocomplete } from '@react-google-maps/api';
import GoogleMap from '@/components/GoogleMap';
import useEventStore from '@/store/eventStore';
import { toast } from 'sonner';
import { CircleCheck, CircleX } from 'lucide-react';
import Wave from '@/components/Wave';

const AddEvent: React.FC = () => {

    const { isLoaded } = useLoadScript({
        googleMapsApiKey,
        libraries: ['places'],
    });

    const [loading, setLoading] = useState<boolean>(false);

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

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
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
            // Set the image source to 'upload'
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

        // Also modify handleTemplateSelect to improve template handling
        const handleTemplateSelect = (template: string) => {
            // Set the image source to 'template'
            setImageSource('template');
            setSelectedTemplate(template);
    
            // When a template is selected, set the image in formData to the template string
            // (it will be converted to a File during submission)
            setFormData(prevState => ({
                ...prevState,
                image: template
            }));
        };

    // Toggle template display and reset selections
    const toggleTemplates = () => {
        const newShowTemplates = !showTemplates;
        setShowTemplates(newShowTemplates);

        if (newShowTemplates) {
            // If showing templates, clear any uploaded image
            if (imageSource === 'upload') {
                setFormData(prevState => ({
                    ...prevState,
                    image: null
                }));
                setImageSource(null);
            }
        } else {
            // If hiding templates, clear any selected template
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

    // Validation function
    const validateForm = useCallback((data: AddEventType) => {
        // Define required fields based on UI asterisks
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

        // Check required fields
        const missingFields = requiredFields.filter(field => {
            if (field === 'image') {
                return !data[field];
            }
            return !data[field] || data[field] === '';
        });

        if (missingFields.length > 0) {
            toast("Please fill in all required fields marked with *", {
                className: "!bg-red-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
                icon: <CircleX className='size-5' />
            });
            return false;
        }

        // Validate dates
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

        // Validate printer count - must not be negative
        if (data.printer_count !== null && data.printer_count < 0) {
            toast("Printer count cannot be negative", {
                className: "!bg-red-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
                icon: <CircleX className='size-5' />
            });
            return false;
        }

        // If paid event, validate event fee - must be at least 1
        if (data.paid_event === 1 && (isNaN(Number(data.event_fee)) || Number(data.event_fee) < 1)) {
            toast("Paid events must have a fee of at least 1", {
                className: "!bg-red-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
                icon: <CircleX className='size-5' />
            });
            return false;
        }

        return true;
    }, []);

    // Modified handleSubmit function - place this in your AddEvent component
    const handleSubmit = async () => {
        // First, handle the template image if needed
        if (imageSource === 'template' && selectedTemplate && imageRef.current) {
            try {
                setLoading(true);

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
                        skipFonts: true, // Skip external fonts
                        filter: (node) => {
                            // Filter out problematic elements
                            return !node.classList?.contains('google-map') && 
                                   !node.classList?.contains('map-container');
                        }
                    });

                    // Convert the Data URL to a Blob and create a File
                    const response = await fetch(dataUrl);
                    const blob = await response.blob();
                    const file = new File([blob], 'template.png', { type: 'image/png' });

                    // Update the form data with the new file
                    setFormData(prevData => ({
                        ...prevData,
                        image: file
                    }));

                    // Now continue with validation and submission
                    await submitFormData({
                        ...formData,
                        image: file
                    });
                } finally {
                    // Clean up the temporary container
                    document.body.removeChild(container);
                }
            } catch (error) {
                console.error('Error processing template:', error);
                toast("Error creating image from template. Please try again.", {
                    className: "!bg-red-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
                    icon: <CircleX className='size-5' />
                });
                setLoading(false);
            }
        } else {
            // For normal image upload or when no image is selected
            setLoading(true);
            await submitFormData(formData);
        }
    };

    // Separate the actual form submission from image processing
    const submitFormData = async (dataToSubmit: AddEventType) => {
        try {
            // Validate form before submission
            if (!validateForm(dataToSubmit)) {
                setLoading(false);
                return;
            }

            const response = await useEventStore.getState().addEvent(dataToSubmit);
            if (response.status === 200) {
                toast(response.message, {
                    className: "!bg-green-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
                    icon: <CircleCheck className='size-5' />
                });

                // Reset form on success
                resetForm();
                
                // Redirect to dashboard
                window.location.href = '/dashboard';
            } else {
                toast(response.message, {
                    className: "!bg-red-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
                    icon: <CircleX className='size-5' />
                });
            }
        } catch (error: any) {
            console.error("Error adding event:", error);

            // Handle validation errors
            if (error.response && error.response.status === 422 && error.response.data.errors) {
                // Display each validation error
                Object.entries(error.response.data.errors).forEach(([field, messages]) => {
                    const errorMessages = Array.isArray(messages) ? messages.join(', ') : String(messages);
                    toast(`${field}: ${errorMessages}`, {
                        className: "!bg-red-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
                        icon: <CircleX className='size-5' />
                    });
                });
            } else {
                // Display general error message
                const errorMessage = error.message || "An error occurred while adding the event";
                toast(errorMessage, {
                    className: "!bg-red-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
                    icon: <CircleX className='size-5' />
                });
            }
        } finally {
            setLoading(false);
        }
    };

    // Add this helper function to reset the form
    const resetForm = () => {
        setFormData({
            title: "",
            image: null,
            description: "",
            event_start_date: "",
            event_date: "",
            google_map_link: "",
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
        });
        setImageSource(null);
        setSelectedTemplate(null);
        setCoords({
            lat: 0,
            lng: 0
        });
    };

    if (loading) {
        return <Wave />
    }

    return (
        <div className=''>

            <div className='max-w-[700px] mx-auto rounded-[10px] p-8 bg-brand-background'>
                {/* Event Name */}
                <div className="flex flex-col gap-2 w-full">
                    <Label className="font-semibold" htmlFor='title'>
                        Event Name <span className="text-brand-secondary">*</span>
                    </Label>
                    <Input
                        id="title"
                        name='title'
                        type="text"
                        value={formData.title}
                        onChange={handleInputChange}
                        className='input !h-12 min-w-full text-base'
                    />
                </div>

                {/* Event Type, Image, and Choose Banner Image Button */}
                <div className='flex gap-7 mt-5 items-center'>
                    <div className='flex flex-col w-full gap-5'>
                        {/* Event Type */}
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
                                            onChange={handleInputChange}
                                            className='input !h-11 focus-visible:!ring-0 focus-visible:!ring-offset-0 w-full text-base'
                                        />
                                    </div>
                                </div>}
                            </div>
                        </div>

                        {/* Banner Image - Disabled when templates are showing */}
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

                        {/* Toggle Template Button */}
                        <button
                            onClick={toggleTemplates}
                            type="button"
                            className='btn !h-12 !w-full !rounded-[10px] !font-semibold !text-base'
                        >
                            {showTemplates ? 'Hide Templates' : 'Create Event Banner'}
                        </button>
                    </div>

                    {/* Image Preview */}
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

                {/* Template Images Section */}
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

                {/* Text Size and Color for Templates */}
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

                {/* Description Box */}
                <div className='flex flex-col gap-2 mt-5'>
                    <Label className="font-semibold" htmlFor='description'>
                        Description <span className="text-brand-secondary">*</span>
                    </Label>
                    <Textarea
                        id="description"
                        name='description'
                        value={formData.description}
                        onChange={handleInputChange}
                        className='input min-w-full !h-32 text-base'
                    />
                </div>

                {/* Start Time & End Time */}
                <div className='flex gap-5 w-full mt-5'>
                    {/* Start Time */}
                    <div className='flex flex-col gap-2 w-full'>
                        <Label className='font-semibold'>
                            Start Time <span className="text-brand-secondary">*</span>
                        </Label>

                        <div className='w-full rounded-[10px] relative flex h-12 bg-white p-1'>
                            {/* For Date */}
                            <div className='bg-brand-light h-full w-full relative rounded-l-md border-white border-r'>
                                <Input
                                    type='date'
                                    name='event_start_date'
                                    value={formData.event_start_date}
                                    onChange={handleInputChange}
                                    className='w-full custom-input h-full absolute opacity-0'
                                />
                                <p className='h-full px-3 flex items-center'>
                                    {formData.event_start_date ? beautifyDate(new Date(formData.event_start_date)) : 'DD/MM/YYYY'}
                                </p>
                            </div>

                            {/* For Time */}
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

                    {/* End Time */}
                    <div className='flex flex-col gap-2 w-full'>
                        <Label className='font-semibold'>
                            End Time <span className="text-brand-secondary">*</span>
                        </Label>

                        <div className='w-full rounded-[10px] relative flex h-12 bg-white p-1'>
                            {/* For Date */}
                            <div className='bg-brand-light h-full w-full relative rounded-l-md border-white border-r'>
                                <Input
                                    type='date'
                                    name='event_date'
                                    value={formData.event_date}
                                    onChange={handleInputChange}
                                    className='w-full custom-input h-full absolute opacity-0'
                                />
                                <p className='h-full px-3 flex items-center'>
                                    {formData.event_date ? beautifyDate(new Date(formData.event_date)) : 'DD/MM/YYYY'}
                                </p>
                            </div>

                            {/* For Time */}
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

                {/* Location */}
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
                                    onChange={handleInputChange}
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
                                onChange={handleInputChange}
                                placeholder='Enter Location'
                                className='input !h-12 min-w-full text-base'
                            />
                        )}

                    </div>

                    <div className='w-full h-60'>
                        <GoogleMap isLoaded={isLoaded} latitude={coords.lat} longitude={coords.lng} />
                    </div>

                </div>

                {/* Printers Count */}
                <div className='flex items-center justify-between gap-5 mt-5'>
                    <div className="flex flex-col gap-2 w-full">
                        <Label className="font-semibold" htmlFor='printer_count'>
                            No. of Printers <span className="text-brand-secondary">*</span>
                        </Label>
                        <Input
                            id="printer_count"
                            name='printer_count'
                            type="number"
                            value={formData.printer_count !== null ? formData.printer_count.toString() : ''}
                            onChange={handleInputChange}
                            className='input !h-12 min-w-full text-base'
                        />
                    </div>

                    {/* View Agenda By */}
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
                            onChange={handleInputChange}
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
    )
}

export default AddEvent;