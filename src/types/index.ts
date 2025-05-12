export interface UserType {
    id: number;
    uuid: string;
    first_name: string;
    last_name: string;
    email: string;
    email_verified_at: string | null;
    mobile_number: string;
    company: string;
    company_logo: string | null;
    designation: string;
    pincode: string;
    address: string;
    tnc: number;
    notifications: number;
    created_at: string;
    updated_at: string;
    image: string | null;
    company_name: string;
    designation_name: string;
    deleted_at: string | null;
}

export interface EventType {
    id: number;
    uuid: string;
    user_id: number;
    slug: string;
    title: string;
    description: string;
    event_date: string;
    location: string;
    start_time: string;
    start_time_type: string;
    end_time: string;
    end_time_type: string;
    image: string;
    event_venue_name: string;
    event_venue_address_1: string;
    event_venue_address_2: string;
    city: string;
    state: string;
    country: string;
    pincode: string;
    google_map_link: string;
    created_at: string;
    updated_at: string;
    status: number;
    end_minute_time: string;
    start_minute_time: string;
    qr_code: string;
    start_time_format: string;
    feedback: number;
    event_start_date: string;
    event_end_date: string;
    why_attend_info: string | null;
    more_information: string | null;
    t_and_conditions: string | null;
    pdf_path: string | null;
    video_url: string | null;
    printer_count: number | null;
    view_agenda_by: number;
    event_otp: string;
    paid_event: number;
    event_fee: string;
    total_attendee: number;
    total_accepted: number;
    total_not_accepted: number;
    total_rejected: number;
    total_checkedin: number;
    total_checkedin_speaker: number;
    total_checkedin_sponsor: number;
    total_pending_delegate: number;
}

export interface AddEventType {
    title: string;
    image: File | string | null; // This can be either a File from the file input or a string for selected template URLs
    description: string;
    event_start_date: string;
    event_end_date: string;
    event_date: string;
    google_map_link: string;
    start_time: string; // New field for formatted start time (e.g., '16:05')
    start_minute_time: string; // New field for start time minute part (e.g., '05')
    start_time_type: string; // New field for AM/PM designation (e.g., 'PM')
    end_time: string; // New field for formatted end time (e.g., '17:05')
    end_minute_time: string; // New field for end time minute part (e.g., '05')
    end_time_type: string; // New field for AM/PM designation (e.g., 'PM')
    status: number;
    feedback: number;
    event_otp: string;
    view_agenda_by: number;
    event_fee: string;
    paid_event: number;
}

export interface AttendeeType {
    title: string;
    id: number;
    uuid: string;
    user_id: number;
    event_id: number;
    first_name: string;
    last_name: string;
    email_id: string;
    phone_number: string;
    website: string;
    linkedin_page_link: string;
    employee_size: string;
    company_turn_over: string;
    status: string;
    created_at: string;
    updated_at: string;
    image: string | null;
    virtual_business_card: string | null;
    profile_completed: number;
    alternate_mobile_number: string;
    alternate_email: string | null;
    company_name: string;
    industry: string;
    job_title: string;
    event_invitation: number;
    user_invitation_request: number;
    check_in: number;
    check_in_second: number | null;
    check_in_third: number | null;
    check_in_forth: number | null;
    check_in_fifth: number | null;
    check_in_time: string | null;
    check_in_second_time: string | null;
    check_in_third_time: string | null;
    check_in_forth_time: string | null;
    check_in_fifth_time: string | null;
    not_invited: number;
    award_winner: number;
}

export interface CompanyType {
    id: number;
    parent_id: number;
    name: string;
    created_at: string;
    updated_at: string;
}

export interface JobTitleType extends CompanyType { }

export interface IndustryType extends CompanyType { }

export interface SponsorType extends AttendeeType { }


export interface MessageTemplateType {
    event_id: string;
    send_to: string;
    send_method: string;
    subject: string;
    message: string;
    start_date: string;
    delivery_schedule: string;
    start_date_time: string;
    start_date_type: string;
    end_date: string;
    end_date_time: string;
    end_date_type: string;
    no_of_times: number;
    hour_interval: number;
    status: number;
    check_in: number;
}

export interface SendReminderType extends Omit<MessageTemplateType, 'check_in'> { }

export interface SendSameDayReminderType extends MessageTemplateType { }

export interface SessionReminderType extends MessageTemplateType { }

export interface VisitBoothReminderType extends MessageTemplateType { }

export interface DayTwoReminderType extends MessageTemplateType { }


export interface AgendaType {
    id: number;
    uuid: string;
    event_id: number;
    title: string;
    description: string;
    tag_speakers: string;
    event_date: string;
    start_time: string;
    start_time_type: string;
    end_time: string;
    end_time_type: string;
    image_path: string | null;
    created_at: string;
    updated_at: string;
    start_minute_time: string;
    end_minute_time: string;
    position: number;
    speakers: AttendeeType[] | [];
}
