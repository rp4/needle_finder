import { useEffect, useRef, useState } from 'react';

interface UseIntersectionObserverOptions {
  threshold?: number;
  rootMargin?: string;
  enabled?: boolean;
}

export function useIntersectionObserver<T extends HTMLElement>(
  options: UseIntersectionObserverOptions = {}
): [React.RefObject<T>, boolean] {
  const { threshold = 0, rootMargin = '0px', enabled = true } = options;
  const elementRef = useRef<T>(null);
  const [isIntersecting, setIsIntersecting] = useState(false);

  useEffect(() => {
    if (!enabled || !elementRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
      },
      { threshold, rootMargin }
    );

    const element = elementRef.current;
    observer.observe(element);

    return () => {
      observer.unobserve(element);
      observer.disconnect();
    };
  }, [enabled, threshold, rootMargin]);

  return [elementRef, isIntersecting];
}

// Usage for lazy rendering components
export function LazyRender<T extends HTMLElement>({
  children,
  placeholder = <div style={{ height: '100px' }} />,
  rootMargin = '50px'
}: {
  children: React.ReactNode;
  placeholder?: React.ReactNode;
  rootMargin?: string;
}) {
  const [ref, isVisible] = useIntersectionObserver<T>({ rootMargin });

  return (
    <div ref={ref as any}>
      {isVisible ? children : placeholder}
    </div>
  );
}