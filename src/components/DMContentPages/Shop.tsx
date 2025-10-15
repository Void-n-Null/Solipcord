import { DMHeader } from "../DMHeader";

export function Shop() {
  return (
    <div className="flex-1 flex flex-col">
      <DMHeader>
        <div className="flex items-center gap-2">
          <h2 className="text-white font-semibold">Shop</h2>
          <span className="text-white/60 text-sm">•</span>
          <span className="text-white/60 text-sm">Browse items</span>
        </div>
      </DMHeader>
      
      <div className="flex-1 bg-[#1a1a1e] p-4">
        <div className="space-y-4">
          <div className="text-white/60 text-center py-8">
            <div className="text-lg font-medium mb-2">Discord Shop</div>
            <div className="text-sm">Discover amazing items and customize your experience!</div>
          </div>
          
          {/* Placeholder for Shop content */}
          <div className="space-y-2">
            {/* This is where shop items would go */}
          </div>
        </div>
      </div>
    </div>
  );
}






