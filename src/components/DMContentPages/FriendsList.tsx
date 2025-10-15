'use client';

import { useState, useEffect } from 'react';
import { DMHeader } from "../DMHeader";
import { Input } from "../ui/input";
import { Search, MoreVertical } from "lucide-react";
import Image from "next/image";

interface Persona {
  id: string;
  username: string;
  imageUrl?: string;
  friendsIds: string[];
  isFriendOfUser: boolean;
  createdAt: string;
  updatedAt: string;
}

export function FriendsList() {
  const [friends, setFriends] = useState<Persona[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch friends from database
  useEffect(() => {
    const fetchFriends = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/friends');
        if (!response.ok) {
          throw new Error('Failed to fetch friends');
        }
        const data = await response.json();
        setFriends(data);
      } catch (err) {
        console.error('Error fetching friends:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchFriends();
  }, []);

  // Refresh friends list when a new persona is created
  const handlePersonaCreated = () => {
    const fetchFriends = async () => {
      try {
        const response = await fetch('/api/friends');
        if (!response.ok) {
          throw new Error('Failed to fetch friends');
        }
        const data = await response.json();
        setFriends(data);
      } catch (err) {
        console.error('Error fetching friends:', err);
      }
    };

    fetchFriends();
  };

  return (
    <div className="flex-1 flex flex-col">
      <DMHeader onPersonaCreated={handlePersonaCreated}>
        <div className="flex items-center gap-2 ml-2">

        <span
          aria-hidden
          className={`inline-block w-[20px] h-[20px] align-middle [mask-image:url('/wave.svg')] [mask-repeat:no-repeat] [mask-position:center] [mask-size:contain] [-webkit-mask-image:url('/wave.svg')] [-webkit-mask-repeat:no-repeat] [-webkit-mask-position:center] [-webkit-mask-size:contain] transition-colors bg-[#aaaab1]
          }`}
        />
          <h2 className="text-white font-medium">Friends</h2>
          <span className="text-white/60 text-sm">•</span>
          <span className="text-white/60 text-sm">All friends</span>
        </div>
      </DMHeader>
      
      <div className="flex-1 flex">
        {/* Main content area - takes up 80% */}
        <div className="flex-1 bg-[#1a1a1e] p-3">
          <div className="space-y-2">
            {/* Friends list content */}
            <div className="text-white/60 text-center">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 w-full relative">
                  <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-100" />
                  <Input placeholder="Search" className="flex-1 bg-[#17171a] resize-none h-[40px] placeholder:font-thin mx-3 pl-9 placeholder:text-[16px] text-white text-[16px] font-medium !border-neutral-600 focus:!border-blue-500 focus:!border-2 focus:ring-0 focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 transition-[border-color,border-width] duration-200 focus:transition-none" />

              </div>
              </div>
              <div className="flex items-start gap-2 pt-[23px] pl-[12px]">
                <div className="text-white/90 text-sm font-medium">
                All friends — {loading ? '...' : friends.length}
                </div>
              </div>
              
            </div>
            
            {/* Loading state */}
            {loading && (
              <div className="text-white/60 text-center py-8">
                Loading friends...
              </div>
            )}

            {/* Error state */}
            {error && (
              <div className="text-red-400 text-center py-8">
                Error: {error}
              </div>
            )}

            {/* Empty state */}
            {!loading && !error && friends.length === 0 && (
              <div className="text-white/60 text-center py-8">
                No friends yet. Create some personas using the settings button!
              </div>
            )}
            
            {/* Friends list items */}
            {!loading && !error && friends.length > 0 && (
              <div className="space-y-0 pt-2">
                {friends.map((friend, index) => (
                  <div key={friend.id}>
                    {/* Top divider */}
                    <div className="h-px bg-[#404040] mx-3"></div>
                    
                    {/* Friend item */}
                    <div className="flex items-center gap-3 px-3 mx-1 py-2 hover:bg-[#2a2a2e] rounded-lg transition-colors">
                      {/* Avatar */}
                      <div className="relative">
                        <Image
                          src={friend.imageUrl || '/avatars/default.png'}
                          alt={friend.username}
                          className="w-8 h-8 rounded-full object-cover"
                          width={128}
                          height={128}
                          onError={(e) => {
                            e.currentTarget.src = '/avatars/default.png';
                          }}
                        />
                        {/* Offline status indicator */}
                        <div className="absolute -bottom-1 -right-1 w-4 h-4">
                          <Image 
                            src="/status-offline.svg" 
                            alt="Offline" 
                            className="w-full h-full"
                            width={16}
                            height={16}
                          />
                        </div>
                      </div>
                      
                      {/* Name and status */}
                      <div className="flex-1 ">
                        <div className="mt-1">
                          <div className="text-white font-semibold">{friend.username}</div>
                          <div className="text-white/60 text-sm mt-[-2px] font-medium">Offline</div>
                        </div>
                      </div>
                      
                      {/* Action icons */}
                      <div className="flex items-center gap-2">
                        <span
                          aria-hidden
                          className="inline-block w-5 h-5 align-middle [mask-image:url('/chat-message.svg')] [mask-repeat:no-repeat] [mask-position:center] [mask-size:contain] [-webkit-mask-image:url('/chat-message.svg')] [-webkit-mask-repeat:no-repeat] [-webkit-mask-position:center] [-webkit-mask-size:contain] transition-colors bg-white/60 hover:bg-white cursor-pointer"
                        />
                        <MoreVertical className="w-5 h-5 text-white/60 hover:text-white cursor-pointer" />
                      </div>
                    </div>
                  </div>
                ))}
                {/* Bottom divider for the last item */}
                <div className="h-px bg-[#404040] mx-3"></div>
              </div>
            )}
          </div>
        </div>
        
        {/* Right sidebar - takes up 30% */}
        <div className="w-[27.25%] bg-[#202024] border-l border-[#404040] p-3">
          <div className="text-white/60 text-sm">
            <h3 className="text-white ml-1 mb-2 text-xl font-semibold">Active Now</h3>
            <div className="space-y-2">
              {/* Sidebar content */}
              <div className="text-xs">Sidebar content goes here</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

