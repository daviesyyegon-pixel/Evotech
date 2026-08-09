import { InputHTMLAttributes, TextareaHTMLAttributes } from "react";

export function Input(props: InputHTMLAttributes<HTMLInputElement> & { label?: string }) {
  const { label, className = "", ...rest } = props;
  return (
    <label className="block">
      {label && <span className="mb-1.5 block text-sm font-medium text-ink/80">{label}</span>}
      <input
        className={`w-full rounded-lg border border-ink/15 bg-white px-4 py-2.5 text-sm text-ink placeholder:text-slate focus:border-indigo focus:outline-none focus:ring-2 focus:ring-indigo/20 ${className}`}
        {...rest}
      />
    </label>
  );
}

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string }) {
  const { label, className = "", ...rest } = props;
  return (
    <label className="block">
      {label && <span className="mb-1.5 block text-sm font-medium text-ink/80">{label}</span>}
      <textarea
        className={`w-full rounded-lg border border-ink/15 bg-white px-4 py-2.5 text-sm text-ink placeholder:text-slate focus:border-indigo focus:outline-none focus:ring-2 focus:ring-indigo/20 ${className}`}
        {...rest}
      />
    </label>
  );
}
