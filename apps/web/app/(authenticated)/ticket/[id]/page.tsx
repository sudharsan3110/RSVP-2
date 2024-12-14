import { Button } from '@/components/ui/button';
import React from 'react';
import QRCode from 'react-qr-code';

const TicketPage = async () => {
  const dummyTicketData = {
    attendeeFullName: 'Chandresh Patidar',
    confirmationCode: 'X7F9-R2K3',
    eventInfo: 'October 24th, 2024',
  };

  return (
    <div className="container-main my-10">
      <p className="text-4xl font-bold md:text-5xl md:leading-[67px]">See you there on</p>
      <span className="text-4xl font-bold md:text-5xl md:leading-[67px]">
        {dummyTicketData?.eventInfo}
      </span>
      <div className="my-6 flex flex-col items-center gap-x-10 md:flex-row">
        <div className="mb-6 w-full font-medium md:m-auto md:w-1/2">{`Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor inc ut labore et dolore magna aliqua..`}</div>
        <div className="flex w-full flex-col items-center justify-between gap-x-10 gap-y-3 md:w-1/2 md:flex-row">
          <Button className="h-12 w-full rounded-[6px] md:w-1/2">See Direction</Button>
          <Button className="h-12 w-full rounded-[6px] border bg-dark-900 md:w-1/2">Share</Button>
        </div>
      </div>
      <div className="relative my-20 flex w-full flex-col items-stretch justify-between text-dark-500 md:h-[368px] md:flex-row">
        <div className="absolute bottom-0 left-0 right-0 top-0 h-full w-full rounded-[40px] bg-[#D0D0D0]" />
        <div className="relative flex items-center px-16 py-12 md:w-2/5 md:py-0">
          <div className="qr-border rounded-[2rem] p-8">
            <QRCode
              value={'3b4591'}
              bgColor="#D0D0D0"
              size={224}
              level="Q"
              className="lg:max-w-auto h-auto w-full max-w-full lg:w-auto"
            />
          </div>
        </div>
        <div className="relative flex items-center border-t border-dashed py-[72px] md:w-3/5 md:border-l md:py-5">
          <div className="absolute -left-3 -top-3 hidden size-6 rounded-full bg-background md:block"></div>
          <div className="absolute -bottom-3 -left-3 hidden size-6 rounded-full bg-background md:block"></div>
          <div className="absolute -left-3 -top-3 size-6 rounded-full bg-background md:hidden"></div>
          <div className="absolute -right-3 -top-3 size-6 rounded-full bg-background md:hidden"></div>
          <div className="flex flex-col gap-y-6 px-5 md:px-[70px]">
            <div>
              <p className="text-base font-bold">ATTENDEE NAME</p>
              <p className="mt-2 text-4xl font-bold md:text-5xl">
                {dummyTicketData?.attendeeFullName}
              </p>
            </div>
            <div>
              <p className="font-bold">EVENT</p>
              <p className="mt-2 text-2xl font-bold">Comic Con,24 July 2024</p>
            </div>
            <div>
              <p className="font-bold">CONFIRMATION CODE</p>
              <p className="mt-3 text-4xl font-bold md:text-5xl">
                {dummyTicketData?.confirmationCode}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketPage;
