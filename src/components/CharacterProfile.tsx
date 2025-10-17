'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { UserPlus, MoreHorizontal, ArrowRight } from 'lucide-react';
import { Persona } from '@/types/dm';
import { StatusIndicator, StatusType } from './StatusIndicator';

interface CharacterProfileProps {
  persona: Persona;
  onRemoveFriend?: () => void;
  onBlock?: () => void;
  onPersonaUpdate?: (updatedPersona: Persona) => void;
}

export function CharacterProfile({ persona, onRemoveFriend, onBlock, onPersonaUpdate }: CharacterProfileProps) {
  const [showFullProfile, setShowFullProfile] = useState(false);
  const [currentPersona, setCurrentPersona] = useState(persona);

  // Update currentPersona when persona prop changes
  useEffect(() => {
    setCurrentPersona(persona);
  }, [persona]);

  // Generate random RGB color
  const generateRandomRGB = (): string => {
    const r = Math.floor(Math.random() * 256);
    const g = Math.floor(Math.random() * 256);
    const b = Math.floor(Math.random() * 256);
    return `rgb(${r},${g},${b})`;
  };

  // Auto-generate color if missing
  useEffect(() => {
    if (!currentPersona.headerColor) {
      const newColor = generateRandomRGB();
      
      // Update the persona with the new color
      const updatedPersona = { ...currentPersona, headerColor: newColor };
      setCurrentPersona(updatedPersona);
      
      // Save to database
      fetch('/api/personas', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personaId: currentPersona.id,
          headerColor: newColor,
        }),
      }).then(() => {
        // Notify parent component of the update
        if (onPersonaUpdate) {
          onPersonaUpdate(updatedPersona);
        }
      }).catch(error => {
        console.error('Failed to update persona color:', error);
      });
    }
  }, [currentPersona, onPersonaUpdate]);

  const handleAddFriend = () => {
    // This would typically add the persona as a friend
    console.log(`Adding ${persona.username} as friend`);
  };

  const handleMoreOptions = () => {
    // This would show more options menu
    console.log('More options clicked');
  };

  return (
    <div className="w-[21.25rem] bg-[#242429] border-l border-neutral-700/50 ">
      <div className="bg-[#242429] overflow-hidden">
        {/* Header Section with Dynamic Background */}
        <div 
          className="h-30 relative"
          style={{ backgroundColor: currentPersona.headerColor || '#b09090' }}
        >
          {/* Action Icons */}
          <div className="absolute top-3 right-3 flex gap-2">
            <button
              onClick={handleAddFriend}
              className="w-8 h-8 bg-black/20 rounded-full flex items-center justify-center hover:bg-black/30 transition-colors"
            >
              <UserPlus className="w-4 h-4 text-white" />
            </button>
            <button
              onClick={handleMoreOptions}
              className="w-8 h-8 bg-black/20 rounded-full flex items-center justify-center hover:bg-black/30 transition-colors"
            >
              <MoreHorizontal className="w-4 h-4 text-white" />
            </button>
          </div>
          
          {/* Profile Picture - Positioned to the left */}
          <div className="absolute -bottom-[38px] left-[9px]">
            <div className="relative">
                     <Image
                       src={currentPersona.imageUrl || '/avatars/default.png'}
                       alt={currentPersona.username}
                className="w-23 h-23 rounded-full object-cover border-6 border-[#232428]"
                width={80}
                height={80}
                onError={(e) => {
                  e.currentTarget.src = '/avatars/default.png';
                }}
              />
              {/* Online Status */}
              <StatusIndicator
                status={StatusType.OFFLINE}
                size={24}
                className="absolute -bottom-[-6px] -right-[-6px] "
              />
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="pt-12 pb-2 px-4">
                 {/* Display Name - No warning icon */}
                 <div className="relative bottom-[4px] right-[1px]">
                   <h3 className="text-[20px] font-bold text-white">
                     {currentPersona.username}
                   </h3>
                 </div>

          {/* Username/Tag */}
          <div className="mb-1 relative bottom-[7px] right-[1px]">
            <span className="text-[white] text-sm">{currentPersona.username}</span>

          </div>



          {/* Member Since - No card styling */}
          <div className="mb-3 bg-[#2c2d32] rounded-md p-3">
            <div className="text-white font-medium text-[13px] mb-1">Member Since</div>
            <div className="text-neutral-100 text-sm">
              {new Date(persona.createdAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              })}
            </div>
          </div>


          <div className=" bg-[#2c2d32] rounded-md p-3">
          {/* Mutual Servers */}
          <div className="mb-3 flex flew-row items-center justify-between">
            <div className="text-white font-medium text-sm mb-1">Mutual Servers — 1</div>
            <div className="text-white text-sm"><ArrowRight className="w-4 h-4" /></div>
          </div>

          {/* Divider */}
          <div className="border-t border-[#40444b]/50 my-3"></div>

          {/* Mutual Friends */}
          <div className="flex flew-row items-center justify-between">
            <div className="text-white font-semibold text-sm mb-1">Mutual Friends — 0</div>
            <div className="text-white text-sm"><ArrowRight className="w-4 h-4" /></div>
          </div>
          </div>


          {/* Divider */}
          <div className="border-t border-[#40444b] my-4"></div>

          {/* View Full Profile Link */}
          <div className="text-center mt-auto">
            <button
              onClick={() => setShowFullProfile(!showFullProfile)}
              className="text-[#b9bbbe] text-sm hover:text-white transition-colors"
            >
              {showFullProfile ? 'Hide Full Profile' : 'View Full Profile'}
            </button>
          </div>

          {/* Full Profile Content - No card styling */}
          {showFullProfile && (
            <div className="mt-4 space-y-4">
              <div>
                <div className="text-white font-semibold text-sm mb-1">Persona ID</div>
                <div className="text-[#b9bbbe] text-sm font-mono">{persona.id}</div>
              </div>
              
              <div>
                <div className="text-white font-semibold text-sm mb-1">Friends Count</div>
                <div className="text-[#b9bbbe] text-sm">{persona.friendsIds.length}</div>
              </div>
              
              <div>
                <div className="text-white font-semibold text-sm mb-1">Last Updated</div>
                <div className="text-[#b9bbbe] text-sm">
                  {new Date(persona.updatedAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
