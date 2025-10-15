'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

interface PersonaCreationModalProps {
  onPersonaCreated?: () => void;
}

export function PersonaCreationModal({ onPersonaCreated }: PersonaCreationModalProps) {
  const [open, setOpen] = useState(false);
  const [username, setUsername] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleCreatePersona = async () => {
    if (!username.trim()) return;
    
    setIsLoading(true);
    try {
      const response = await fetch('/api/personas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username.trim(),
          imageUrl: imageUrl.trim() || undefined,
          isFriendOfUser: true,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create persona');
      }

      const persona = await response.json();
      console.log('Created persona:', persona);
      
      // Reset form
      setUsername('');
      setImageUrl('');
      setOpen(false);
      
      // Notify parent component
      onPersonaCreated?.();
    } catch (error) {
      console.error('Failed to create persona:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isLoading) {
      handleCreatePersona();
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Settings className="h-4 w-4" />
          <span className="sr-only">Settings</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Persona</DialogTitle>
          <DialogDescription>
            Add a new AI persona as a friend. They will appear in your friends list and you can start chatting with them.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="username" className="text-right text-sm font-medium">
              Username
            </label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter username"
              className="col-span-3"
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="imageUrl" className="text-right text-sm font-medium">
              Image URL
            </label>
            <Input
              id="imageUrl"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="https://example.com/avatar.png"
              className="col-span-3"
            />
          </div>
          
          {/* Image Preview */}
          {imageUrl && (
            <div className="grid grid-cols-4 items-center gap-4">
              <label className="text-right text-sm font-medium">
                Preview
              </label>
              <div className="col-span-3 flex justify-center">
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-gray-200 relative">
                  <Image
                    src={imageUrl}
                    alt="Avatar preview"
                    fill
                    className="object-cover"
                    onError={(e) => {
                      e.currentTarget.src = '/avatars/default.png';
                    }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleCreatePersona}
            disabled={!username.trim() || isLoading}
          >
            {isLoading ? 'Creating...' : 'Create Persona'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
