import config from '@/config/config';
import { AttendeeRepository } from '@/repositories/attendee.repository';
import { EventRepository } from '@/repositories/event.repository';
import { UpdateRepository } from '@/repositories/update.repository';
import { UserRepository } from '@/repositories/user.repository';
import { BadRequestError, NotFoundError } from '@/utils/apiError';
import { SuccessResponse } from '@/utils/apiResponse';
import { controller } from '@/utils/controller';
import logger from '@/utils/logger';
import generatePresignedUrl from '@/utils/s3';
import EmailService from '@/utils/sendEmail';
import { userUpdateSchema } from '@/validations/event.validation';
import { getMessageSchema, uploadImageSchema } from '@/validations/update.validation';
/**
 * Sends a notification message to event attendees.
 * @param req - The HTTP request object containing the event ID in the parameters and the message content in the body.
 * @param res - The HTTP response object.
 * @returns The created notification details.
 */
export const sendMessageController = controller(userUpdateSchema, async (req, res) => {
  const data = req.body;
  const param = req.params;
  const RSVP_SUBJECT_MSG = 'Updates from your event';

  const event = await EventRepository.findById(param.eventId);
  if (!event) throw new NotFoundError('Event not found');

  const getUserDetails = await UserRepository.findById(event.creatorId);
  if (!getUserDetails?.id) throw new NotFoundError('User not found');

  if (data.plaintextContent.length > 300)
    throw new BadRequestError('Message cannot be greater than 300 characters.');

  logger.info('Creating message in sendMessageController ...');
  const notificationData = {
    content: data.content,
    eventId: param.eventId as string,
    isNotification: true,
    scheduledNotificationTime: new Date(),
    userId: getUserDetails.id,
  };

  const newNotification = await UpdateRepository.create(notificationData);
  const notificationDeta = {
    ...newNotification,
    user: {
      id: getUserDetails.id,
      name: getUserDetails?.fullName,
      email: getUserDetails?.primaryEmail,
    },
  };

  const attendeeList = await AttendeeRepository.findAllByEventId(param.eventId as string);
  const attendeeIds = attendeeList
    .filter((attendee) => attendee.userId !== notificationDeta.user.id)
    .map((user) => String(user.userId));

  const usersList = await UserRepository.findAllByIds(attendeeIds);

  let emailNotificationText = data.plaintextContent.slice(0, 50);
  if (data.plaintextContent.length > 50) emailNotificationText += '..';

  const emailData = {
    id: 6,
    subject: RSVP_SUBJECT_MSG,
    recipient: notificationDeta.user.email,
    body: {
      eventName: event.name,
      updatesText: emailNotificationText,
      updatesLink: `${config.CLIENT_URL}/${event.slug}/communication`,
    },
    bcc: usersList.map((user) => user.primaryEmail),
  };

  if (config.NODE_ENV !== 'development') {
    await EmailService.send(emailData);
  } else {
    logger.info('Email notification:', emailData);
  }

  return new SuccessResponse('success', notificationDeta).send(res);
});

/**
 * Generates a presigned URL for uploading an event image to S3.
 * @param req - The HTTP request object containing the filename in the query.
 * @param res - The HTTP response object.
 * @returns The presigned URL and the generated key for the file.
 */
export const uploadEventImageController = controller(uploadImageSchema, async (req, res) => {
  const fileName = req.query.filename;
  logger.info('Getting pre-signed url in uploadEventImageController ...');
  const response = await generatePresignedUrl(fileName);
  return new SuccessResponse('success', response).send(res);
});

/**
 * Retrieves all messages (notifications) for a specific event.
 * @param req - The HTTP request object containing the event ID in the parameters.
 * @param res - The HTTP response object.
 * @returns A list of messages for the event.
 */
export const getMessageController = controller(getMessageSchema, async (req, res) => {
  const param = req.params;
  const event = await EventRepository.findById(param.eventId);
  if (!event) throw new NotFoundError('Event not found');

  logger.info('Getting all messages in  getMessageController...');
  const messages = await UpdateRepository.findAllById(param.eventId as string);
  return new SuccessResponse('success', messages).send(res);
});
