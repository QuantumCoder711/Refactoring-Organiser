import React from "react";
import { VendorCompanyType } from "@/types";
import { getImageUrl } from "@/lib/utils";
import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import { ArrowRight } from "lucide-react";

const VendorCompanyCard: React.FC<{ company: VendorCompanyType }> = ({ company }) => {
    return (
        <div className='w-full bg-accent flex gap-3 justify-between flex-col rounded-lg p-4 shadow'>
            <div className='h-40 w-full rounded-md bg-background/50'>
                <img className='w-full h-full object-cover rounded-md' src={getImageUrl(company.agency_logo)} alt={company.agency_name} />
            </div>

            <h3 className="capitalize">{company.agency_name}</h3>
            <div className="grid grid-cols-2 gap-3">
                <Link to={company.agency_website} target="_blank">
                    <Button>View Website <ArrowRight className='-rotate-45' /></Button>
                </Link>
                <Button disabled>Submit Quote</Button>
            </div>
        </div>
    );
}

export default VendorCompanyCard;