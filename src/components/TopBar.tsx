export function TopBar() {
  return (
    <header className="flex-shrink-0">
      <div className="flex justify-center mx-auto px-5 pt-[6px] pb-[5px]">
        <h1 className="text-[14px] text-center font-medium text-[var(--header-text)] inline-flex items-center justify-center gap-[8px]">
          <div className="w-[16px] h-[20px] -mt-1">
            <span
              aria-hidden
              className="inline-block w-[16px] h-[20px] bg-[#aaaab1] align-middle [mask-image:url('/wave.svg')] [mask-repeat:no-repeat] [mask-position:center] [mask-size:contain] [-webkit-mask-image:url('/wave.svg')] [-webkit-mask-repeat:no-repeat] [-webkit-mask-position:center] [-webkit-mask-size:contain]"
            />
          </div>
          Friends
        </h1>
      </div>
    </header>
  );
}
