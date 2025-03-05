import Container from '@/components/common/Container';
import dayjs from 'dayjs';
import React from 'react';

const PrivacyPolicy = () => {
  const today = dayjs().format('MMM DD, YYYY');
  return (
    <Container className="container-main dark prose max-w-5xl text-secondary dark:prose-invert prose-h2:text-[1.75rem] prose-p:tracking-wide">
      <header className="mx-auto mb-28 mt-12 max-w-3xl text-center">
        <span className="mb-4 block">Current as of {today}</span>
        <h1 className="mb-8 font-semibold">Privacy and Terms</h1>
        <p>
          Thank you for choosing RSVP! Before using our services, please review our Terms of Service
          carefully. This agreement is a crucial contract between us and our users. We&apos;ve
          provided a concise summary followed by the complete legal terms.
        </p>
      </header>
      <section id="privacy">
        <h2 className="font-semibold">Privacy Policy</h2>
        <p>
          This Privacy Policy explains how RSVP collects, uses, and protects your personal
          information when you use our website and services. By using RSVP&apos;s services, you
          agree to the terms of this Privacy Policy. Your privacy is important to us, and we are
          committed to safeguarding your personal information.
        </p>

        <p>
          RSVP collects personal information such as your name, email address, and other details
          when you register for an account or use specific features on our platform. We also gather
          usage data about how you interact with our website and services, including pages viewed,
          features used, and your activity within our platform. If you contact us for support or
          inquiries, we may collect the content of those communications.
        </p>

        <p>
          The information collected is used to provide and enhance our services, manage your
          account, communicate with you about updates, offers, and newsletters, and perform business
          analysis to optimize site performance and security. We may also use your information to
          personalize your experience on RSVP and improve our services based on your preferences.
        </p>

        <p>
          RSVP employs cookies and similar technologies to monitor usage patterns, improve
          functionality, and analyze website traffic. Cookies help us provide a more personalized
          user experience. You can manage your cookie settings through your browser, but please note
          that disabling certain cookies may affect some features of the website and services. For
          more information on cookies and how to manage them, please visit our Cookie Policy.
        </p>

        <p>
          We take reasonable precautions to protect your personal data from unauthorized access,
          disclosure, alteration, and destruction. However, no method of data transmission over the
          internet or electronic storage is 100% secure. While we strive to use commercially
          acceptable means to protect your personal information, we cannot guarantee its absolute
          security. We retain your personal data only as long as necessary to fulfill its purpose or
          as required by law.
        </p>

        <p>
          RSVP&apos;s services are not intended for children under 13, and we do not knowingly
          collect personal information from children under this age. If you believe that we have
          inadvertently collected personal information from a child under 13, please contact us
          immediately, and we will take steps to delete such data.
        </p>

        <p>
          This Privacy Policy may be updated periodically to reflect changes in our practices,
          services, or legal requirements. When updates are made, they will be posted on the
          website, and the effective date will be updated accordingly. We encourage you to review
          this policy regularly to stay informed about how we are protecting your personal
          information.
        </p>
      </section>

      <section id="terms" className="-mt-32 pt-32">
        <h2>Terms of Service</h2>

        <p>
          Thank you for choosing RSVP! Before using our services, please review our Terms of Service
          carefully. This agreement is a crucial contract between us and our users. We&apos;ve
          provided a concise summary followed by the complete legal terms.
        </p>

        <p>
          RSVP collects personal information such as your name, email address, and other details
          when you register for an account or use specific features on our platform. We also gather
          usage data about how you interact with our website and services, including pages viewed,
          features used, and your activity within our platform. If you contact us for support or
          inquiries, we may collect the content of those communications.
        </p>

        <p>
          The information collected is used to provide and enhance our services, manage your
          account, communicate with you about updates, offers, and newsletters, and perform business
          analysis to optimize site performance and security. We may also use your information to
          personalize your experience on RSVP and improve our services based on your preferences.
        </p>

        <p>
          RSVP employs cookies and similar technologies to monitor usage patterns, improve
          functionality, and analyze website traffic. Cookies help us provide a more personalized
          user experience. You can manage your cookie settings through your browser, but please note
          that disabling certain cookies may affect some features of the website and services. For
          more information on cookies and how to manage them, please visit our Cookie Policy.
        </p>

        <p>
          We take reasonable precautions to protect your personal data from unauthorized access,
          disclosure, alteration, and destruction. However, no method of data transmission over the
          internet or electronic storage is 100% secure. While we strive to use commercially
          acceptable means to protect your personal information, we cannot guarantee its absolute
          security. We retain your personal data only as long as necessary to fulfill its purpose or
          as required by law.
        </p>

        <p>
          RSVP&apos;s services are not intended for children under 13, and we do not knowingly
          collect personal information from children under this age. If you believe that we have
          inadvertently collected personal information from a child under 13, please contact us
          immediately, and we will take steps to delete such data.
        </p>

        <p>
          This Privacy Policy may be updated periodically to reflect changes in our practices,
          services, or legal requirements. When updates are made, they will be posted on the
          website, and the effective date will be updated accordingly. We encourage you to review
          this policy regularly to stay informed about how we are protecting your personal
          information.
        </p>
      </section>
    </Container>
  );
};

export default PrivacyPolicy;
