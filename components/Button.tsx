import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

export function Button({
  variant = "primary",
  size = "md",
  isLoading = false,
  children,
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  const baseClass =
    "rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed";

  const variantClass =
    variant === "primary"
      ? "bg-blue-600 text-white hover:bg-blue-700"
      : "bg-gray-200 text-gray-900 hover:bg-gray-300";

  const sizeClass =
    size === "sm"
      ? "py-2 px-4 text-sm"
      : size === "lg"
        ? "py-3 px-6 text-base"
        : "py-2 px-4 text-base";

  return (
    <button
      className={`${baseClass} ${variantClass} ${sizeClass} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? "Loading..." : children}
    </button>
  );
}
