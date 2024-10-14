import React from 'react';
import {
  Body,
  Container,
  Html,
  Img,
  Section,
  Text,
  Tailwind,
  Link,
  Font,
  Head,
} from '@react-email/components';

export const EmailVerificationTemplate = ({
  name,
  email,
  magicLink,
}: {
  name: string;
  email: string;
  magicLink: string;
}) => {
  return (
    <Html>
      <Tailwind
        config={{
          darkMode: ['class'],
          prefix: '',
          theme: {
            extend: {
              colors: {
                dark: {
                  900: 'hsl(240 3% 8%)',
                },
                primary: {
                  DEFAULT: 'hsl(265 100% 71%)',
                  light: 'hsl(var(--primary-light))',
                  foreground: 'hsl(var(--primary-foreground))',
                },
              },
            },
          },
        }}
      >
        <Head>
          <Font
            fontFamily="Inter"
            fallbackFontFamily="Verdana"
            fontWeight={400}
            fontStyle="normal"
          />
        </Head>
        <Body>
          <Container style={{ background: '#141415' }} className="py-10">
            <Section className="px-6">
              <Img alt="Team shiksha logo" src="cid:logo.png" />
            </Section>
            <Section className="px-6 pt-6">
              <Img src="cid:verification-email.png" className="h-auto w-full" />
              <Text className="mt-11 text-4xl font-semibold text-white">Hi {name}, </Text>
              <Text className="mt-6 text-lg text-white">{`We're excited to have you join our community of creators! To securely access your account, simply click the magic link below: `}</Text>
              <Section
                style={{
                  backgroundColor: '#AC6AFF',
                  marginLeft: 0,
                  fontSize: '16px',
                  width: 'fit-content',
                  padding: '10px 20px',
                  borderRadius: '20px',
                }}
              >
                <Link style={{ color: 'white', fontSize: '14px', marginLeft: 0 }} href={magicLink}>
                  Click here to login to your account
                </Link>
              </Section>
              <Text className="mt-6 text-lg text-white">{`This link will expire in 10 Minutes. Once inside, you'll have access to our full suite of intuitive events and can create one. Our team is here to support you every step of the way.`}</Text>
              <Text className="mt-6 text-lg text-white">{`Happy Unforgettable events!`}</Text>
              <Text className="mt-6 text-lg text-white">{`Team Shiksha`}</Text>
            </Section>
            <Section className="px-6 py-8">
              <Text className="text-sm text-white">
                This email was sent to {<Link style={{ color: '#AC6AFF' }}>{email}</Link>}.
              </Text>
              <Text className="mt-6 text-sm text-white">
                © 2024 Team Shiksha. All rights reserved.
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default EmailVerificationTemplate;
