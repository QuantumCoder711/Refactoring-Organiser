export interface UserType {
    id: number;
    uuid: string;
    first_name: string;
    last_name: string;
    email: string;
    email_verified_at: string | null;
    mobile_number: string;
    company: string;
    company_logo: string;
    designation: string;
    pincode: string;
    address: string;
    tnc: number;
    notifications: string;
    created_at: string;
    updated_at: string;
    image: string;
    company_name: string;
    designation_name: string | null;
    deleted_at: string | null;
}