import * as React from "react";

export function Table({ children }: { children: React.ReactNode }) {
  return <table className="w-full text-sm">{children}</table>;
}

export function TableHeader({ children }: { children: React.ReactNode }) {
  return <thead className="border-b bg-gray-50">{children}</thead>;
}

export function TableBody({ children }: { children: React.ReactNode }) {
  return <tbody>{children}</tbody>;
}

export function TableRow({ children }: { children: React.ReactNode }) {
  return <tr className="border-b last:border-b-0">{children}</tr>;
}

export function TableHead({ children }: { children: React.ReactNode }) {
  return <th className="px-3 py-2 text-left font-medium">{children}</th>;
}

export function TableCell({
  children,
  colSpan,
  className,
}: {
  children: React.ReactNode;
  colSpan?: number;
  className?: string;
}) {
  return (
    <td colSpan={colSpan} className={["px-3 py-2", className ?? ""].join(" ")}>
      {children}
    </td>
  );
}
