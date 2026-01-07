'use client';

import * as React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDate } from '@/utils/formatDate';

import { Chat, ChatHeader, ChatMessages, ChatMessage, ChatBubble } from '@/components/ui/chat';

import { Loader2 } from 'lucide-react';
import { cn, getUserDisplayName } from '@/lib/utils';
import { ChatMessage as ChatMessageType } from '@/components/chat/types';
import { getProfilePictureUrl } from '@/utils/event';

interface ChatContainerProps {
  variant?: 'default' | 'compact' | 'fullscreen';
  title?: string;
  subtitle?: string;
  messages: ChatMessageType[];
  className?: string;
  isLoading?: boolean;
}

export function ChatContainer({
  variant = 'default',
  title,
  subtitle,
  messages,
  className,
  isLoading = false,
}: ChatContainerProps) {
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <section className="flex w-full flex-col space-y-8">
      <Chat
        variant={variant}
        className={cn('bg-dark-900 border-dark-700 flex flex-col', className)}
      >
        <ChatHeader className="bg-dark-800 border-dark-600">
          <div className="flex items-center gap-3">
            <div>
              <h3 className="font-semibold text-white">{title}</h3>
              <p className="text-sm text-secondary">{subtitle}</p>
            </div>
          </div>
        </ChatHeader>

        <ChatMessages className="p-4 space-y-4">
          {isLoading && (
            <div className="flex justify-center py-4">
              <Loader2 className="h-5 w-5 animate-spin text-secondary" />
            </div>
          )}

          {!isLoading &&
            messages.map((msg) => {
              const displayName = getUserDisplayName(msg.user);
              const displayInitial = displayName.charAt(0).toUpperCase();

              return (
                <ChatMessage key={msg.id}>
                  <Avatar className="h-10 w-10">
                    <AvatarImage
                      src={getProfilePictureUrl(msg.user?.profileIcon ?? 1)}
                      alt={displayName}
                    />
                    <AvatarFallback>{displayInitial}</AvatarFallback>
                  </Avatar>

                  <ChatBubble className="bg-dark-800 border-dark-600">
                    <div className="flex flex-col space-y-1">
                      <span className="font-semibold text-white">{displayName}</span>
                      <div
                        className="prose prose-invert max-w-none text-white"
                        dangerouslySetInnerHTML={{ __html: msg.content }}
                      />

                      <span className="text-xs text-secondary">
                        {formatDate(msg.updatedAt || msg.createdAt, { dateOnly: true })} at{' '}
                        {formatDate(msg.updatedAt || msg.createdAt, { timeOnly: true })}
                      </span>
                    </div>
                  </ChatBubble>
                </ChatMessage>
              );
            })}

          <div ref={messagesEndRef} />
        </ChatMessages>
      </Chat>
    </section>
  );
}
