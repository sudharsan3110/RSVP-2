interface ChatMessageProps {
  sender: string;
  message: string;
  time: string;
}

const stripHtml = (html: string) => {
  return html.replace(/<[^>]*>/g, '');
};

const ChatMessage = ({ sender, message, time }: ChatMessageProps) => {
  const cleanMessage = stripHtml(message);

  return (
    <div className="z-0 mb-4 flex w-full items-start gap-3">
      {/* Placeholder Avatar */}
      <div className="h-10 w-10 rounded-full bg-gray-300"></div>
      <div className="flex flex-1 flex-col gap-1">
        <div className="flex justify-between">
          <div className="text-sm font-semibold text-gray-800">{sender}</div>
          <div className="text-xs text-gray-500">{time}</div>
        </div>
        <div className="bg-dark-900 p-4 text-sm text-gray-600">{cleanMessage}</div>
      </div>
    </div>
  );
};

export default ChatMessage;
