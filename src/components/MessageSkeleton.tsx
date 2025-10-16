'use client';

export function MessageSkeleton() {
  return (
    <div className="overflow-y-auto px-4">
      {/* Fake Date Divider */}
      <div className="flex items-center gap-4 my-4">
        <div className="flex-1 h-[0.5px] bg-[#404040]"></div>
        <div className="h-4 w-16 bg-[#404040] rounded animate-pulse"></div>
        <div className="flex-1 h-[0.5px] bg-[#404040]"></div>
      </div>

      {/* First Message Group */}
      <div className="flex gap-4 px-2 pt-2 pb-1 -mx-2 rounded-md items-start">
        <div className="w-10 h-10 rounded-full bg-[#404040] animate-pulse flex-shrink-0"></div>
        <div className="flex-1 min-w-0">
          <div className="relative top-[-4px] flex items-baseline gap-2 mt-[-3px] mb-1">
            <div className="h-4 w-20 bg-[#404040] rounded animate-pulse"></div>
            <div className="h-3 w-12 bg-[#404040] rounded animate-pulse"></div>
          </div>
          <div className="mt-[-5px]">
            <div className="space-y-1">
              <div className="h-4 bg-[#404040] rounded w-full animate-pulse"></div>
              <div className="h-4 bg-[#404040] rounded w-5/6 animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Second Message */}
      <div className="flex gap-4 px-2 pt-2 pb-1 -mx-2 rounded-md items-start">
        <div className="w-10 h-10 rounded-full bg-[#404040] animate-pulse flex-shrink-0"></div>
        <div className="flex-1 min-w-0">
          <div className="relative top-[-4px] flex items-baseline gap-2 mt-[-3px] mb-1">
            <div className="h-4 w-20 bg-[#404040] rounded animate-pulse"></div>
            <div className="h-3 w-12 bg-[#404040] rounded animate-pulse"></div>
          </div>
          <div className="mt-[-5px]">
            <div className="space-y-1">
              <div className="h-4 bg-[#404040] rounded w-4/5 animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Third Message */}
      <div className="flex gap-4 px-2 pt-2 pb-1 -mx-2 rounded-md items-start">
        <div className="w-10 h-10 rounded-full bg-[#404040] animate-pulse flex-shrink-0"></div>
        <div className="flex-1 min-w-0">
          <div className="relative top-[-4px] flex items-baseline gap-2 mt-[-3px] mb-1">
            <div className="h-4 w-24 bg-[#404040] rounded animate-pulse"></div>
            <div className="h-3 w-12 bg-[#404040] rounded animate-pulse"></div>
          </div>
          <div className="mt-[-5px]">
            <div className="space-y-1">
              <div className="h-4 bg-[#404040] rounded w-full animate-pulse"></div>
              <div className="h-4 bg-[#404040] rounded w-full animate-pulse"></div>
              <div className="h-4 bg-[#404040] rounded w-3/5 animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Fake Date Divider */}
      <div className="flex items-center gap-4 my-4">
        <div className="flex-1 h-[0.5px] bg-[#404040]"></div>
        <div className="h-4 w-16 bg-[#404040] rounded animate-pulse"></div>
        <div className="flex-1 h-[0.5px] bg-[#404040]"></div>
      </div>

      {/* Fourth Message */}
      <div className="flex gap-4 px-2 pt-2 pb-1 -mx-2 rounded-md items-start">
        <div className="w-10 h-10 rounded-full bg-[#404040] animate-pulse flex-shrink-0"></div>
        <div className="flex-1 min-w-0">
          <div className="relative top-[-4px] flex items-baseline gap-2 mt-[-3px] mb-1">
            <div className="h-4 w-20 bg-[#404040] rounded animate-pulse"></div>
            <div className="h-3 w-12 bg-[#404040] rounded animate-pulse"></div>
          </div>
          <div className="mt-[-5px]">
            <div className="space-y-1">
              <div className="h-4 bg-[#404040] rounded w-full animate-pulse"></div>
              <div className="h-4 bg-[#404040] rounded w-11/12 animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Fifth Message */}
      <div className="flex gap-4 px-2 pt-2 pb-1 -mx-2 rounded-md items-start">
        <div className="w-10 h-10 rounded-full bg-[#404040] animate-pulse flex-shrink-0"></div>
        <div className="flex-1 min-w-0">
          <div className="relative top-[-4px] flex items-baseline gap-2 mt-[-3px] mb-1">
            <div className="h-4 w-28 bg-[#404040] rounded animate-pulse"></div>
            <div className="h-3 w-12 bg-[#404040] rounded animate-pulse"></div>
          </div>
          <div className="mt-[-5px]">
            <div className="space-y-1">
              <div className="h-4 bg-[#404040] rounded w-5/6 animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Sixth Message */}
      <div className="flex gap-4 px-2 pt-2 pb-1 -mx-2 rounded-md items-start">
        <div className="w-10 h-10 rounded-full bg-[#404040] animate-pulse flex-shrink-0"></div>
        <div className="flex-1 min-w-0">
          <div className="relative top-[-4px] flex items-baseline gap-2 mt-[-3px] mb-1">
            <div className="h-4 w-24 bg-[#404040] rounded animate-pulse"></div>
            <div className="h-3 w-12 bg-[#404040] rounded animate-pulse"></div>
          </div>
          <div className="mt-[-5px]">
            <div className="space-y-1">
              <div className="h-4 bg-[#404040] rounded w-full animate-pulse"></div>
              <div className="h-4 bg-[#404040] rounded w-4/5 animate-pulse"></div>
              <div className="h-4 bg-[#404040] rounded w-3/5 animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>

      <div className="h-5"></div>
    </div>
  );
}
