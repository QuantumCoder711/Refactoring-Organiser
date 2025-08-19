import React from 'react';
import { Helmet } from 'react-helmet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SubUserLogin from '@/pages/guest/login/sub-user-login';
import OrganiserLogin from '@/pages/guest/login/organiser-login';

const Login: React.FC = () => {


  return (
    <React.Fragment>

      <Helmet>
        <title>Log in to Klout Club | Manage & Host Business Events in India</title>
        <meta name="title" content="Log in to Klout Club | Manage & Host Business Events in India" />
        <meta name="description" content="Access your Klout Club organizer dashboard to create, manage, and track corporate events in India. Log in now to streamline event check-ins, networking, and attendee insights." />
      </Helmet>

      <div className='h-full w-full grid place-content-center'>
        <Tabs defaultValue="organiser" className="w-[400px] mx-auto">
          <TabsList className='mx-auto'>
            <TabsTrigger value="organiser" className='cursor-pointer'>Organiser</TabsTrigger>
            <TabsTrigger value="sub-user" className='cursor-pointer'>Sub User</TabsTrigger>
          </TabsList>
          <TabsContent value="organiser">
            <OrganiserLogin />
          </TabsContent>
          <TabsContent value="sub-user"><SubUserLogin /></TabsContent>
        </Tabs>

      </div>
    </React.Fragment>
  );
};

export default Login;
