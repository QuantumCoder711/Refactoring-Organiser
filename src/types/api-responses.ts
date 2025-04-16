import { AttendeeType, EventType, UserType, SponsorType } from "./index";

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
// Add more API response types here as needed 