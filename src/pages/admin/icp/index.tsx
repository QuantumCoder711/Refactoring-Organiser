import React from 'react';
import { Link } from 'react-router-dom';
import { Plus, Save, Upload } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

const ICP: React.FC = () => {

    return (
        <div className="container mx-auto px-4">
            <div className="text-center">
                <h1 className="text-2xl font-bold tracking-tight mb-5">ICP Management</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                <Link to="/icp/create">
                    <Card
                        className="cursor-pointer transition-all hover:shadow-lg hover:border-primary/50 h-64 flex flex-col"
                    >
                        <CardHeader className="flex flex-col items-center justify-center flex-1">
                            <div className="p-4 rounded-full bg-primary/10 mb-4">
                                <Plus className="h-10 w-10 text-primary" />
                            </div>
                            <CardTitle className="text-xl font-semibold">Create New ICP</CardTitle>
                            <CardDescription className="text-center mt-2">
                                Manually create a new ICP with custom details
                            </CardDescription>
                        </CardHeader>
                    </Card>
                </Link>

                <Link to="/icp/upload">
                <Card
                    className="cursor-pointer transition-all hover:shadow-lg hover:border-primary/50 h-64 flex flex-col"
                >
                    <CardHeader className="flex flex-col items-center justify-center flex-1">
                        <div className="p-4 rounded-full bg-primary/10 mb-4">
                            <Upload className="h-10 w-10 text-primary" />
                        </div>
                        <CardTitle className="text-xl font-semibold">Upload ICP</CardTitle>
                        <CardDescription className="text-center mt-2">
                            Upload multiple ICPs using an Excel or CSV file
                        </CardDescription>
                    </CardHeader>
                </Card>
                </Link>

                <Link to="/icp/saved">
                <Card
                    className="cursor-pointer transition-all hover:shadow-lg hover:border-primary/50 h-64 flex flex-col"
                >
                    <CardHeader className="flex flex-col items-center justify-center flex-1">
                        <div className="p-4 rounded-full bg-primary/10 mb-4">
                            <Save className="h-10 w-10 text-primary" />
                        </div>
                        <CardTitle className="text-xl font-semibold">Saved ICP</CardTitle>
                        <CardDescription className="text-center mt-2">
                            View and manage saved ICPs
                        </CardDescription>
                    </CardHeader>
                </Card>
                </Link>
            </div>
        </div>
    );
};

export default ICP;