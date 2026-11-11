import { cn } from "../../lib/utils";
import React from "react";

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  children?: React.ReactNode;
}

export function Container({ className, children, ...props }: ContainerProps) {
  return (
    <div
      className={cn(
        "w-full max-w-[1440px] px-4 sm:px-6 lg:px-8 mx-auto",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
