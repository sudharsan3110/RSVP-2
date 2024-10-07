import React from "react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";

interface SocialMediaInputProps {
  platform: string;
  prefix: string;
}

const SocialMediaInput = ({ platform, prefix }: SocialMediaInputProps) => (
  <div className="flex flex-col gap-1.5">
    <Label className="text-sm text-white" htmlFor={platform.toLowerCase()}>
      {platform}
    </Label>
    <div className="flex">
      <span className="block rounded-l-[6px] bg-dark-500 px-[9px] py-2">
        {prefix}
      </span>
      <Input className="rounded-l-none rounded-r-[6px] border border-solid border-dark-500 bg-dark-900" />
    </div>
  </div>
);

export default SocialMediaInput;
