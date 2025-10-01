import React, { useState, useEffect } from 'react';
import GoBack from '@/components/GoBack';

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useParams } from 'react-router-dom';
import useEventStore from '@/store/eventStore';
import useAuthStore from '@/store/authStore';
import { additionalDomain } from '@/constants';
import axios from 'axios';
import { toast } from 'sonner';
import { CircleCheck, CircleX } from 'lucide-react';
import Wave from '@/components/Wave';

const parseText = (text: string): string => {
  // Escape HTML to prevent injection (optional)
  const escapeHtml = (unsafe: string) =>
    unsafe
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");

  // First, escape the text if needed
  const escapedText = escapeHtml(text);

  // Convert **bold** to <strong>bold</strong>
  const boldedText = escapedText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

  // Replace newlines with <br />
  const withLineBreaks = boldedText.replace(/\n/g, '<br />');

  return withLineBreaks;
};

const AiTranscriber: React.FC = () => {

  const { slug } = useParams();

  const event = useEventStore(state => state.getEventBySlug(slug));
  const user = useAuthStore(state => state.user);

  const [activeTab, setActiveTab] = useState<string>("upload");

  const [loading, setLoading] = useState<boolean>(false);
  const [summary, setSummary] = useState<string>('');
  const [processing, setProcessing] = useState<boolean>(false);

  const [form, setForm] = useState<{ youtubeUrl: string, eventUuid: string, userId: number, file: File | null }>({
    youtubeUrl: '',
    eventUuid: event?.uuid || '',
    userId: user?.id as number,
    file: null,
  });

  useEffect(() => {
    if (event && user && activeTab) {
      axios.post(`${additionalDomain}/api/get-transcribed-report`, { eventUuid: event?.uuid, userId: user?.id }).then(res => {
        if (res.data.data.completedStatus !== 3) {
          setProcessing(true);
        }

        if (res.data.data.completedStatus === 3) {
          setSummary(res.data.data.summaryText);
          setProcessing(false);
        }
      })
    }
  }, [event, user, activeTab]);

  const handleUpload = async () => {
    if (!form.youtubeUrl || !form.eventUuid || !form.userId) {
      toast("Some fields are missing", {
        className: "!bg-red-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
        icon: <CircleX className="size-5" />
      });
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post(`${additionalDomain}/api/transcribe`, form, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      if (res.data.id) {
        toast(res.data.message, {
          className: "!bg-green-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
          icon: <CircleCheck className="size-5" />
        });
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
      setProcessing(true);
      setForm({
        youtubeUrl: '',
        eventUuid: event?.uuid || '',
        userId: user?.id as number,
        file: null,
      })
    }
  }

  const handleDownload = () => {
    const blob = new Blob([summary], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `summary-${event?.title || 'report'}.txt`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }

  if (loading) {
    return <Wave />
  }

  return (
    <div className='relative w-full h-full'>
      <div className='absolute top-0 left-0'>
        <GoBack />
      </div>

      <div className='max-w-3xl bg-muted mx-auto rounded-[10px] p-7'>
        <Tabs defaultValue="upload" className="mx-auto" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="p-0 min-w-fit bg-background mx-auto !max-h-10">
            <TabsTrigger
              value="upload"
              className="max-h-10 px-3 md:px-4 h-full font-medium !py-0 cursor-pointer"
            >
              Upload Files
            </TabsTrigger>
            <TabsTrigger
              value="summary"
              className="max-h-10 px-3 md:px-4 h-full font-medium !py-0 cursor-pointer"
            >
              Summary
            </TabsTrigger></TabsList>
          <TabsContent value="upload" className="mt-5 flex gap-5 flex-col">

            {!processing ? <><div className='flex flex-col gap-2'>
              <Label className='font-semibold'>Video URL<span className='text-secondary'>*</span></Label>
              <Input
                type="text"
                value={form.youtubeUrl}
                onChange={(e) => setForm({ ...form, youtubeUrl: e.target.value })}
                className='input !h-12 min-w-full text-base'
              />
            </div>

              <div className="input relative overflow-hidden shadow-sm bg-background/50 rounded-md !h-12 min-w-full text-base cursor-pointer flex items-center justify-between p-2 gap-4">
                <span className="min-w-fit bg-muted px-2 h-[34px] rounded-md text-base font-normal flex items-center">Choose File</span>
                <p className="w-full text-nowrap overflow-hidden text-ellipsis">{form.file ? form.file?.name : 'No file Chosen'}</p>
                <Input
                  id="image"
                  name="image"
                  type='file'
                  accept="image/*"
                  className='input absolute left-0 top-0 opacity-0 !h-12 min-w-full text-base cursor-pointer'
                  onChange={(e) => setForm({ ...form, file: e.target.files ? e.target.files[0] : null })}
                />
              </div>

              <div className='w-full flex justify-center mt-9'>
                <Button className='' onClick={handleUpload}>Upload</Button>
              </div></> : <div className="p-5 bg-muted backdrop-blur-3xl border border-yellow-300 rounded-lg text-center">
              <h3 className="text-xl font-medium text-yellow-800 mb-2">Processing Summary</h3>
              <p className="text-yellow-800">Your summary is currently being processed. This may take some time.</p>
              <p className="text-yellow-700 mt-2 text-sm">You can check the "Summary" tab to see when your processed summary is available.</p>
            </div>}
          </TabsContent>

          <TabsContent value="summary">
            <div className='flex flex-col gap-4'>
              <div className='flex justify-end'>
                <Button
                  onClick={handleDownload}
                >
                  Download Summary
                </Button>
              </div>
              <p dangerouslySetInnerHTML={{ __html: parseText(summary) }} className='text-left mt-8' />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default AiTranscriber;