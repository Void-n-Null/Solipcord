'use client';

import { Group, Persona } from '@/types/dm';
import { useUser } from '@/hooks/useUser';
import { usePersonas } from '@/hooks/usePersonas';
import { GroupMember, GroupMemberItem } from './GroupMember';

interface GroupMembersListProps {
  group: Group;
}

export function GroupMembersList({ group }: GroupMembersListProps) {
  const { user } = useUser();
  const { data: members = [], isLoading: loading } = usePersonas(group.participantIds);

  // Build unified members list with user first
  const allMembers: GroupMemberItem[] = [];
  if (user) {
    allMembers.push({
      id: user.id,
      username: user.username,
      avatar: user.avatar,
      isCurrentUser: true,
    });
  }
  allMembers.push(
    ...members.map((member) => ({
      id: member.id,
      username: member.username,
      imageUrl: member.imageUrl,
    }))
  );

  return (
    <div className="w-[16.5rem] bg-[#1a1a1e] border-l border-neutral-700/50 flex flex-col">
      {/* Header */}
      <div className="px-4 pb-0 pt-[20px] border-[#404040]">
        <h3 className="text-sm font-medium text-neutral-400/80">
          Members—{allMembers.length}
        </h3>
      </div>

      {/* Members List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-2">
            <div className="text-[#b9bbbe] text-sm">Loading members...</div>
          </div>
        ) : members.length > 0 ? (
          <div className="px-2 py-2 space-y-0">
            {allMembers.map((memberItem) => (
              <GroupMember
                key={memberItem.id}
                member={memberItem}
              />
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center py-8">
            <div className="text-[#b9bbbe] text-sm text-center px-4">
              No members in this group
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
