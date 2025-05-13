export function LoadingDots() {
  return (
    <div className="flex space-x-2">
      <div className="w-2 h-2 bg-foreground/60 rounded-full animate-pulse"></div>
      <div className="w-2 h-2 bg-foreground/60 rounded-full animate-pulse delay-150"></div>
      <div className="w-2 h-2 bg-foreground/60 rounded-full animate-pulse delay-300"></div>
    </div>
  );
} 