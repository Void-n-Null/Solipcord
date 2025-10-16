
'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, X } from "lucide-react";
import Image from "next/image";
import { Input } from "./ui/input";
import { Persona } from "@/types/dm";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface GroupChatModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGroupChatCreated?: (groupId: string) => void;
}

export function GroupChatModal({
  open,
  onOpenChange,
  onGroupChatCreated,
}: GroupChatModalProps) {
  const [selectedFriends, setSelectedFriends] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // Fetch friends using TanStack Query (reuses cache from FriendsList)
  const { data: friends = [], isLoading: loading, error } = useQuery({
    queryKey: ['friends'],
    queryFn: async () => {
      const response = await fetch('/api/friends');
      if (!response.ok) {
        throw new Error('Failed to fetch friends');
      }
      return (await response.json()) as Persona[];
    },
  });

  // Reset selection and search when modal opens
  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen) {
      setSelectedFriends(new Set());
      setSearchQuery('');
    }
    onOpenChange(newOpen);
  };

  // Toggle friend selection
  const toggleFriendSelection = (friendId: string) => {
    const newSelected = new Set(selectedFriends);
    if (newSelected.has(friendId)) {
      newSelected.delete(friendId);
    } else {
      newSelected.add(friendId);
    }
    setSelectedFriends(newSelected);
  };

  // Filter friends based on search query
  const filteredFriends = friends.filter(friend =>
    friend.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle group chat creation
  const handleCreateGroupChat = async () => {
    if (selectedFriends.size === 0) {
      alert('Please select at least one friend');
      return;
    }

    setIsCreating(true);
    try {
      const response = await fetch('/api/group-chats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          participantIds: Array.from(selectedFriends),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create group chat');
      }

      const groupChat = await response.json();
      console.log('Group chat created:', groupChat);
      
      if (onGroupChatCreated) {
        onGroupChatCreated(groupChat.id);
      }
      
      handleOpenChange(false);
    } catch (error) {
      console.error('Error creating group chat:', error);
      alert('Failed to create group chat. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg bg-[#1e1e22] border-[#404040] text-white">
        <DialogHeader>
          <DialogTitle className="text-white">Create Group Chat</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-100" />
            <Input
              placeholder="Type the username of a friend"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-[#17171a] resize-none h-[40px] placeholder:font-thin pl-9 placeholder:text-[16px] text-white text-[16px] font-medium !border-neutral-600 focus:!border-blue-500 focus:!border-2 focus:ring-0 focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 transition-[border-color,border-width] duration-200 focus:transition-none"
            />
          </div>

          {/* Selected friends count */}
          <div className="text-sm text-white/60">
            You can add {Math.max(0, 9 - selectedFriends.size)} more friends.
          </div>

          {/* Friends list */}
          <div className="max-h-[400px] overflow-y-auto">
            {loading && (
              <div className="text-white/60 text-center py-8">
                Loading friends...
              </div>
            )}

            {error && (
              <div className="text-red-400 text-center py-8">
                Error: {error instanceof Error ? error.message : 'Unknown error'}
              </div>
            )}

            {!loading && !error && filteredFriends.length === 0 && friends.length > 0 && (
              <div className="text-white/60 text-center py-8">
                No friends found matching "{searchQuery}"
              </div>
            )}

            {!loading && !error && friends.length === 0 && (
              <div className="text-white/60 text-center py-8">
                No friends yet. Create some personas first!
              </div>
            )}

            {!loading && !error && filteredFriends.length > 0 && (
              <div className="space-y-2">
                {filteredFriends.map((friend) => (
                  <div
                    key={friend.id}
                    className="flex items-center gap-3 p-3 hover:bg-[#2a2a2e] rounded-lg transition-colors cursor-pointer"
                    onClick={() => toggleFriendSelection(friend.id)}
                  >
                    {/* Checkbox */}
                    <div className="flex items-center justify-center w-5 h-5 rounded border border-neutral-500 bg-[#17171a]">
                      {selectedFriends.has(friend.id) && (
                        <div className="w-full h-full flex items-center justify-center bg-blue-500 rounded">
                          <span className="text-white text-xs font-bold">✓</span>
                        </div>
                      )}
                    </div>

                    {/* Avatar */}
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

                    {/* Name */}
                    <div className="flex-1">
                      <div className="text-white font-semibold text-sm">{friend.username}</div>
                    </div>

                    {/* Selection indicator */}
                    {selectedFriends.has(friend.id) && (
                      <div className="text-blue-400 text-xs font-medium">Selected</div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          <button
            onClick={() => handleOpenChange(false)}
            className="flex-1 px-4 py-2 text-white/80 bg-[#2a2a2e] hover:bg-[#3a3a3e] rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleCreateGroupChat}
            disabled={selectedFriends.size === 0 || isCreating}
            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 disabled:cursor-not-allowed text-white rounded-lg transition-colors font-medium"
          >
            {isCreating ? 'Creating...' : `Create Group Chat (${selectedFriends.size})`}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

