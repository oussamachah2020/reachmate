import { cn } from "@/lib/utils";
import React from "react";
import Lottie from "react-lottie-player";

export function LottiePlayer({
  lottieJson,
  className,
}: {
  lottieJson:
    | object
    | {
        default: object;
      }
    | undefined;
  className?: string;
}) {
  return (
    <Lottie
      loop
      animationData={lottieJson}
      play
      className={cn(className, "w-[300px] h-auto")}
    />
  );
}
