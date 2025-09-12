import GoBack from '@/components/GoBack';
import Wave from '@/components/Wave';
import useAuthStore from '@/store/authStore';
import useICPStore from '@/store/icpStore';
import React, { useEffect } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

const ICP: React.FC = () => {
    const { user } = useAuthStore(state => state);
    const { icpSheets, loading, getICPSheets } = useICPStore(state => state);

    useEffect(() => {
        if (user) getICPSheets(user.id as number);
    }, [user, getICPSheets]);

    if (loading) {
        return <Wave />
    }
    return (
        <div>
            <div className='flex items-center gap-3'>
                <GoBack />
                <h1 className='text-xl font-semibold'>ICP</h1>
            </div>

            <div>
                {icpSheets.map((sheet) => (
                    <div key={sheet.uuid} className="mt-6">
                        <h2 className="text-lg font-medium mb-4">{sheet.uuid}</h2>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Company Name</TableHead>
                                    <TableHead>Designation</TableHead>
                                    <TableHead>Priority</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {sheet.sheetRows.map((row, index) => (
                                    <TableRow key={index}>
                                        <TableCell>{row.companyname}</TableCell>
                                        <TableCell>{row.designation.join(', ')}</TableCell>
                                        <TableCell>{row.priority}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default ICP;
