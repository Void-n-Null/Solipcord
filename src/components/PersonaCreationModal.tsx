'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Settings, Wand2 } from 'lucide-react';
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
// Removed direct import of generateImage - now using API route

interface PersonaCreationModalProps {
  onPersonaCreated?: () => void;
}

export function PersonaCreationModal({ onPersonaCreated }: PersonaCreationModalProps) {
  const [open, setOpen] = useState(false);
  const [username, setUsername] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

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
                disabled={isGeneratingImage || isLoading}
                title="Generate AI Image"
              >
                <Wand2 className={`h-4 w-4 ${isGeneratingImage ? 'animate-spin' : ''}`} />
              </Button>
            </div>
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
            disabled={!username.trim() || isLoading || isGeneratingImage}
          >
            {isLoading ? 'Creating...' : 'Create Persona'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
