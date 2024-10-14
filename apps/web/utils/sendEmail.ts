'use server';

import { transporter } from '@/services/email';
import { render } from '@react-email/components';
import { ReactElement } from 'react';
import { EMAIL_IMAGE_FILES } from '@/utils/constants';

export async function sendEmail({
  html,
  subject,
  to,
}: {
  to: string;
  subject: string;
  html: ReactElement;
}) {
  const from = process.env.EMAIL_FROM;
  console.log(from, to);
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: to,
    subject: subject,
    html: render(html),
    attachments: EMAIL_IMAGE_FILES,
  });
}
