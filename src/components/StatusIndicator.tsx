import Image from 'next/image';

export enum StatusType {
  OFFLINE = 'offline',
  ONLINE = 'online',
  IDLE = 'idle',
  DO_NOT_DISTURB = 'dnd',
  INVISIBLE = 'invisible'
}

interface StatusIndicatorProps {
  status: StatusType;
  size?: number;
  className?: string;
}

const statusConfig = {
  [StatusType.OFFLINE]: {
    icon: '/status-offline.svg',
    alt: 'Offline'
  },
  [StatusType.ONLINE]: {
    icon: '/status-online.svg',
    alt: 'Online'
  },
  [StatusType.IDLE]: {
    icon: '/status-idle.svg',
    alt: 'Idle'
  },
  [StatusType.DO_NOT_DISTURB]: {
    icon: '/status-dnd.svg',
    alt: 'Do Not Disturb'
  },
  [StatusType.INVISIBLE]: {
    icon: '/status-invisible.svg',
    alt: 'Invisible'
  }
};

export function StatusIndicator({ status, size = 16, className = '' }: StatusIndicatorProps) {
  const config = statusConfig[status];
  
  return (
    <div 
      className={`absolute -bottom-0.5 -right-0.5 ${className}`}
      style={{ width: size, height: size }}
    >
      <Image 
        src={config.icon} 
        alt={config.alt} 
        className="w-full h-full"
        width={size}
        height={size}
      />
    </div>
  );
}
