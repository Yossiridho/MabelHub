import * as React from "react";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "outline";
  size?: "sm" | "md";
};

function cx(...classes: Array<string | undefined | false>) {
  return classes.filter(Boolean).join(" ");
}

export function Button({
  variant = "default",
  size = "md",
  className,
  ...props
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50";

  const variants: Record<NonNullable<ButtonProps["variant"]>, string> = {
    default: "bg-black text-white hover:bg-black/90",
    outline: "border bg-transparent hover:bg-black/5",
  };

  const sizes: Record<NonNullable<ButtonProps["size"]>, string> = {
    sm: "h-8 px-3",
    md: "h-9 px-4",
  };

  return (
    <button
      {...props}
      className={cx(base, variants[variant], sizes[size], className)}
    />
  );
}
