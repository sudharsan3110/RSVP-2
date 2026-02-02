import { Request } from 'express';

export interface IAuthenticatedRequest<
  P = {}, // Params
  ResBody = {}, // Response Body
  ReqBody = { accessToken?: string; refreshToken?: string }, // Request Body
  ReqQuery = {}, // Request Query
> extends Request<P, ResBody, ReqBody, ReqQuery> {
  userId?: string;
  Role?: string;
}

export interface IEventIdRequest extends IAuthenticatedRequest<
  { eventId?: string },
  {},
  { eventId?: string }
> {}

export interface EmailData {
  id: number;
  subject: string;
  recipient?: string;
  body: Record<string, string>;
  cc?: string[];
  bcc?: string[];
  self?: boolean;
  provider?: string;
}
