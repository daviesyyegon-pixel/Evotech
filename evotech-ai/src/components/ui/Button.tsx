import { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
}

const variants: Record<string, string> = {
  primary: "bg-gold text-ink hover:bg-gold-light",
  secondary: "bg-indigo text-paper hover:bg-indigo-light",
  ghost: "border border-ink/15 text-ink hover:border-ink/40",
  danger: "bg-red-600 text-white hover:bg-red-500",
};

export default function Button({ variant = "primary", className = "", ...props }: ButtonProps) {
  return (
    <button
      className={`rounded-full px-5 py-2.5 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${className}`}
      {...props}
    />
  );
}
