import { appDomain } from "@/constants";
import axios from "axios";

export const getAllCompanies = async (search?: string) => {
    try {
        const response = await axios.get(`${appDomain}/api/mapping/v1/company-master/all-company?page=1&search=${search}&industry=&employeeSize=&logo=undefined`);
        return response.data.data.companies;
    } catch (error) {
        throw error;
    }
}

export const getAllDesignations = async (search?: string) => {
    try {
        const response = await axios.get(`${appDomain}/api/mapping/v1/designation-master/all-designation?page=1&search=${search}`);
        return response.data.data.designations;
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