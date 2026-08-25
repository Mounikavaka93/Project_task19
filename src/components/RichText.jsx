import { Link } from "react-router-dom";

export default function RichText({ text, className = "" }) {
  if (!text) return null;
  const parts = String(text).split(/([#@][a-zA-Z0-9._]+)/g);

  return (
    <span className={className}>
      {parts.map((part, i) => {
        if (part.startsWith("#") && part.length > 1) {
          return (
            <Link
              key={`${part}-${i}`}
              to={`/explore?q=${encodeURIComponent(part)}`}
              className="font-medium text-ig-link hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              {part}
            </Link>
          );
        }
        if (part.startsWith("@") && part.length > 1) {
          return (
            <Link
              key={`${part}-${i}`}
              to={`/profile/${part.slice(1)}`}
              className="font-medium text-ig-link hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              {part}
            </Link>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </span>
  );
}
