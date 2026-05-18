import React from "react";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";

export function GroupCardSkeleton() {
  return (
    <Card variant="default" className="flex flex-col animate-pulse border-zinc-200">
      {/* Header section */}
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3 min-w-0 w-full">
            {/* Avatar placeholder */}
            <div className="h-10 w-10 rounded-2xl bg-zinc-200 shrink-0" />
            
            <div className="flex-1 space-y-2">
              {/* Title placeholder */}
              <div className="h-4 bg-zinc-200 rounded-md w-3/4" />
              {/* Admin name placeholder */}
              <div className="h-3 bg-zinc-200 rounded-md w-1/3" />
            </div>
          </div>
          {/* Privacy Icon placeholder */}
          <div className="h-4 w-4 bg-zinc-200 rounded-full shrink-0" />
        </div>
      </CardHeader>

      {/* Body section */}
      <CardContent className="flex-1 flex flex-col gap-4 mt-2">
        {/* Description placeholder */}
        <div className="space-y-2">
          <div className="h-3 bg-zinc-200 rounded-md w-full" />
          <div className="h-3 bg-zinc-200 rounded-md w-5/6" />
        </div>

        {/* Tags placeholder */}
        <div className="flex gap-1.5">
          <div className="h-5 w-12 bg-zinc-200 rounded-full" />
          <div className="h-5 w-16 bg-zinc-200 rounded-full" />
        </div>

        {/* Stats grid placeholder */}
        <div className="grid grid-cols-2 gap-2 mt-1">
          <div className="bg-zinc-100 rounded-xl h-[52px]" />
          <div className="bg-zinc-100 rounded-xl h-[52px]" />
        </div>

        {/* Member bar placeholder */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="h-3 w-20 bg-zinc-200 rounded-md" />
            <div className="h-3 w-16 bg-zinc-200 rounded-md" />
          </div>
          <div className="h-1.5 w-full bg-zinc-200 rounded-full" />
        </div>

        {/* Bottom stats placeholder */}
        <div className="flex gap-3">
          <div className="h-3 w-16 bg-zinc-200 rounded-md" />
          <div className="h-3 w-24 bg-zinc-200 rounded-md" />
        </div>
      </CardContent>

      {/* Footer section */}
      <CardFooter className="border-t border-zinc-100 pt-3 flex gap-2 mt-auto">
        {/* Request to join button placeholder */}
        <div className="h-9 w-full bg-zinc-200 rounded-xl" />
        {/* Details button placeholder */}
        <div className="h-9 w-20 bg-zinc-200 rounded-xl shrink-0" />
      </CardFooter>
    </Card>
  );
}