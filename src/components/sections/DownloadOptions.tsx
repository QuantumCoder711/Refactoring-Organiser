import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowUp } from 'lucide-react';
import AppleStore from '@/components/AppleStore';
import GooglePlay from '@/components/GooglePlay';
import AppQr from '@/assets/download-app-qr.png';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const DownloadOptions: React.FC = () => {
    return (
        <section className="flex max-w-[1205px] mx-auto h-full flex-col items-center gap-[29px] flex-shrink-0 my-14">
            <h2 className='capitalize text-center text-[40px] font-bold'>Download Available</h2>
            <div className='flex items-center gap-[30px]'>
                <AppleStore />
                <GooglePlay />
            </div>
            <p className='text-center'>Or scan this <strong>QR code</strong> to download the <strong>App</strong></p>
            <img src={AppQr} alt="QR code for app download" />
            <Button className='btn rounded-full font-semibold text-xl flex items-center gap-5 w-[342px] !h-12'>Launch your free event today <ArrowUp className='rotate-45 size-5' /></Button>

            {/* <div className='flex flex-col gap-[25px] mt-20 text-center'>
                <h2 className='capitalize text-center text-[40px] font-bold'>Plan your next event with ease</h2>
                <h4 className='text-[32px] font-medium'>Let us help you create unforgettable corporate experiences.</h4>
                <p className='text-[32px] font-medium'>Whether you're organizing a roundtable, awards night, or networking event - we're just a message away.</p>
            </div> */}

            <div className='mt-[67px] flex items-center gap-[65px]'>
                <div className='flex flex-col gap-[25px] w-1/2'>
                    <h2 className='capitalize text-[40px] font-bold'>Plan your next event with ease</h2>
                    <h4 className='text-3xl font-medium'>Let us help you create unforgettable corporate experiences.</h4>
                    <p className='text-2xl'>Whether you're organizing a roundtable, awards night, or networking event - we're just a message away.</p>
                    <div className='flex justify-between'>
                        <div>
                            <span className='text-lg font-semibold text-brand-dark-gray'>Phone</span>
                            <p className='text-xl font-semibold'>+91 96433 14331</p>
                        </div>
                        <div>
                            <span className='text-lg font-semibold text-brand-dark-gray'>Mail</span>
                            <p className='text-xl font-semibold'>value@klout.club</p>
                        </div>
                    </div>
                </div>

                <div className='w-1/2 p-10 bg-white rounded-[10px]'>
                    <form className='max-w-[640px] mx-auto flex flex-col gap-5 !text-xl'>
                        {/* Full Name */}
                        <div className='flex gap-[5px] border-b-brand-gray border-b-2 py-3 relative overflow-hidden'>
                            <svg xmlns="http://www.w3.org/2000/svg" width="33" height="33" viewBox="0 0 33 33" fill="none">
                                <path className='fill-brand-dark-gray' d="M16.668 16.332C14.468 16.332 12.5846 15.5487 11.018 13.982C9.4513 12.4154 8.66797 10.532 8.66797 8.33203C8.66797 6.13203 9.4513 4.2487 11.018 2.68203C12.5846 1.11536 14.468 0.332031 16.668 0.332031C18.868 0.332031 20.7513 1.11536 22.318 2.68203C23.8846 4.2487 24.668 6.13203 24.668 8.33203C24.668 10.532 23.8846 12.4154 22.318 13.982C20.7513 15.5487 18.868 16.332 16.668 16.332ZM0.667969 28.332V26.732C0.667969 25.5987 0.959969 24.5574 1.54397 23.608C2.12797 22.6587 2.90263 21.9334 3.86797 21.432C5.93463 20.3987 8.03463 19.624 10.168 19.108C12.3013 18.592 14.468 18.3334 16.668 18.332C18.868 18.3307 21.0346 18.5894 23.168 19.108C25.3013 19.6267 27.4013 20.4014 29.468 21.432C30.4346 21.932 31.21 22.6574 31.794 23.608C32.378 24.5587 32.6693 25.6 32.668 26.732V28.332C32.668 29.432 32.2766 30.374 31.494 31.158C30.7113 31.942 29.7693 32.3334 28.668 32.332H4.66797C3.56797 32.332 2.62663 31.9407 1.84397 31.158C1.0613 30.3754 0.669302 29.4334 0.667969 28.332Z" />
                            </svg>
                            <Input type="text" placeholder='Full Name' className='min-h-full top-0 ml-9 absolute text-[21px] border-none focus-visible:ring-0' />
                        </div>

                        {/* email */}
                        <div className='flex gap-[5px] border-b-brand-gray border-b-2 py-3 relative overflow-hidden'>
                            <svg xmlns="http://www.w3.org/2000/svg" width="33" height="27" viewBox="0 0 33 27" fill="none">
                                <path fillRule="evenodd" clipRule="evenodd" d="M5.46797 26.1332C4.19493 26.1332 2.97403 25.6275 2.07386 24.7273C1.17368 23.8271 0.667969 22.6062 0.667969 21.3332V5.3332C0.667969 4.06016 1.17368 2.83927 2.07386 1.93909C2.97403 1.03892 4.19493 0.533203 5.46797 0.533203H27.868C29.141 0.533203 30.3619 1.03892 31.2621 1.93909C32.1623 2.83927 32.668 4.06016 32.668 5.3332V21.3332C32.668 22.6062 32.1623 23.8271 31.2621 24.7273C30.3619 25.6275 29.141 26.1332 27.868 26.1332H5.46797ZM9.66797 7.2852C9.50498 7.14603 9.3157 7.04102 9.11135 6.97641C8.907 6.91179 8.69175 6.88889 8.47839 6.90907C8.26502 6.92924 8.05788 6.99207 7.86926 7.09384C7.68064 7.1956 7.51439 7.33422 7.38037 7.50148C7.24636 7.66873 7.14731 7.8612 7.08911 8.06746C7.03091 8.27373 7.01474 8.48959 7.04156 8.70222C7.06839 8.91486 7.13766 9.11993 7.24526 9.30528C7.35287 9.49063 7.49661 9.65247 7.66797 9.7812L13.668 14.5828C14.5193 15.2644 15.5774 15.6358 16.668 15.6358C17.7586 15.6358 18.8166 15.2644 19.668 14.5828L25.668 9.7828C25.8321 9.65148 25.9687 9.48912 26.07 9.305C26.1714 9.12088 26.2355 8.91859 26.2587 8.7097C26.2819 8.5008 26.2637 8.28939 26.2051 8.08752C26.1466 7.88566 26.0489 7.6973 25.9176 7.5332C25.7862 7.3691 25.6239 7.23248 25.4398 7.13112C25.2556 7.02977 25.0534 6.96567 24.8445 6.9425C24.6356 6.91932 24.4242 6.93751 24.2223 6.99604C24.0204 7.05457 23.8321 7.15228 23.668 7.2836L17.668 12.0836C17.3842 12.3108 17.0315 12.4346 16.668 12.4346C16.3044 12.4346 15.9517 12.3108 15.668 12.0836L9.66797 7.2852Z" fill="#727272" />
                            </svg>
                            <Input type="text" placeholder='Email Address' className='min-h-full top-0 ml-9 absolute text-[21px] border-none focus-visible:ring-0' />
                        </div>

                        {/* phone */}
                        <div className='flex gap-[5px] border-b-brand-gray border-b-2 py-3 relative overflow-hidden'>
                            <svg xmlns="http://www.w3.org/2000/svg" width="33" height="32" viewBox="0 0 33 32" fill="none">
                                <path d="M22.9911 20.531L22.1822 21.3837C22.1822 21.3837 20.2569 23.4092 15.0036 17.8788C9.75032 12.3484 11.6756 10.3229 11.6756 10.3229L12.1841 9.78458C13.441 8.46316 13.5601 6.33985 12.4632 4.78878L10.2232 1.62075C8.86499 -0.299264 6.24279 -0.553384 4.68724 1.08428L1.89615 4.02077C1.12638 4.83395 0.610824 5.88431 0.673046 7.05138C0.833045 10.0387 2.10948 16.4632 9.22766 23.9588C16.7778 31.9062 23.8622 32.2224 26.7582 31.9363C27.6755 31.8459 28.472 31.3528 29.1137 30.6751L31.6382 28.0172C33.3448 26.2233 32.8648 23.1456 30.6817 21.8901L27.2862 19.9343C25.8533 19.1117 24.1111 19.3527 22.9911 20.531Z" fill="#727272" />
                            </svg>
                            <Input type="text" placeholder='Phone' className='min-h-full top-0 ml-9 absolute text-[21px] border-none focus-visible:ring-0' />
                        </div>

                        {/* subject */}
                        <div className='flex gap-[5px] border-b-brand-gray border-b-2 py-3 relative overflow-hidden'>
                            <svg xmlns="http://www.w3.org/2000/svg" width="33" height="32" viewBox="0 0 33 32" fill="none">
                                <path d="M16.6046 31.8747C25.308 31.8747 32.542 24.656 32.542 15.9373C32.542 7.234 25.292 0 16.5886 0C7.87064 0 0.667969 7.234 0.667969 15.9373C0.667969 24.656 7.88597 31.8747 16.6046 31.8747ZM16.59 18.2813C15.7613 18.2813 15.3086 17.7967 15.2766 16.968L15.058 9.25067C15.0266 8.39067 15.6826 7.782 16.5733 7.782C17.4486 7.782 18.12 8.40667 18.0893 9.266L17.87 16.9693C17.8386 17.8127 17.37 18.282 16.5893 18.282M16.5893 24.032C15.6826 24.032 14.8386 23.3133 14.8386 22.344C14.8386 21.3747 15.6673 20.6573 16.5893 20.6573C17.4953 20.6573 18.3386 21.36 18.3386 22.344C18.3386 23.3287 17.4793 24.032 16.5893 24.032Z" fill="#727272" />
                            </svg>
                            <Input type="text" placeholder='Subject' className='min-h-full top-0 ml-9 absolute text-[21px] border-none focus-visible:ring-0' />
                        </div>

                        {/* message */}
                        <div className='flex gap-[5px] border-b-brand-gray border-b-2 py-3 relative overflow-hidden'>
                            <svg xmlns="http://www.w3.org/2000/svg" width="37" height="36" viewBox="0 0 37 36" fill="none">
                                <path d="M0.667969 30.2364V13.2954C0.668064 11.7667 1.27578 10.301 2.35682 9.22001C3.43785 8.13903 4.90364 7.53135 6.43244 7.53125H8.31531L8.51974 7.54167C9.52825 7.64411 10.3154 8.49571 10.3154 9.5312C10.3154 10.5667 9.52825 11.4183 8.51974 11.5207L8.31531 11.5311H6.43244C5.96454 11.5312 5.51588 11.7172 5.18501 12.0481C4.85415 12.3789 4.66817 12.8275 4.66807 13.2954V30.2364L4.67719 30.4109C4.71731 30.8147 4.89557 31.1942 5.18501 31.4837C5.51588 31.8146 5.96454 32.0006 6.43244 32.0007H23.3743C23.8423 32.0007 24.2908 31.8147 24.6217 31.4837C24.9527 31.1528 25.1387 30.7044 25.1387 30.2364V28.3536C25.1389 27.2494 26.0345 26.3539 27.1387 26.3537C28.2432 26.3537 29.1385 27.2493 29.1388 28.3536V30.2364C29.1388 31.7652 28.5323 33.232 27.4512 34.3131C26.3701 35.3942 24.9032 36.0006 23.3743 36.0006H6.43244C4.90386 36.0005 3.4378 35.3938 2.35682 34.3131C1.3434 33.2997 0.745292 31.9474 0.674479 30.5228L0.667969 30.2364Z" fill="#727272" />
                                <path d="M32.6673 5.95297C32.6673 5.43498 32.4606 4.93776 32.0943 4.57149C31.7739 4.25129 31.3537 4.05335 30.9068 4.00901L30.7141 3.9999C30.2607 3.99989 29.8234 4.15766 29.4758 4.44259L29.3325 4.57149L29.3299 4.5741L28.1085 5.78891L30.8755 8.55707L32.093 7.33705L32.0943 7.33444L32.2245 7.19122C32.5095 6.84362 32.6673 6.40636 32.6673 5.95297ZM14.0782 19.7703V22.5879H16.8947L28.0526 11.3903L25.2751 8.61306L14.0782 19.7703ZM36.6674 5.95297C36.6674 7.53051 36.0399 9.04245 34.9251 10.1586L34.9264 10.1599L32.5449 12.5491C32.4776 12.646 32.402 12.7389 32.3157 12.8252C32.2314 12.9095 32.1405 12.983 32.0462 13.0491L19.1422 25.9993C18.7669 26.3759 18.2571 26.5878 17.7255 26.5878H12.0782C10.9737 26.5878 10.0783 25.6923 10.0781 24.5879V18.9409C10.0781 18.4093 10.2901 17.8995 10.6667 17.5243L23.6162 4.61967C23.6823 4.52538 23.756 4.43437 23.8402 4.35015C23.9278 4.26258 24.0218 4.18501 24.1202 4.11708L26.5069 1.74084C27.6231 0.626144 29.1365 -2.03579e-08 30.7141 0L31.0097 0.0078123C32.4809 0.0809516 33.8773 0.696972 34.9238 1.74344C36.0402 2.85983 36.6674 4.3742 36.6674 5.95297Z" fill="#727272" />
                            </svg>
                            <Textarea rows={4} placeholder='Write your message here...' className='min-h-full top-0 ml-9 absolute text-[21px] border-none focus-visible:ring-0' />
                        </div>
                    </form>
                    <Button className='mt-11 btn !h-16 !rounded-full !font-semibold text-2xl w-[238px]'>Send Message</Button>
                </div>
            </div>

            <h2 className='capitalize mt-[178px] mb-36 text-center text-[40px] font-bold'>Klout Club is free for basic events. Optional upgrades available for advanced insights and premium networking tools.</h2>
        </section>
    )
}

export default DownloadOptions;
