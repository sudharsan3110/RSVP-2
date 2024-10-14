'use client';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

type Props = {
  githubUsername: string;
};

const ContributorAvatar = ({ githubUsername }: Props) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <Link href={`https://github.com/${githubUsername}`}>
            <Avatar className="h-8 w-8">
              <AvatarImage
                src={`https://github.com/${githubUsername}.png`}
                alt="contributor-avatar"
              />
              <AvatarFallback>{githubUsername.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
          </Link>
        </TooltipTrigger>
        <TooltipContent>
          <p>{githubUsername}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default ContributorAvatar;
