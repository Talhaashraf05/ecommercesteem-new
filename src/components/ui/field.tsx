export interface FieldProps {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  as?: "input" | "textarea" | "select";
  options?: { value: string; label: string }[];
  defaultValue?: string;
  error?: string;
  autoComplete?: string;
  accept?: string;
}

const CONTROL = "w-full rounded-xl border border-line bg-surface-raised px-4 py-3 text-fg placeholder:text-muted focus:border-line-strong";

export const Field = ({ label, name, type = "text", required, as = "input", options = [], defaultValue, error, autoComplete, accept }: FieldProps) => {
  const id = `f-${name}`;
  const describedBy = error ? `${id}-err` : undefined;
  const common = { id, name, required, defaultValue, "aria-invalid": Boolean(error), "aria-describedby": describedBy, className: CONTROL };
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-sm text-muted">
        {label}{required && <span className="text-brand"> *</span>}
      </label>
      {as === "textarea" ? (
        <textarea rows={5} {...common} />
      ) : as === "select" ? (
        <select {...common}>
          <option value="">Select…</option>
          {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      ) : (
        <input type={type} autoComplete={autoComplete} accept={accept} {...common} />
      )}
      {error && <p id={describedBy} className="text-sm text-brand-glow">{error}</p>}
    </div>
  );
};
