import { cn } from "@/lib/utils";

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-gray-200/5 dark:bg-gray-50/10",
        className
      )}
      {...props}
    />
  );
}

export { Skeleton };
