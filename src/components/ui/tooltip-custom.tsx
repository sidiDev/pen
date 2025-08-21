import { JSX } from "react";
import {
  Tooltip as TooltipPrimitive,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

function Tooltip({
  children,
  content,
  side = "top",
  ...props
}: {
  children: JSX.Element;
  content: string;
  side?: "top" | "bottom" | "left" | "right";
}): JSX.Element {
  return (
    <TooltipPrimitive disableHoverableContent={true} delayDuration={700}>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent className="bg-zinc-800 text-zinc-300" side={side}>
        {content}
      </TooltipContent>
    </TooltipPrimitive>
  );
}

export default Tooltip;
