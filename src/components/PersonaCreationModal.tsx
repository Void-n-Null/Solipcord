'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Settings, Wand2 } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
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
import { Textarea } from '@/components/ui/textarea';
// Removed direct import of generateImage - now using API route

interface PersonaCreationModalProps {
  onPersonaCreated?: () => void;
}

export function PersonaCreationModal({ onPersonaCreated }: PersonaCreationModalProps) {
  const [open, setOpen] = useState(false);
  const [username, setUsername] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const queryClient = useQueryClient();

  const createPersonaMutation = useMutation({
    mutationFn: async (data: { username: string; description?: string; imageUrl?: string }) => {
      const response = await fetch('/api/personas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: data.username,
          description: data.description || undefined,
          imageUrl: data.imageUrl || undefined,
          isFriendOfUser: true,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create persona');
      }

      return await response.json();
    },
    onSuccess: (persona) => {
      console.log('Created persona:', persona);
      
      // Invalidate personas queries to refresh the list
      queryClient.invalidateQueries({ queryKey: ['personas'] });
      
      // Reset form
      setUsername('');
      setDescription('');
      setImageUrl('');
      setOpen(false);
      
      // Notify parent component
      onPersonaCreated?.();
    },
    onError: (error) => {
      console.error('Failed to create persona:', error);
    },
  });

  const handleCreatePersona = async () => {
    if (!username.trim()) return;
    await createPersonaMutation.mutateAsync({
      username: username.trim(),
      description: description.trim(),
      imageUrl: imageUrl.trim(),
    });
  };

  const handleGenerateImage = async () => {
    if (!username.trim()) {
      alert('Please enter a username first to generate a personalized image');
      return;
    }

    setIsGeneratingImage(true);
    try {
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: 'anime girl orange hair smug headshot',
          options: {
            width: 512,
            height: 512,
            steps: 16,
            CFGScale: 1,
            model: 'runware:97@3',
            outputFormat: 'WEBP',
            scheduler: 'Default',
            includeCost: true,
            checkNSFW: true,
            outputType: ['URL'],
            outputQuality: 85,
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('API Error Response:', errorData);
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      if (result.image) {
        setImageUrl(result.image);
        console.log('Generated image:', result);
      } else {
        throw new Error('No image URL returned from API');
      }
    } catch (error) {
      console.error('Failed to generate image:', error);
      
      // Provide more specific error messages
      let errorMessage = 'Failed to generate image';
      if (error instanceof Error) {
        if (error.message.includes('RUNWARE_API_KEY')) {
          errorMessage = 'Runware API key not configured. Please check your environment variables.';
        } else if (error.message.includes('HTTP 401')) {
          errorMessage = 'Invalid Runware API key. Please check your API key.';
        } else if (error.message.includes('HTTP 429')) {
          errorMessage = 'Rate limit exceeded. Please try again later.';
        } else if (error.message.includes('HTTP 402')) {
          errorMessage = 'Insufficient credits. Please add credits to your Runware account.';
        } else if (error.message.includes('No image URL')) {
          errorMessage = 'Image generation succeeded but no image URL was returned.';
        } else {
          errorMessage = `Image generation failed: ${error.message}`;
        }
      }
      
      alert(`${errorMessage}\n\nPlease try again or enter a URL manually.`);
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !createPersonaMutation.isPending) {
      handleCreatePersona();
    }
  };

  const isValidUrl = (url: string): boolean => {
    if (!url) return false;
    try {
      new URL(url);
      return true;
    } catch {
      return false;
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

          <div className="grid grid-cols-4 items-start gap-4">
            <label htmlFor="description" className="text-right text-sm font-medium pt-2">
              Description
            </label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g., A friendly AI enthusiast who loves discussing tech"
              className="col-span-3 min-h-[80px] max-h-[120px] resize-none overflow-y-auto"
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="imageUrl" className="text-right text-sm font-medium">
              Image URL
            </label>
            <div className="col-span-3 flex gap-2">
              <Input
                id="imageUrl"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="https://example.com/avatar.png"
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleGenerateImage}
                disabled={isGeneratingImage || createPersonaMutation.isPending}
                title="Generate AI Image"
              >
                <Wand2 className={`h-4 w-4 ${isGeneratingImage ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
          
          {/* Image Preview */}
          {imageUrl && isValidUrl(imageUrl) && (
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
            disabled={createPersonaMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleCreatePersona}
            disabled={!username.trim() || createPersonaMutation.isPending || isGeneratingImage}
          >
            {createPersonaMutation.isPending ? 'Creating...' : 'Create Persona'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
