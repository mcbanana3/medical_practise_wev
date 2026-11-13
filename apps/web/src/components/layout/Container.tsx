import type { HTMLAttributes } from "react";

export function Container({
  className = "",
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...props}
      className={`mx-auto w-full max-w-[75rem] px-6 sm:px-8 lg:px-10 ${className}`}
    >
      {children}
    </div>
  );
}