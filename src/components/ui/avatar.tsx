interface AvatarProps {
  src?: string | null;
  name?: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizes = { sm: "h-8 w-8 text-xs", md: "h-10 w-10 text-sm", lg: "h-12 w-12 text-base" };

function getInitials(name?: string | null) {
  if (!name) return "?";
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

export function Avatar({ src, name, size = "md", className = "" }: AvatarProps) {
  if (src) {
    return <img src={src} alt={name || ""} className={`rounded-full object-cover ${sizes[size]} ${className}`} />;
  }
  return (
    <div className={`inline-flex items-center justify-center rounded-full bg-zinc-200 font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300 ${sizes[size]} ${className}`}>
      {getInitials(name)}
    </div>
  );
}
