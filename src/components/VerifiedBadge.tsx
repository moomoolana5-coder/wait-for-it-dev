import { CheckCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface VerifiedBadgeProps {
  className?: string;
}

export function VerifiedBadge({ className = "" }: VerifiedBadgeProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <CheckCircle className={`text-yellow-500 fill-yellow-500 ${className}`} />
        </TooltipTrigger>
        <TooltipContent>
          <p>Verified Token</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
