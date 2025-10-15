'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { UserPlus, MoreHorizontal } from 'lucide-react';
import { Persona } from '@/types/dm';

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
          <div className="absolute -bottom-10 left-2">
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
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-[#232428] rounded-full flex items-center justify-center">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="pt-12 pb-4 px-4">
                 {/* Display Name - No warning icon */}
                 <div className="mb-2">
                   <h3 className="text-lg font-semibold text-white">
                     {currentPersona.username}
                   </h3>
                 </div>

          {/* Username/Tag */}
          <div className="mb-4">
            <span className="text-[#b9bbbe] text-sm">{currentPersona.username}</span>
            {/* WAVE Badge */}
            <div className="inline-flex items-center gap-1 ml-2 px-2 py-0.5 bg-[#5865f2] rounded text-xs text-white">
              <span className="w-3 h-3 inline-block bg-white rounded-sm"></span>
              <span>WAVE</span>
            </div>
          </div>

          {/* About Me Section */}
          <div className="mb-4">
            <div className="text-white font-semibold text-sm mb-2">About Me</div>
            <div className="text-[#b9bbbe] text-sm">
              AI Persona created for neural social networking
            </div>
          </div>

          {/* Member Since - No card styling */}
          <div className="mb-4">
            <div className="text-white font-semibold text-sm mb-1">Member Since</div>
            <div className="text-[#b9bbbe] text-sm">
              {new Date(persona.createdAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              })}
            </div>
          </div>

          {/* Mutual Servers */}
          <div className="mb-4">
            <div className="text-white font-semibold text-sm mb-1">Mutual Servers — 1</div>
          </div>

          {/* Mutual Friends */}
          <div className="mb-6">
            <div className="text-white font-semibold text-sm mb-1">Mutual Friends — 0</div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2">
            {persona.isFriendOfUser ? (
              <>
                <button
                  onClick={onRemoveFriend}
                  className="w-full py-2 px-4 bg-[#5865f2] text-white text-sm font-medium rounded hover:bg-[#4752c4] transition-colors"
                >
                  Remove Friend
                </button>
                <button
                  onClick={onBlock}
                  className="w-full py-2 px-4 bg-[#ed4245] text-white text-sm font-medium rounded hover:bg-[#c03e40] transition-colors"
                >
                  Block
                </button>
              </>
            ) : (
              <button
                onClick={handleAddFriend}
                className="w-full py-2 px-4 bg-[#5865f2] text-white text-sm font-medium rounded hover:bg-[#4752c4] transition-colors"
              >
                Add Friend
              </button>
            )}
          </div>

          {/* Divider */}
          <div className="border-t border-[#40444b] my-4"></div>

          {/* View Full Profile Link */}
          <div className="text-center">
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
