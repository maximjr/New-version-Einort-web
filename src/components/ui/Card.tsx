import { cn } from "../../lib/utils";
import React, { useRef, useState, useEffect } from "react";
import { motion, HTMLMotionProps } from "motion/react";

export interface CardProps extends Omit<
  HTMLMotionProps<"div">,
  "ref" | "children"
> {
  spotlight?: boolean;
  children?: React.ReactNode;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, children, spotlight = true, ...props }, ref) => {
    const divRef = useRef<HTMLDivElement>(null);
    const [isMounted, setIsMounted] = useState(false);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [opacity, setOpacity] = useState(0);

    useEffect(() => {
      setIsMounted(true);
    }, []);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
      if (!divRef.current || !spotlight) return;

      const rect = divRef.current.getBoundingClientRect();
      setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    };

    const handleMouseEnter = () => setOpacity(1);
    const handleMouseLeave = () => setOpacity(0);

    return (
      <motion.div
        ref={(node) => {
          (divRef as any).current = node;
          if (typeof ref === "function") {
            ref(node);
          } else if (ref) {
            (ref as any).current = node;
          }
        }}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        whileTap={{ scale: 0.98, opacity: 0.95 }}
        transition={{ type: "spring", stiffness: 400, damping: 30, mass: 0.8 }}
        className={cn(
          "rounded-[24px] border border-white/5 bg-surface/50 backdrop-blur-sm shadow-xl transition-shadow duration-500 hover:border-white/10 hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)] relative overflow-hidden group",
          className,
        )}
        {...props}
      >
        {isMounted && spotlight && (
          <div
            className="pointer-events-none absolute -inset-px opacity-0 transition duration-300"
            style={{
              opacity,
              background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, rgba(255,255,255,.06), transparent 40%)`,
            }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
        <div className="relative z-10 h-full flex flex-col">{children}</div>
      </motion.div>
    );
  },
);
Card.displayName = "Card";

export function CardHeader({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex flex-col space-y-1.5 p-6 md:p-8", className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardTitle({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn(
        "text-2xl font-bold leading-none tracking-tight font-display",
        className,
      )}
      {...props}
    >
      {children}
    </h3>
  );
}

export function CardContent({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "p-6 md:p-8 pt-0 flex-grow text-text-muted leading-relaxed",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardFooter({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex items-center p-6 md:p-8 pt-0", className)}
      {...props}
    >
      {children}
    </div>
  );
}
