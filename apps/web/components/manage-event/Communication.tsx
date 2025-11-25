'use client';

import {
  useCreateEventCommunication,
  useEventCommunications,
} from '@/lib/react-query/communication';
import { communication, CommunicationForm } from '@/lib/zod/communication';
import { zodResolver } from '@hookform/resolvers/zod';
import { ChatContainer } from '@/components/chat/chat-container';
import { useRef } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '../ui/button';
import { FormField, FormItem } from '../ui/form';
import FormProvider from '../ui/form-provider';
import Tiptap, { EditorRefType } from '../ui/tiptap';
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
      plaintextContent: '',
    },
  });

  const { mutate: createCommunication, isPending } = useCreateEventCommunication(eventId);
  const { data: communicationsData } = useEventCommunications(eventId);
  const { setValue, watch } = form;

  const rawMessages = (communicationsData?.data ?? []) as any[];
  const chatMessages = rawMessages.map((m) => {
    const user = m.user ?? {};
    const fullName = user.fullName || user.primaryEmail || 'Unknown user';
    const profileIcon = user.profileIcon ?? 1;
    const id = m.id ?? `${m.userId ?? 'unknown'}-${Math.random()}`;
    return {
      id,
      content: m.content ?? '',
      userId: user.id,
      createdAt: m.createdAt,
      updatedAt: m.updatedAt,
      timestamp: m.updatedAt || m.createdAt,
      user: {
        id: user.id ?? m.userId ?? 'Unknown user',
        fullName,
        profileIcon,
      },
    };
  });

  const content = watch('content');
  const plaintextContent = watch('plaintextContent');

  const hasContent = plaintextContent?.trim().length > 0;

  const tiptapEditorRef = useRef<EditorRefType | null>(null);

  const onSubmit = (data: CommunicationForm) => {
    createCommunication(data, {
      onSuccess: () => {
        form.reset();
        form.setValue('content', '');
      },
    });

    tiptapEditorRef.current?.editor?.commands.clearContent();
  };

  return (
    <section className="flex w-full flex-col space-y-8">
      <section>
        {communicationsData?.data?.length > 0 && (
          <section className="w-full">
            <ChatContainer
              subtitle="Communicate with your Attendees"
              messages={chatMessages}
              isLoading={!communicationsData && !communicationsData?.data}
              variant="fullscreen"
            />
          </section>
        )}
        <FormProvider methods={form} onSubmit={form.handleSubmit(onSubmit)}>
          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <Tiptap
                  ref={tiptapEditorRef}
                  description={field.value}
                  limit={300}
                  onChange={(richtext, plaintext) => {
                    field.onChange(richtext);
                    setValue('plaintextContent', plaintext);
                  }}
                />
              </FormItem>
            )}
          />
          <Button className="float-end mt-2 rounded-[6px]" disabled={isPending || !hasContent}>
            {isPending ? <LoaderCircle className="animate-spin" /> : <>Send</>}
          </Button>
        </FormProvider>
      </section>
    </section>
  );
};

export default Communication;
