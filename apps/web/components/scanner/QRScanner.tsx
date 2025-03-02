'use client';

import QrScanner from 'qr-scanner';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

interface QRScannerProps {
  onScan: (code: string) => void;
}

const QRScanner = ({ onScan }: QRScannerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    let qrScanner: QrScanner | null = null;

    const initializeScanner = async () => {
      if (!videoRef.current) return;

      try {
        // Check for camera permissions
        const hasPermission = await QrScanner.hasCamera();
        if (!hasPermission) {
          console.log('hasPermission', hasPermission);
          toast.error('Camera Error', {
            description:
              'Camera is blocked or not accessible. Please allow camera access and reload.',
          });
          return;
        }

        qrScanner = new QrScanner(
          videoRef.current,
          (result) => {
            // Only call onScan if we have valid data
            if (result.data) {
              onScan(result.data);
            }
          },
          {
            highlightScanRegion: true,
            highlightCodeOutline: true,
            returnDetailedScanResult: true,
          }
        );

        await qrScanner.start();
        setIsInitialized(true);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to initialize camera';
        console.error('QR Scanner Error:', errorMessage);
      }
    };

    initializeScanner();

    // Cleanup function
    return () => {
      if (qrScanner) {
        qrScanner.destroy();
      }
    };
  }, [onScan]);

  return (
    <div className="relative">
      <video
        muted
        ref={videoRef}
        className="h-[398px] w-full rounded-xl border border-primary object-cover sm:max-w-[30rem]"
        aria-label="QR code scanner view"
      />
      {!isInitialized && (
        <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/50 text-white">
          Initializing camera...
        </div>
      )}
    </div>
  );
};

export default QRScanner;
