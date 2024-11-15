import { encryptData } from '@/utils/encryption';
import config from '@/config/config';

interface QrData {
  userId: number;
  userName: string;
  eventId: string;
  eventName: string;
  expirationTime: Date;
}

export const generateQrToken = (qrData: QrData): string => {
  const qrDataString = JSON.stringify(qrData);
  return encryptData(qrDataString, config.QR_SECRET_KEY);
};
