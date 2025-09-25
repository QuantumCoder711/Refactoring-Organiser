import { appDomain } from "@/constants";
import axios from "axios";

export const getAllCompanies = async (search?: string, industry?: string, employeeSize?: string, page?: number) => {
    try {
        const response = await axios.get(`${appDomain}/api/mapping/v1/company-master/all-company?page=${page ? page : 1}&search=${search ? search : ""}&industry=${industry ? industry : ""}&employeeSize=${employeeSize ? employeeSize : ""}&logo=undefined`);
        return response.data.data.companies;
    } catch (error) {
        throw error;
    }
}

export const getAllDesignations = async (search?: string) => {
    try {
        const response = await axios.get(`${appDomain}/api/mapping/v1/designation-master/all-designation?page=1&search=${search}`);
        console.log(response.data.data.designations);
        return response.data.data.designations;
    } catch (error) {
        throw error;
    }
}

// Getting all industries
export const getAllIndustries = async (search?: string) => {
    try {
        const response = await axios.post(`${appDomain}/api/mapping/v1/company-master/search-industry?search=${search}`);
        if(response.data.status) {
            return response.data.data;
        } else {
            return [];
        }
    } catch (error) {
        throw error;
    }
}

// Adding Non-Existing Company In Database
export const addCompany = async (company: string) => {
    axios.post(`${appDomain}/api/mapping/v1/company-master/add-unmapped-or-new-company`, { company: company.toLowerCase() }, {
        headers: {
            "Content-Type": "application/json"
        }
    });
}