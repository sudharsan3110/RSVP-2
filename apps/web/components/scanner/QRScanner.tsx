'use client';

import { useEffect, useRef } from 'react';
import QrScanner from 'qr-scanner';
import { IAttendee } from '@/types/attendee';
import { toast } from 'sonner';
import { dummyAttendee } from '@/app/(authenticated)/scanner/page';

interface QRScannerProps {
  onScan: (data: IAttendee) => void;
}

const QRScanner = ({ onScan }: QRScannerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!videoRef.current) return;

    const qrScanner = new QrScanner(
      videoRef.current,
      (result) => {
        onScan(dummyAttendee);
      },
      {
        highlightScanRegion: true,
        highlightCodeOutline: true,
      }
    );

    qrScanner
      .start()
      .then()
      .catch((err) => {
        toast.error(err, {
          description:
            'Camera is blocked or not accessible. Please allow camera in your browser permissions and Reload.',
        });
      });

    return () => {
      qrScanner.destroy();
    };
  }, [onScan]);

  return (
    <video
      muted
      ref={videoRef}
      className="h-[398px] w-full rounded-xl border border-primary object-cover sm:max-w-[30rem]"
      aria-label="QR code scanner view"
    />
  );
};

export default QRScanner;
