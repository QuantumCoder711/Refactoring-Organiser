import React, { useEffect, useState, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { domain, googleMapsApiKey, UserAvatar } from '@/constants';
import Template1 from "@/assets/templates/template_1.jpg";
import Template2 from "@/assets/templates/template_2.jpg";
import Template3 from "@/assets/templates/template_3.jpg";
import Template4 from "@/assets/templates/template_4.jpg";
import Template5 from "@/assets/templates/template_5.jpg";
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { beautifyDate, compressImage, getRandomOTP } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { AddEventType } from '@/types';
import { useLoadScript, Autocomplete } from '@react-google-maps/api';
import GoogleMap from '@/components/GoogleMap';
import useEventStore from '@/store/eventStore';
import { toast } from 'sonner';
import { CircleCheck, CircleX } from 'lucide-react';
import Wave from '@/components/Wave';
import GoBack from '@/components/GoBack';
import { useParams, useNavigate } from 'react-router-dom';

const UpdateEvent: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();
    const event = useEventStore((state) => state.getEventBySlug(slug));

    const [initialLoading, setInitialLoading] = useState<boolean>(true);
    const [submitLoading, setSubmitLoading] = useState<boolean>(false);

    const { isLoaded } = useLoadScript({
        googleMapsApiKey,
        libraries: ['places'],
    });
    const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);
    const [coords, setCoords] = useState<{ lat: number, lng: number }>({
        lat: 0,
        lng: 0
    });

    const templates: string[] = [Template1, Template2, Template3, Template4, Template5];

    const [formData, setFormData] = useState<AddEventType & { event_end_date?: string }>({
        title: "",
        image: null,
        description: "",
        event_start_date: "",
        event_date: "",
        event_end_date: "",
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

    // Load event data when component mounts
    useEffect(() => {
        // Fetch event data if not already available
        const fetchEventData = async () => {
            setInitialLoading(true);
            try {
                if (slug) {
                    // Get token from localStorage
                    const tokenData = localStorage.getItem("klout-organiser-storage");
                    const token = tokenData ? JSON.parse(tokenData).state.token : null;

                    if (token) {
                        // Fetch events if they're not already loaded
                        await useEventStore.getState().getAllEvents(token);

                        // Check if event exists after loading
                        const loadedEvent = useEventStore.getState().getEventBySlug(slug);
                        if (!loadedEvent) {
                            toast("Event not found. Please check the URL and try again.", {
                                className: "!bg-red-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
                                icon: <CircleX className='size-5' />
                            });
                        }
                    }
                }
            } catch (error) {
                console.error("Error fetching event data:", error);
                toast("Error loading event data", {
                    className: "!bg-red-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
                    icon: <CircleX className='size-5' />
                });
            } finally {
                setInitialLoading(false);
            }
        };

        fetchEventData();
    }, [slug]);

    // Set form data when event is available
    useEffect(() => {
        if (event) {
            console.log("Event data loaded:", event);

            setFormData({
                title: event.title || "",
                image: event.image || null,
                description: event.description || "",
                event_start_date: event.event_start_date || "",
                event_date: event.event_date || "",
                event_end_date: event.event_end_date || event.event_date || "",
                start_time: event.start_time || "",
                start_minute_time: event.start_minute_time || "",
                start_time_type: event.start_time_type || "",
                end_time: event.end_time || "",
                end_minute_time: event.end_minute_time || "",
                end_time_type: event.end_time_type || "",
                status: event.status || 1,
                feedback: event.feedback || 1,
                event_otp: event.event_otp || getRandomOTP(),
                view_agenda_by: event.view_agenda_by || 0,
                google_map_link: event.google_map_link || "",
                event_fee: event.event_fee || "0",
                paid_event: event.paid_event || 0,
                printer_count: event.printer_count || 0,
                pincode: event.pincode || '',
                state: event.state || '',
                city: event.city || '',
                country: event.country || '',
                event_venue_name: event.event_venue_name || '',
                event_venue_address_1: event.event_venue_address_1 || '',
                event_venue_address_2: event.event_venue_address_2 || '',
            });

            // Function to extract coordinates from an address using Google Maps Geocoding API
            const extractCoordinates = async (address: string | undefined) => {
                if (!address) return { lat: 0, lng: 0 }; // Default coordinates

                try {
                    const response = await fetch(
                        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${googleMapsApiKey}`
                    );
                    const data = await response.json();

                    if (data.results && data.results.length > 0) {
                        const { lat, lng } = data.results[0].geometry.location;
                        return { lat, lng };
                    }

                    return { lat: 0, lng: 0 }; // Default coordinates if geocoding fails
                } catch (error) {
                    console.error('Error getting coordinates:', error);
                    return { lat: 0, lng: 0 }; // Default coordinates if request fails
                }
            };

            // Try to extract coordinates from venue address if available
            if (event.event_venue_address_1) {
                extractCoordinates(event.event_venue_address_1).then((coordinates) => {
                    if (coordinates) {
                        setCoords(coordinates);
                    }
                });
            }
        }
    }, [event]);

    const handlePlaceSelect = () => {
        if (autocomplete) {
            const place = autocomplete.getPlace();

            if (place && place.address_components) {
                const addressComponents = place.address_components as google.maps.GeocoderAddressComponent[];

                setFormData(prevState => ({
                    ...prevState,
                    event_venue_name: place.name as string,
                    event_venue_address_1: place.formatted_address as string,
                    event_venue_address_2: place.vicinity as string,
                    google_map_link: place.url as string,
                    pincode: addressComponents[addressComponents.length - 1]?.long_name as string,
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
            event_fee: checked ? prevState.event_fee : "0"
        }));
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;

        if (file) {
            // Check file size before compression
            const fileSizeMB = file.size / 1024 / 1024;
            if (fileSizeMB > 10) {
                toast(`File size (${fileSizeMB.toFixed(2)}MB) exceeds the maximum allowed size of 10MB`, {
                    className: "!bg-red-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
                    icon: <CircleX className='size-5' />
                });
                return;
            }

            try {
                // Show loading toast
                toast("Compressing image...", {
                    className: "!bg-blue-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2"
                });

                // Compress the image to reduce size
                const compressedFile = await compressImage(file, 0.8);

                // Log sizes for debugging
                console.log("Original size:", (file.size / 1024 / 1024).toFixed(2) + "MB");
                console.log("Compressed size:", (compressedFile.size / 1024 / 1024).toFixed(2) + "MB");

                setFormData(prevState => ({
                    ...prevState,
                    image: compressedFile
                }));

                toast("Image compressed successfully", {
                    className: "!bg-green-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
                    icon: <CircleCheck className='size-5' />
                });
            } catch (error) {
                console.error("Error compressing image:", error);
                toast("Error compressing image. Please try a different image.", {
                    className: "!bg-red-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
                    icon: <CircleX className='size-5' />
                });
            }
        } else {
            setFormData(prevState => ({
                ...prevState,
                image: null
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
            'printer_count'
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

        // Validate printer count
        if (isNaN(Number(data.printer_count)) || Number(data.printer_count) < 0) {
            toast("Printer count must be a valid number", {
                className: "!bg-red-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
                icon: <CircleX className='size-5' />
            });
            return false;
        }

        // If paid event, validate event fee
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
        // Validate form before submission
        if (!validateForm(formData)) {
            return;
        }

        if (!event) {
            toast("Event not found", {
                className: "!bg-red-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
                icon: <CircleX className='size-5' />
            });
            return;
        }

        setSubmitLoading(true);
        try {
            // Use the event's UUID for the API call
            const eventUuid = event.uuid;

            // Make sure event_end_date is set if not already
            if (!formData.event_end_date && formData.event_date) {
                setFormData(prev => ({
                    ...prev,
                    event_end_date: formData.event_date
                }));
            }

            // Log the data being sent to help debug
            console.log("Updating event with UUID:", eventUuid);
            console.log("Form data:", formData);

            const response = await useEventStore.getState().updateEvent(eventUuid, formData);
            if (response.status === 200) {
                toast(response.message || "Event updated successfully", {
                    className: "!bg-green-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
                    icon: <CircleCheck className='size-5' />
                });
                // Navigate back to events list after successful update
                navigate('/admin/all-events');
            } else {
                toast(response.message || "Failed to update event", {
                    className: "!bg-red-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
                    icon: <CircleX className='size-5' />
                });
            }
        } catch (error: any) {
            console.error("Error updating event:", error);

            // Handle specific error codes
            if (error.response && error.response.status === 413) {
                toast("File size is too large. Please use a smaller image (less than 2MB).", {
                    className: "!bg-red-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
                    icon: <CircleX className='size-5' />
                });
            }
            // Handle validation errors
            else if (error.response && error.response.status === 422 && error.response.data.errors) {
                // Display each validation error
                Object.entries(error.response.data.errors).forEach(([field, messages]: [string, any]) => {
                    const errorMessages = Array.isArray(messages) ? messages.join(', ') : String(messages);
                    toast(`${field}: ${errorMessages}`, {
                        className: "!bg-red-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
                        icon: <CircleX className='size-5' />
                    });
                });
            } else {
                // Display general error message
                const errorMessage = error.message || "An error occurred while updating the event";
                toast(errorMessage, {
                    className: "!bg-red-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
                    icon: <CircleX className='size-5' />
                });
            }
        } finally {
            setSubmitLoading(false);
        }
    };

    if (initialLoading) {
        return <Wave />;
    }

    if (!event) {
        return (
            <div className="flex flex-col items-center justify-center h-screen">
                <div className="text-xl font-semibold mb-4">Event not found</div>
                <Button onClick={() => navigate('/admin/all-events')} className="btn">
                    Go Back to Events
                </Button>
            </div>
        );
    }

    if (submitLoading) {
        return <Wave />;
    }

    return (
        <div className='relative w-full'>
            <div className='absolute top-0 left-0'>
                <GoBack />
            </div>

            <div className='max-w-[700px] mx-auto rounded-[10px] p-8 bg-brand-background mt-10'>
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

                        {/* Banner Image */}
                        <div className="flex flex-col gap-2">
                            <Label className="font-semibold" htmlFor="image">Banner <span className='text-brand-secondary'>*</span></Label>
                            <div className="input relative overflow-hidden !h-12 min-w-full text-base cursor-pointer flex items-center justify-between p-2 gap-4">
                                <span className="w-full bg-brand-background px-2 h-[34px] rounded-md text-base font-normal flex items-center">Choose File</span>
                                <p className="w-full text-nowrap overflow-hidden text-ellipsis">
                                    {formData.image
                                        ? formData.image instanceof File
                                            ? (formData.image as File).name
                                            : typeof formData.image === 'string'
                                                ? formData.image.split('/').pop()
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
                                    className='input absolute left-0 top-0 opacity-0 !h-12 min-w-full text-base cursor-pointer'
                                />
                            </div>
                        </div>

                        <p className='font-semibold text-center -my-4'>Or</p>

                        {/* Choose Banner Image Button */}
                        <button className='btn !h-12 !w-full !rounded-[10px] !font-semibold !text-base'>Create Event Banner</button>
                    </div>

                    <img
                        height={237}
                        width={237}
                        src={
                            formData.image instanceof File
                                ? URL.createObjectURL(formData.image)
                                : typeof formData.image === 'string' && formData.image
                                    ? `${domain}/${formData.image}`
                                    : UserAvatar
                        }
                        className='max-h-[237px] min-w-[237px] object-cover bg-brand-light-gray rounded-[10px]' />
                </div>

                {/* Templates Images */}
                <div className='flex justify-between mt-5'>
                    {templates.map((image, index) => (
                        <img key={index} src={image} alt="template" width={100} height={100} className='bg-brand-light-gray rounded-[10px] cursor-pointer' />
                    ))}
                </div>

                {/* Text Size and Color */}
                <div className='flex justify-between items-center mt-[26px] gap-9'>
                    <div className='flex gap-[18px] items-center flex-1'>
                        <Label className='font-semibold text-nowrap'>Text Size: </Label>
                        <Slider defaultValue={[33]} className='cursor-pointer' max={100} step={1} />
                    </div>
                    <div className='w-fit flex gap-[18px]'>
                        <Label className='font-semibold text-nowrap'>Select Text Color: </Label>
                        <Input type='color' className='w-[75px] h-6 p-0 outline-0 border-0' />
                    </div>
                </div>

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
                                <p className='h-full px-3 flex items-center'>{beautifyDate(new Date(formData.event_start_date))}</p>
                            </div>

                            {/* For Time */}
                            <div className='bg-brand-light h-full w-28 relative rounded-r-md'>
                                <Input
                                    type='time'
                                    name='start_time'
                                    value={`${formData.start_time || ''}:${formData.start_minute_time || ''}`}
                                    onChange={(e) => handleTimeChange(e, 'start')}
                                    className='w-full custom-input h-full absolute opacity-0'
                                />
                                <p className='h-full px-3 flex items-center text-nowrap'>
                                    {`${formData.start_time || ''}:${formData.start_minute_time || ''} ${formData.start_time_type || ''}`}
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
                                <p className='h-full px-3 flex items-center'>{beautifyDate(new Date(formData.event_date))}</p>
                            </div>

                            {/* For Time */}
                            <div className='bg-brand-light h-full w-28 relative rounded-r-md'>
                                <Input
                                    type='time'
                                    name='end_time'
                                    value={`${formData.end_time || ''}:${formData.end_minute_time || ''}`}
                                    onChange={(e) => handleTimeChange(e, 'end')}
                                    className='w-full custom-input h-full absolute opacity-0'
                                />
                                <p className='h-full px-3 flex items-center text-nowrap'>
                                    {`${formData.end_time || ''}:${formData.end_minute_time || ''} ${formData.end_time_type || ''}`}
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
                                    value={formData.event_venue_address_1}
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

                <Button onClick={handleSubmit} className='btn !mt-9 flex !font-semibold justify-center !h-12 w-80 mx-auto'>Update</Button>
            </div>
        </div>
    );
};

export default UpdateEvent;
