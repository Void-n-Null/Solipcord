import { ReactNode } from 'react';
import { PersonaCreationModal } from './PersonaCreationModal';

interface DMHeaderProps {
  children?: ReactNode;
  onPersonaCreated?: () => void;
}

export function DMHeader({ children, onPersonaCreated }: DMHeaderProps) {
  return (
    <div className="w-full h-[48px] border-b border-[var(--header-border)] flex items-center px-4">
      {/* Content area for future use */}
      <div className="flex-1">
        {children}
      </div>
      
      {/* Settings button in the right corner */}
      <div className="flex items-center">
        <PersonaCreationModal onPersonaCreated={onPersonaCreated} />
      </div>
    </div>
  );
}
