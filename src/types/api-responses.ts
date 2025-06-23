import { AttendeeType, EventType, UserType, SponsorType, AgendaType } from "./index";

export interface LoginResponse {
    status: number;
    message: string;
    email: string;
    access_token_type: string;
    access_token: string;
    user_id: number;
}

export interface ProfileResponse {
    access_token: string;
    message: string;
    status: number;
    user: UserType;
}

export interface EventResponse {
    status: number;
    message: string;
    data: EventType[];
}

export interface AllEventsAttendeesResponse {
    status: number;
    message: string;
    total_attendees: AttendeeType[];
}

export interface AllEventsSponsorsResponse {
    status: number;
    message: string;
    data: SponsorType[];
    totalsponsors: number;
}

export interface SingleEventAttendeesResponse {
    status: number;
    message: string;
    data: AttendeeType[];
    excel_data: AttendeeType[];
    total_attendees: number;
}

export interface BasicResponse {
    status: number;
    message: string;
}

export interface DeleteAttendeeResponse {
    status: number;
    message: string;
}

export interface CustomCheckInResponse {
    status: number;
    message: string;
}

export interface BulkDeleteAttendeesResponse {
    message: string;
    status: number;
}

export interface AddEventResponse {
    status: number;
    message: string;
    errors?: Record<string, string[]>;
}

export interface AddAttendeeResponse {    
    status: number,
    message: string;
}

export interface DeleteEventResponse {
    status: number;
    message: string;
}

export interface AddBulkAttendeeResponse {
    status: number;
    message: string;
    inserted_records: number;
    duplicate_entries: number;
    invalid_data: Array<{
        email: string;
        phone_number: number;
        reason: string;
    }> | [];
}

export interface GetEventAgendasResponse {
    status: number;
    message: string;
    data: AgendaType[] | [];
}

// Add more API response types here as needed