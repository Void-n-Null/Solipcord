import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

type NavButtonVariant =
  | "primary"
  | "neutral"

const navButtonBase = "w-[42px] h-[42px] rounded-[12px] border transition-colors bg-center bg-no-repeat bg-cover";

const navButtonVariants: Record<NavButtonVariant, string> = {
  primary: "bg-blue-500 hover:bg-blue-600 border-[var(--header-border)]",
  neutral: "bg-neutral-900 hover:bg-neutral-800 border-[var(--header-border)]",
};

interface NavButtonProps {
  ariaLabel: string;
  variant?: NavButtonVariant;
  className?: string;
  imageSrc?: string;
  onClick?: () => void;
}

export function NavButton({ ariaLabel, variant = "neutral", className, imageSrc, onClick }: NavButtonProps) {
  const classes = twMerge(clsx(navButtonBase, navButtonVariants[variant], className));
  const normalizedSrc = imageSrc
    ? imageSrc.startsWith("@")
      ? `/${imageSrc.slice(1)}`
      : imageSrc
    : undefined;
  return (
    <button aria-label={ariaLabel} className={classes} onClick={onClick} style={normalizedSrc ? { backgroundImage: `url(${normalizedSrc})` } : undefined} />
  );
}
