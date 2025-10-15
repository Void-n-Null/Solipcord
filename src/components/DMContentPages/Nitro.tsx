import { DMHeader } from "../DMHeader";

export function Nitro() {
  return (
    <div className="flex-1 flex flex-col">
      <DMHeader>
        <div className="flex items-center gap-2">
          <h2 className="text-white font-medium">Nitro</h2>
          <span className="text-white/60 text-sm">•</span>
          <span className="text-white/60 text-sm">Premium features</span>
        </div>
      </DMHeader>
      
      <div className="flex-1 bg-[#1a1a1e] p-4">
        <div className="space-y-4">
          <div className="text-white/60 text-center py-8">
            <div className="text-lg font-medium mb-2">Discord Nitro</div>
            <div className="text-sm">Unlock premium features and support Discord!</div>
          </div>
          
          {/* Placeholder for Nitro content */}
          <div className="space-y-2">
            {/* This is where Nitro features would go */}
          </div>
        </div>
      </div>
    </div>
  );
}
