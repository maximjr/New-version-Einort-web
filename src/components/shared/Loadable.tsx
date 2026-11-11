import { Suspense, ComponentType, useState, useEffect } from "react";

/**
 * A highly polished, performant fallback loader that prevents 
 * flicker on fast network connections using a slight delay.
 */
function DefaultLoadingFallback() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Delay showing the spinner for 250ms to prevent flickering on fast loads
    const timer = setTimeout(() => setShow(true), 250);
    return () => clearTimeout(timer);
  }, []);

  if (!show) return null;

  return (
    <div className="min-h-[60vh] w-full bg-background flex flex-col items-center justify-center p-6 text-center animate-fade-in relative overflow-hidden">
      <div className="relative flex items-center justify-center mb-6">
        <div className="absolute w-24 h-24 bg-primary/10 rounded-full blur-[40px] animate-pulse"></div>
        <div className="w-8 h-8 md:w-10 md:h-10 border-[1.5px] border-black/5 dark:border-white/5 border-t-[#007AFF] dark:border-t-primary rounded-full animate-spin"></div>
      </div>
      <div className="h-[2px] w-24 overflow-hidden rounded-full bg-black/5 dark:bg-white/5 relative">
         <div className="absolute inset-y-0 left-0 bg-[#007AFF] dark:bg-primary w-1/3 rounded-full animate-progress z-10"></div>
      </div>
    </div>
  );
}

/**
 * Loadable Higher-Order Component (HOC)
 * Combines React.lazy + Suspense with consistent fallback UI and flash-free transitions
 */
export function Loadable<P extends object>(
  LazyComponent: ComponentType<P>,
  CustomFallback: ComponentType | null = null
): ComponentType<P> {
  const Fallback = CustomFallback || DefaultLoadingFallback;

  return function (props: P) {
    return (
      <Suspense fallback={<Fallback />}>
        <LazyComponent {...props} />
      </Suspense>
    );
  };
}
