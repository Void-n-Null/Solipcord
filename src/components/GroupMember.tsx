'use client';

import Image from 'next/image';

export interface GroupMemberItem {
  id: string;
  username: string;
  imageUrl?: string;
  avatar?: string;
  isCurrentUser?: boolean;
}

interface GroupMemberProps {
  member: GroupMemberItem;
}

export function GroupMember({ member }: GroupMemberProps) {
  const avatarUrl = member.imageUrl || member.avatar || '/avatars/default.png';
  const displayName = member.isCurrentUser ? 'You' : member.username;
  const statusColor = member.isCurrentUser ? 'bg-green-500' : 'bg-gray-500';

  return (
    <div className="flex items-center gap-3 px-3 py-1 rounded-md hover:bg-[#2c2c30] transition-colors cursor-pointer">
      {/* Avatar */}
      <div className="relative flex-shrink-0">
        <Image
          src={avatarUrl}
          alt={displayName}
          className="w-8 h-8 rounded-full object-cover"
          width={32}
          height={32}
          onError={(e) => {
            e.currentTarget.src = '/avatars/default.png';
          }}
        />
        {/* Online Status Indicator */}
        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-[#242429] rounded-full border border-[#242429] flex items-center justify-center">
          <div className={`w-1.5 h-1.5 rounded-full ${statusColor}`}></div>
        </div>
      </div>

      {/* Member Info */}
      <div className="flex-1 min-w-0">
        <div className="text-[15px] font-medium text-white truncate">
          {displayName}
        </div>
      </div>
    </div>
  );
}
