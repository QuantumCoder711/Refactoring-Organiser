import { Separator } from '@/components/ui/separator';
import React from 'react';

const SecurityAndCompilance: React.FC = () => {
    return (
        <div className='min-h-screen w-full flex flex-col'>
            <div className='max-w-6xl mx-auto my-10 w-full'>
                <h1 className='text-4xl font-bold text-black'>Security & Compliance</h1>
            </div>
            <Separator className='bg-brand-dark max-w-6xl mx-auto' />

            <div className='max-w-5xl mx-auto my-10 space-y-8 text-black flex-grow'>
                <div className='space-y-4'>
                    <p className='text-3xl font-semibold'>Trust. Transparency. Protection.</p>
                    <p className='font-semibold text-lg'>At Klout Club, your data privacy and security are our top priorities. From infrastructure to app experience, we ensure everything is built on a foundation of trust and compliance.</p>
                </div>

                <div className='space-y-4'>
                    <h2 className='text-3xl font-semibold'>Certified & Trusted Platform</h2>
                    <p className='font-medium'>Officially Approved on App Stores</p>
                    <p>Klout Club is certified and listed on both the Google Play Store and Apple App Store, complying with stringent guidelines for app safety, data privacy, and user security.</p>
                </div>

                <div className='space-y-4'>
                    <h2 className='text-3xl font-semibold'>Secure Cloud Infrastructure</h2>
                    <p>We host all user data on Amazon Web Services (AWS) – one of the most trusted, compliant, and secure cloud platforms globally.</p>
                </div>

                <div className='space-y-4'>
                    <h2 className='text-3xl font-semibold'>Security Built into Every Layer</h2>
                    <h3 className='text-2xl font-medium'>End-to-End Encryption</h3>
                    <p>We use TLS 1.2+ for data in transit and AES-256 encryption for data at rest—ensuring your data is protected from unauthorised access at all times.</p>
                    <h3 className='text-2xl font-medium'>Role-Based Access Control (RBAC)</h3>
                    <p>Data access is tightly controlled based on user roles, combined with multi-factor authentication (MFA) and active session monitoring.</p>
                </div>

                <div className='space-y-4'>
                    <h2 className='text-3xl font-semibold'>Secure APIs & Integrations</h2>
                    <p>Our APIs are designed with strong authentication, validation, and threat detection mechanisms, keeping third-party connections safe and secure.</p>
                </div>

                <div className='space-y-4'>
                    <h2 className='text-3xl font-semibold'>Global Standards & Compliance</h2>
                    <h3 className='text-2xl font-medium'>GDPR Compliant</h3>
                    <p>We follow strict General Data Protection Regulation (GDPR) policies—giving users full control over their data with features like explicit consent and data deletion on request.</p>
                    <h3 className='text-2xl font-medium'>Data Localisation Support</h3>
                    <p>Where required, Klout Club supports regional data storage, ensuring alignment with local privacy and security regulations.</p>
                </div>

                <div className='space-y-4'>
                    <h2 className='text-3xl font-semibold'>Regular Audits & Assessments</h2>
                    <p>We undergo continuous internal checks and external third-party audits to ensure we remain compliant with global standards like ISO 27001 and SOC 2.</p>
                </div>

                <div className='space-y-4'>
                    <h2 className='text-3xl font-semibold'>Ongoing Protection & Monitoring</h2>
                    <ul className='list-disc pl-6 space-y-2'>
                        <li>Real-Time Threat Detection</li>
                        <li>Regular Security Patching & Penetration Testing</li>
                        <li>24/7 Monitoring & Incident Response</li>
                    </ul>
                    <p>We don't just build security once—we build it in every day.</p>
                </div>

                <div className='space-y-4'>
                    <h2 className='text-3xl font-semibold'>Talk to Our Security Team</h2>
                    <p>If you have questions, concerns, or want to report a vulnerability, please reach out to us: <span className="text-brand-primary">value@klout.club</span></p>
                </div>

                <div className='space-y-4'>
                    <p>At Klout Club, security isn't an add-on—it's a foundation. We're committed to keeping your experience safe, seamless, and secure.</p>
                </div>
            </div>
        </div>
    )
}

export default SecurityAndCompilance;
