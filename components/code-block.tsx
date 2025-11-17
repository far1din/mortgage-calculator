import { cn } from "@/lib/utils";

export default function CodeBlock({ children, className }: { children: React.ReactNode; className?: string }) {
    return <kbd className={cn("text-xs px-1 bg-gray-200 ml-2 rounded font-semibold", className)}>{children}</kbd>;
}
