import { DMCategoryButton } from './DMCategoryButton';

interface DMSideBarProps {
  onCategorySelect: (category: string) => void;
  selectedCategory: string | null;
}

export function DMSideBar({ onCategorySelect, selectedCategory }: DMSideBarProps) {
  return (
    <aside className="w-[302px] h-full bg-[var(--background)] rounded-tl-xl">
      <div className="pt-4 ">
        <h2 className="text-sm font-semibold text-[var(--header-text)] mb-[11px] mx-auto w-full text-center px-2">Direct Messages</h2>
        {/* Full width divider */}
        <div className="w-full h-[1px] bg-[var(--header-border)]"></div>
        <div className="px-2">
          <div className="flex flex-col gap-[2px] mt-[9px]">
          <DMCategoryButton 
            iconSrc="/wave.svg" 
            label="Friends" 
            selected={selectedCategory === 'friends'}
            onClick={() => onCategorySelect('friends')}
          />
          <DMCategoryButton 
            iconSrc="/wave.svg" 
            label="Nitro" 
            selected={selectedCategory === 'nitro'}
            onClick={() => onCategorySelect('nitro')}
          />
          <DMCategoryButton 
            iconSrc="/wave.svg" 
            label="Shop" 
            selected={selectedCategory === 'shop'}
            onClick={() => onCategorySelect('shop')}
          />
          </div>
        </div>
      </div>
    </aside>
  );
}
