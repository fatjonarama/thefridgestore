export default function Placeholder({
  className = "",
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <div
      className={`bg-[repeating-linear-gradient(45deg,#1a1a1a,#1a1a1a_10px,#111_10px,#111_20px)] ${className}`}
    >
      {children}
    </div>
  );
}
