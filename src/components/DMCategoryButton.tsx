interface DMCategoryButtonProps {
  iconSrc: string;
  label: string;
  onClick?: () => void;
  selected?: boolean;
}

export function DMCategoryButton({ iconSrc, label, onClick, selected = false }: DMCategoryButtonProps) {
  return (
    <div className="">
    <button 
      className={`h-[38px] group w-full  mx-auto flex items-center gap-2 pb-[6px] text-md text-[var(--header-text)] hover:bg-[#1d1d1e] active:bg-[#2c2c30] rounded-lg transition-colors ${
        selected ? 'bg-[#2c2c30]' : 'focus:bg-[#2c2c30]'
      }`}
      onClick={onClick}
    >
      <div className="w-[20px] h-[20px] ml-2">
        <span
          aria-hidden
          className={`inline-block w-[20px] h-[20px] align-middle [mask-image:url('/wave.svg')] [mask-repeat:no-repeat] [mask-position:center] [mask-size:contain] [-webkit-mask-image:url('/wave.svg')] [-webkit-mask-repeat:no-repeat] [-webkit-mask-position:center] [-webkit-mask-size:contain] transition-colors ${
            selected ? 'bg-white' : 'bg-[#aaaab1] group-focus:bg-white'
          }`}
        />
      </div>
      <span className={`ml-[4px] mt-[6px] font-medium transition-colors ${
        selected ? 'text-white' : 'text-[#aaaab1] group-focus:text-white'
      }`}>{label}</span>
    </button>
    </div>
  );
}
