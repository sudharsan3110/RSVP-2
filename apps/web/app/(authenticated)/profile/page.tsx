"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Download, Plus } from "lucide-react";
import InputWithLabel from "@/components/profile/InputWithLabel";
import ProfileSection from "@/components/profile/ProfileSection";
import SocialMediaInput from "@/components/profile/SocialMediaInput";
import { ChangeEvent, useState } from "react";
import ProfilePictureEditPopover from "@/components/profile/ProfilePictureEditPopover";
import Container from "@/components/common/Container";

const ProfilePage = () => {
  const [emails, setEmails] = useState<string[]>([""]);
  const [bio, setBio] = useState<string>("");
  const bioCharactersLimit = 100;
  const [profilePictureUrl, setProfilePictureUrl] = useState(
    "/images/user-avatar-short-hair-beard.svg",
  );
  // const { data } = useMe();

  const handleBioChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setBio(event.target.value);
  };

  const addSecondEmail = () => {
    setEmails([...emails, ""]);
  };

  const updateEmail = (index: number, value: string) => {
    const newEmails = [...emails];
    newEmails[index] = value;
    setEmails(newEmails);
  };

  return (
    <Container className="container-main py-8">
      <section className="flex flex-col gap-1">
        <h1 className="text-2xl/[36px] font-semibold">Profile</h1>
        <p className="font-medium text-secondary">
          Manage your profile settings
        </p>
      </section>
      <Separator className="my-[42px] bg-separator" />
      <ProfileSection
        title="Public profile"
        description="This will be displayed on your profile."
      >
        <div className="flex items-end">
          <Image
            width={80}
            height={80}
            priority
            src={profilePictureUrl}
            alt="Profile picture"
            className="rounded-full border-2 border-solid border-purple-500 bg-white"
          />
          <ProfilePictureEditPopover
            profilePictureUrl={profilePictureUrl}
            setProfilePictureState={setProfilePictureUrl}
          />
        </div>
        <InputWithLabel label="Full name" id="full-name" type="text" />
        <InputWithLabel label="Your location" id="your-location" type="text" />
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="bio">Bio</Label>
          <Textarea
            placeholder="Type your message here"
            id="bio"
            value={bio}
            onChange={handleBioChange}
            maxLength={bioCharactersLimit}
            className="resize-none rounded-[6px] border border-solid border-dark-500 bg-dark-900 placeholder:text-gray-400"
          />
          <p className="text-sm text-secondary">
            {bioCharactersLimit - bio.length} characters left
          </p>
        </div>
        <div className="flex flex-wrap items-end justify-between gap-4 rounded-[6px] border border-solid border-dark-500 bg-dark-900 p-3">
          <div>
            <h3 className="font-semibold text-white">Make profile public</h3>
            <p className="text-sm text-secondary">
              Turning on will show your profile data to other users
            </p>
          </div>
          <Switch
            className="data-[state=checked]:bg-[linear-gradient(188deg,#AC6AFF_53.34%,#DF7364_116.65%)]"
            thumbClassName="bg-white"
          />
        </div>
      </ProfileSection>
      <div className="mt-9">
        <ProfileSection title="Social Media" description="Grow your audience.">
          <div className="flex flex-col gap-4">
            <SocialMediaInput platform="Twitter/X" prefix="https://x.com/" />
            <SocialMediaInput platform="GitHub" prefix="https://github.com/" />
            <SocialMediaInput platform="Website" prefix="https://" />
          </div>
          <Button
            data-testid="profile-save-button"
            className="ml-auto mt-3 h-9 rounded-[6px] text-sm font-semibold"
          >
            Save
          </Button>
        </ProfileSection>
      </div>
      <Separator className="my-[42px] bg-separator" />
      <ProfileSection
        title="Email address"
        description="Invites will be sent to this email address."
      >
        {emails.map((email, index) => (
          <InputWithLabel
            key={index}
            label={index === 0 ? "Primary email" : "Secondary email"}
            id={`email-${index}`}
            type="email"
            value={email}
            onChange={(e) => updateEmail(index, e.target.value)}
          />
        ))}
        {emails.length === 1 && (
          <button
            onClick={addSecondEmail}
            className="flex items-start gap-2 text-sm font-semibold text-white"
          >
            <Plus size={20} />
            Add another
          </button>
        )}
        {emails.length === 2 && (
          <Button
            data-testid="email-save-button"
            className="ml-auto mt-3 h-9 rounded-[6px] text-sm font-semibold"
          >
            Save
          </Button>
        )}
      </ProfileSection>
      <Separator className="my-[42px] bg-separator" />
      <ProfileSection
        title="Phone number"
        description="To stay in touch with our team."
      >
        <InputWithLabel label="Phone number" id="phone-number" type="text" />
        <Button
          data-testid="phone-save-button"
          className="ml-auto mt-3 h-9 rounded-[6px] text-sm font-semibold"
        >
          Save
        </Button>
      </ProfileSection>
      <Separator className="my-[42px] bg-separator" />
      <section className="max-w-[613px]" aria-labelledby="download-data-title">
        <h2 id="download-data-title" className="font-semibold text-white">
          Download your personal data
        </h2>
        <p className="mb-6 mt-1 text-sm text-secondary">
          We believe in transparency and giving you full control over your
          personal information. That&apos;s why we offer the option to download
          your data directly from our app.
        </p>
        <Button className="w-fit whitespace-nowrap rounded-[6px] text-sm/[24px]">
          <Download className="mr-2.5" size={20} /> Download
        </Button>
      </section>
      <Separator className="my-[42px] bg-separator" />
      <section className="max-w-[613px]" aria-labelledby="delete-account-title">
        <h2 id="delete-account-title" className="font-semibold text-white">
          Delete my account
        </h2>
        <p className="mb-6 mt-1 text-sm text-secondary">
          If you no longer wish to use RSVP, you can permanently delete your
          account.
        </p>
        <Button
          variant="destructive"
          className="w-fit whitespace-nowrap rounded-[6px] text-sm/[24px]"
        >
          Delete My Account
        </Button>
      </section>
    </Container>
  );
};

export default ProfilePage;
