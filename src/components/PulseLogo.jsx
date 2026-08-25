export default function PulseLogo({ compact = false, className = "" }) {
  if (compact) {
    return (
      <img
        src="/pulse-icon.png"
        alt="Pulse"
        className={className || "h-7 w-7 rounded-lg object-cover"}
      />
    );
  }

  return (
    <span className={`inline-flex items-center gap-[0.35em] leading-none text-ig-text ${className || "text-[32px]"}`}>
      <img src="/pulse-icon.png" alt="" className="h-[0.9em] w-[0.9em] rounded-[0.22em] object-cover" />
      <span className="font-logo">Pulse</span>
    </span>
  );
}
