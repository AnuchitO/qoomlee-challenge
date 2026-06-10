interface PasswordStrengthProps {
  password: string;
}

export function PasswordStrength({ password }: PasswordStrengthProps) {
  const hasLength = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);
  const score = [hasLength, hasUpper, hasLower, hasNumber, hasSpecial].filter(Boolean).length;

  const bars = [
    score >= 1 ? "bg-error" : "bg-outline-variant",
    score >= 2 ? "bg-tertiary" : "bg-outline-variant",
    score >= 3 ? "bg-secondary" : "bg-outline-variant",
    score >= 4 ? "bg-green-500" : "bg-outline-variant",
    score >= 5 ? "bg-green-500" : "bg-outline-variant",
  ];

  const label = ["", "Too weak", "Weak", "Fair", "Strong", "Very strong"][score];

  if (!password) return null;

  return (
    <div className="space-y-sm">
      <div className="flex gap-xs">
        {bars.map((b, i) => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${b}`} />
        ))}
      </div>
      <div className="flex flex-wrap gap-xs px-1">
        {[
          { ok: hasLength, label: "8+ chars" },
          { ok: hasUpper, label: "Uppercase" },
          { ok: hasNumber, label: "Number" },
          { ok: hasSpecial, label: "Special char" },
        ].map(({ ok, label: l }) => (
          <span
            key={l}
            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-label-sm border ${
              ok
                ? "bg-green-50 text-green-700 border-green-100"
                : "bg-error-container/20 text-error border-error-container/30"
            }`}
          >
            <span className="material-symbols-outlined text-[14px]">{ok ? "check" : "close"}</span>
            {l}
          </span>
        ))}
      </div>
      <p className="text-label-sm text-on-surface-variant px-1">{label}</p>
    </div>
  );
}
