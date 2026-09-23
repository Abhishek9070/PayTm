import { useId, useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export default function PasswordInput({
  label = "Password",
  id,
  className = "",
  ...props
}) {
  const generatedId = useId();
  const inputId = id || generatedId;
  const [visible, setVisible] = useState(false);

  return (
    <div>
      <label htmlFor={inputId} className="mb-2 block text-sm font-medium text-slate-200">
        {label}
      </label>
      <input
        {...props}
        id={inputId}
        type={visible ? "text" : "password"}
        className={`w-full rounded-2xl border border-white/10 bg-slate-800 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-sky-400/60 focus:bg-slate-700/80 focus:ring-1 focus:ring-sky-400/30 ${className}`}
      />
      <button
        type="button"
        onClick={() => setVisible((current) => !current)}
        className="mt-2 inline-flex items-center gap-2 text-sm text-sky-300 hover:text-sky-200"
        aria-label={visible ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}
      >
        {visible ? <EyeOff size={16} /> : <Eye size={16} />}
        {visible ? "Hide password" : "Show password"}
      </button>
    </div>
  );
}
