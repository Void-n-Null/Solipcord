import { NavButton } from "./NavButton";

interface ServerData {
  id: number;
  label: string;
  imageSrc?: string;
  className?: string;
}

interface ServerButtonProps {
  server: ServerData;
  isSelected: boolean;
  onSelect: () => void;
}

function ServerButton({ server, isSelected, onSelect }: ServerButtonProps) {
  return (
    <div className="relative w-full flex justify-center">
      {isSelected && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 bg-blue-500 rounded-r" />
      )}
      <NavButton
        ariaLabel={server.label}
        variant="neutral"
        className={server.className}
        imageSrc={server.imageSrc}
        onClick={onSelect}
      />
    </div>
  );
}

const servers: ServerData[] = [
  { id: 0, label: "Server 1", imageSrc: "@Dance.png" },
  { id: 1, label: "Server 2", imageSrc: "@pron.png", className: "w-10 h-10 rounded-[10px]" },
  { id: 2, label: "Server 3", imageSrc: "@MC.png", className: "w-10 h-10 rounded-[10px]" },
  { id: 3, label: "Server 4", className: "w-10 h-10 rounded-[10px]" },
  { id: 4, label: "Server 5", className: "w-10 h-10 rounded-[10px]" },
  { id: 5, label: "Server 6", className: "w-10 h-10 rounded-[10px]" },
  { id: 6, label: "Server 7", className: "w-10 h-10 rounded-[10px]" },
  { id: 7, label: "Server 8", className: "w-10 h-10 rounded-[10px]" },
  { id: 8, label: "Server 9", className: "w-10 h-10 rounded-[10px]" },
  { id: 9, label: "Server 10", className: "w-10 h-10 rounded-[10px]" },
  { id: 10, label: "Server 11", className: "w-10 h-10 rounded-[10px]" },
];

interface SideBarProps {
  selectedServer: number;
  onServerSelect: (serverId: number) => void;
}

export function SideBar({ selectedServer, onServerSelect }: SideBarProps) {
  return (
    <aside className="w-18 max-w-18 mt-[-1px]">
      {/* Top Nav Button is above the rest. Must stay at top of the page. */}
      <div className="flex flex-col items-center gap-[7px] px-2">
        <NavButton ariaLabel="Timeline" variant="primary" />
        <div className="w-8 h-px bg-[var(--header-border)] " />
      </div>

      <nav className="h-full flex flex-col items-center gap-[7px] py-[7px] px-2">
        {servers.map((server) => (
          <ServerButton
            key={server.id}
            server={server}
            isSelected={selectedServer === server.id}
            onSelect={() => onServerSelect(server.id)}
          />
        ))}
      </nav>
    </aside>
  );
}
