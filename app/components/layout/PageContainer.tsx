import { ReactNode } from 'react';

interface PageContainerProps {
  children: ReactNode;
  className?: string;
}

export function PageContainer({ children, className = '' }: PageContainerProps) {
  return (
    <main className={`container mx-auto px-4 py-8 min-h-screen ${className}`}>
      {children}
    </main>
  );
} 