import { DMSideBar } from "./DMSideBar";
import { DMContent } from "./DMContent";
import { FriendsList, Nitro, Shop } from "./DMContentPages";
import { DMChatInterface } from "./DMChatInterface";
import { useState } from "react";
import { DirectMessage, Persona } from "@/types/dm";

export function ContentArea() {
  const [selectedPage, setSelectedPage] = useState<string | null>(null);
  const [selectedDM, setSelectedDM] = useState<DirectMessage | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleDMSelect = (dm: DirectMessage) => {
    setSelectedDM(dm);
    setSelectedPage(null); // Clear page selection when DM is selected
  };

  const handleCategorySelect = (category: string) => {
    setSelectedPage(category);
    setSelectedDM(null); // Clear DM selection when category is selected
  };

  const triggerDMRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handlePersonaUpdate = (updatedPersona: Persona) => {
    // Update the selectedDM if it contains the updated persona
    if (selectedDM && selectedDM.persona.id === updatedPersona.id) {
      setSelectedDM({
        ...selectedDM,
        persona: updatedPersona,
      });
    }
    // Trigger a refresh to update any other components that might show this persona
    triggerDMRefresh();
  };

  const renderPage = () => {
    // If a DM is selected, show DM chat interface
    if (selectedDM) {
      return <DMChatInterface dm={selectedDM} onDMRefresh={triggerDMRefresh} onPersonaUpdate={handlePersonaUpdate} />;
    }

    // Otherwise show category pages
    switch (selectedPage) {
      case 'friends':
        return <FriendsList onDMSelect={handleDMSelect} onDMRefresh={triggerDMRefresh} />;
      case 'nitro':
        return <Nitro />;
      case 'shop':
        return <Shop />;
      default:
        return (
          <div className="flex-1 flex flex-col">
            <div className="w-full h-[48px] border-b border-[var(--header-border)] flex items-center px-4">
              <div className="flex-1">
                <div className="text-white/60">Welcome to Direct Messages</div>
              </div>
            </div>
            <div className="flex-1 bg-[#1a1a1e] p-4">
              <div className="h-full">
                <div className="text-white/60 text-center mt-8">
                  Select a category to get started
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex-1 flex min-h-0">
      <div className="flex-1 border-l border-t border-[var(--header-border)] bg-[#1a1a1e] rounded-tl-xl flex min-h-0">
        <DMSideBar 
          onCategorySelect={handleCategorySelect} 
          selectedCategory={selectedPage} 
          onDMSelect={handleDMSelect}
          selectedDM={selectedDM}
          refreshTrigger={refreshTrigger}
        />
        <DMContent>
          {renderPage()}
        </DMContent>
      </div>
    </div>
  );
}
