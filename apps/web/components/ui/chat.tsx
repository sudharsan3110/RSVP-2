'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { Avatar } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';

const chatVariants = cva('flex flex-col', {
  variants: {
    variant: {
      default: 'h-[600px] bg-background border border-dark-700 rounded-lg',
      compact: 'h-[400px] bg-background border border-dark-700 rounded-md',
      fullscreen: 'h-screen bg-background',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

const chatMessageVariants = cva('flex gap-3 p-4', {
  variants: {
    position: {
      left: 'justify-start',
      right: 'justify-end flex-row-reverse ml-auto',
    },
  },
  defaultVariants: {
    position: 'left',
  },
});

const chatBubbleVariants = cva('rounded-lg px-4 py-2 max-w-[70%] break-words', {
  variants: {
    variant: {
      sent: 'bg-dark-900 text-white border border-dark-700',
      received: 'bg-dark-800 text-white border border-dark-600',
      system: 'bg-secondary text-secondary-foreground',
    },
  },
  defaultVariants: {
    variant: 'received',
  },
});

const Chat = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof chatVariants>
>(({ className, variant, ...props }, ref) => (
  <div ref={ref} className={cn(chatVariants({ variant }), className)} {...props} />
));
Chat.displayName = 'Chat';

const ChatHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex items-center justify-between p-4 border-b border-dark-700', className)}
      {...props}
    />
  )
);
ChatHeader.displayName = 'ChatHeader';

const ChatMessages = React.forwardRef<
  React.ElementRef<typeof ScrollArea>,
  React.ComponentPropsWithoutRef<typeof ScrollArea>
>(({ className, ...props }, ref) => (
  <ScrollArea ref={ref} className={cn('flex-1 p-0', className)} {...props} />
));
ChatMessages.displayName = 'ChatMessages';

const ChatMessage = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof chatMessageVariants>
>(({ className, position, ...props }, ref) => (
  <div ref={ref} className={cn(chatMessageVariants({ position }), className)} {...props} />
));
ChatMessage.displayName = 'ChatMessage';

const ChatBubble = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof chatBubbleVariants>
>(({ className, variant, ...props }, ref) => (
  <div ref={ref} className={cn(chatBubbleVariants({ variant }), className)} {...props} />
));
ChatBubble.displayName = 'ChatBubble';

const ChatInput = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex items-center gap-2 p-4 border-t border-dark-700', className)}
      {...props}
    />
  )
);
ChatInput.displayName = 'ChatInput';

const ChatAvatar = React.forwardRef<
  React.ElementRef<typeof Avatar>,
  React.ComponentPropsWithoutRef<typeof Avatar> & {
    isOnline?: boolean;
  }
>(({ className, isOnline, children, ...props }, ref) => (
  <div className="relative">
    <Avatar ref={ref} className={cn('h-8 w-8', className)} {...props}>
      {children}
    </Avatar>
    {isOnline && (
      <>
        <div
          className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-green-500 border-2 border-background"
          aria-hidden="true"
        />
        <span className="sr-only">Online</span>
      </>
    )}
  </div>
));
ChatAvatar.displayName = 'ChatAvatar';

export {
  Chat,
  ChatHeader,
  ChatMessages,
  ChatMessage,
  ChatBubble,
  ChatInput,
  ChatAvatar,
  chatVariants,
  chatMessageVariants,
  chatBubbleVariants,
};
