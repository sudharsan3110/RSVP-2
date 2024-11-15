import { Skeleton } from '../ui/skeleton';
import ProfileSection from './ProfileSection';

const ProfileFormSkeleton = () => {
  return (
    <ProfileSection title="Public profile" description="This will be displayed on your profile.">
      <div className="animate-pulse space-y-6">
        {/* Profile picture and edit button */}
        <div className="flex items-end gap-4">
          <Skeleton className="h-20 w-20 rounded-full" />
        </div>

        {/* Full Name Input */}
        <div className="space-y-2">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-10 w-full" />
        </div>

        {/* Location Input */}
        <div className="space-y-2">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-10 w-full" />
        </div>

        {/* Bio TextArea */}
        <div className="space-y-2">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-24 w-full" />
        </div>

        {/* Twitter Input */}
        <div className="space-y-2">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-10 w-full" />
        </div>

        {/* Instagram Input */}
        <div className="space-y-2">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-10 w-full" />
        </div>

        {/* Website Input */}
        <div className="space-y-2">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-10 w-full" />
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-4">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
        </div>
      </div>
    </ProfileSection>
  );
};

export default ProfileFormSkeleton;
