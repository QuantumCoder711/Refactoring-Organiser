import React from "react";
import { VendorCompanyType } from "@/types";
import { getImageUrl } from "@/lib/utils";
import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import { ArrowRight } from "lucide-react";

const VendorCompanyCard: React.FC<{ company: VendorCompanyType }> = ({ company }) => {
    return (
        <div className='w-52 h-52 bg-brand-background flex justify-between flex-col rounded-lg p-4 shadow'>
            <div className='h-24 w-full grid place-content-center overflow-clip bg-white rounded-2xl'>
                <img className='w-full h-full object-contain' src={getImageUrl(company.agency_logo)} alt={company.agency_name} />
            </div>
            <Link to={company.agency_website} target="_blank">
                <Button className='btn !rounded-full !w-full font-bold'>View Website <ArrowRight className='-rotate-45' /></Button>
            </Link>
            <Button className='btn !rounded-full !w-full font-bold'>Submit Quote</Button>
        </div>
    );
}

export default VendorCompanyCard;