import { DMSideBar } from "./DMSideBar";
import { DMContent } from "./DMContent";
import { FriendsList, Nitro, Shop } from "./DMContentPages";
import { useState } from "react";

export function ContentArea() {
  const [selectedPage, setSelectedPage] = useState<string | null>(null);

  const renderPage = () => {
    switch (selectedPage) {
      case 'friends':
        return <FriendsList />;
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
    <div className="flex-1 flex">
      <div className="flex-1 border-l border-t border-[var(--header-border)] bg-[#1a1a1e] rounded-tl-xl flex">
        <DMSideBar onCategorySelect={setSelectedPage} selectedCategory={selectedPage} />
        <DMContent>
          {renderPage()}
        </DMContent>
      </div>
    </div>
  );
}
