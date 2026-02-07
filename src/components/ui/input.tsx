import * as React from "react";

export function Input(
  props: React.InputHTMLAttributes<HTMLInputElement> & { className?: string },
) {
  return (
    <input
      {...props}
      className={[
        "h-10 w-full rounded-md border px-3 text-sm outline-none",
        "focus:ring-2 focus:ring-offset-2",
        props.className ?? "",
      ].join(" ")}
    />
  );
}
