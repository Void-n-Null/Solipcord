'use client';

import Image from 'next/image';
import { Persona } from '@/types/dm';
import { usePersonas } from '@/hooks/usePersonas';

interface GroupAvatarStackProps {
  participantIds: string[];
  size?: number;
}

export function GroupAvatarStack({ participantIds, size = 24 }: GroupAvatarStackProps) {
  // Use TanStack Query with batching and caching
  const { data: personas = [], isLoading: loading } = usePersonas(participantIds.slice(0, 3));

  if (loading || personas.length === 0) {
    return (
      <div
        className="rounded-full bg-[#404040] flex items-center justify-center text-xs font-semibold"
        style={{ width: size, height: size }}
      >
        👥
      </div>
    );
  }

  const containerSize = size;
  const avatarSize = Math.ceil(size * 0.77);

  return (
    <div className="relative" style={{ width: containerSize, height: containerSize, zIndex: 0 }}>
      {/* First avatar - bottom right (highest z-index, appears in front) */}
      {personas[0] && (
        <div
          className="absolute rounded-full overflow-hidden border border-[#1a1a1e] bg-[#1a1a1e]"
          style={{
            width: avatarSize,
            height: avatarSize,
            bottom: 0,
            right: 0,
            zIndex: 3,
          }}
        >
          <Image
            src={personas[0].imageUrl || '/avatars/default.png'}
            alt={personas[0].username}
            className="w-full h-full object-cover"
            width={avatarSize}
            height={avatarSize}
            onError={(e) => {
              e.currentTarget.src = '/avatars/default.png';
            }}
          />
        </div>
      )}

      {/* Second avatar - top left (lowest z-index) */}
      {personas[1] && (
        <div
          className="absolute rounded-full overflow-hidden border border-[#1a1a1e] bg-[#1a1a1e]"
          style={{
            width: avatarSize,
            height: avatarSize,
            top: 0,
            left: 0,
            zIndex: 1,
          }}
        >
          <Image
            src={personas[1].imageUrl || '/avatars/default.png'}
            alt={personas[1].username}
            className="w-full h-full object-cover"
            width={avatarSize}
            height={avatarSize}
            onError={(e) => {
              e.currentTarget.src = '/avatars/default.png';
            }}
          />
        </div>
      )}

      {/* Third avatar - top right (middle z-index) */}
      {personas[2] && (
        <div
          className="absolute rounded-full overflow-hidden border border-[#1a1a1e] bg-[#1a1a1e]"
          style={{
            width: avatarSize,
            height: avatarSize,
            top: 0,
            right: 0,
            zIndex: 2,
          }}
        >
          <Image
            src={personas[2].imageUrl || '/avatars/default.png'}
            alt={personas[2].username}
            className="w-full h-full object-cover"
            width={avatarSize}
            height={avatarSize}
            onError={(e) => {
              e.currentTarget.src = '/avatars/default.png';
            }}
          />
        </div>
      )}
    </div>
  );
}
