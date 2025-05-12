'use client';

import {
  useCreateEventCommunication,
  useEventCommunications,
} from '@/lib/react-query/communication';
import { cn } from '@/lib/utils';
import { communication, CommunicationForm } from '@/lib/zod/communication';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { FormField, FormItem } from '../ui/form';
import FormProvider from '../ui/form-provider';
import { ScrollArea } from '../ui/scroll-area';
import Tiptap from '../ui/tiptap';
import ChatMessage from './ChatMessage';
import { LoaderCircle } from 'lucide-react';

interface CommunicationProps {
  eventId: string;
  updatedAt?: string;
}

interface CommunicationMessage {
  user: {
    name: string;
  };
  content: string;
  time: string;
  updatedAt: string;
}

interface CommunicationsData {
  data: CommunicationMessage[];
}

const Communication = ({ eventId }: CommunicationProps) => {
  const form = useForm<CommunicationForm>({
    resolver: zodResolver(communication),
    defaultValues: {
      content: '',
    },
  });

  const { mutate: createCommunication } = useCreateEventCommunication(eventId);
  const { data: communicationsData } = useEventCommunications(eventId);

  const onSubmit = (data: CommunicationForm) => {
    createCommunication(data, {
      onSuccess: () => form.reset(),
    });
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
    });
  };

  return (
    <section className="flex w-full flex-col space-y-8">
      <h3>Communicate with your Attendees</h3>
      <section>
        {communicationsData?.data?.length > 0 && (
          <section>
            <Card className="w-full border-none bg-transparent lg:w-1/2">
              <CardContent>
                <ScrollArea className={cn(communicationsData?.data?.length > 3 && 'h-96 p-4')}>
                  {(communicationsData as CommunicationsData)?.data?.map(
                    (msg: CommunicationMessage, index: number) => (
                      <ChatMessage
                        key={index}
                        user={msg.user}
                        message={msg.content}
                        time={formatTime(msg.updatedAt)}
                      />
                    )
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </section>
        )}
        <FormProvider methods={form} onSubmit={form.handleSubmit(onSubmit)}>
          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <Tiptap description={field.value} limit={300} onChange={field.onChange} />
              </FormItem>
            )}
          />
          <Button className="float-end mt-2 rounded-[6px]" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? <LoaderCircle className="animate-spin" /> : <>Send</>}
          </Button>
        </FormProvider>
      </section>
    </section>
  );
};

export default Communication;
