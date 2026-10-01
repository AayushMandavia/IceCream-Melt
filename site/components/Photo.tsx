/**
 * A photo, or (until the real one is in public/images/melt/) a flat flavour-colour block
 * with a small label saying what goes there.
 */
export default function Photo({
  photo,
  tone,
  hint,
  alt = "",
  className = "",
  eager = false,
}: {
  photo?: string;
  tone: string;
  hint?: string;
  alt?: string;
  className?: string;
  eager?: boolean;
}) {
  if (photo) return <img src={photo} alt={alt} loading={eager ? "eager" : "lazy"} className={`h-full w-full object-cover ${className}`} />;
  return (
    <div role="img" aria-label={alt || hint} className={`ph relative h-full w-full ${className}`} style={{ backgroundColor: tone }}>
      {hint && (
        <span className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-white/70 px-3 py-1 text-[12px] font-bold whitespace-nowrap text-[#2b1233]/70">
          {hint}
        </span>
      )}
    </div>
  );
}
