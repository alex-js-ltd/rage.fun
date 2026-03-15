"use client";

import { cn } from "@/app/utils/misc";
import { NavLink } from "@/app/comps/ui/nav_link";

export function TokenNav({
  searchParams,
}: {
  searchParams: { sortType: string };
}) {
  const { sortType } = searchParams;
  return (
    <div className="scrollbar-hide flex h-full w-full items-center overflow-x-scroll">
      <NavLink
        className={cn(
          "relative flex h-full w-fit flex-1 items-center justify-center px-4 whitespace-nowrap hover:bg-white/10",
        )}
        href={{
          pathname: `/home`,
          query: { sortType: "createdAt" },
        }}
        as={`/home?sortType=createdAt`}
        replace
        prefetch={false}
      >
        {({ isActive }) => (
          <div className="relative flex h-full w-fit items-center">
            <span
              className={cn(
                "text-text-200 text-[15px] font-medium",
                sortType === "createdAt" && "text-white",
              )}
            >
              Created At
            </span>

            <div
              className={cn(
                "absolute right-0 bottom-0 left-0 h-[1px]",
                sortType === "createdAt" && "border-rage-100 rounded border-2",
              )}
            />
          </div>
        )}
      </NavLink>

      <NavLink
        className={cn(
          "relative flex h-full w-fit flex-1 items-center justify-center px-4 whitespace-nowrap hover:bg-white/10",
        )}
        href={{
          pathname: `/home`,
          query: {
            sortType: "lastTrade",
          },
        }}
        as={`/home?sortType=lastTrade`}
        replace
        prefetch={false}
      >
        {({ isActive }) => (
          <div className="relative flex h-full w-fit items-center">
            <span
              className={cn(
                "text-text-200 text-[15px] font-medium",
                sortType === "lastTrade" && "text-white",
              )}
            >
              Last Trade
            </span>

            <div
              className={cn(
                "absolute right-0 bottom-0 left-0 h-[1px]",
                sortType === "lastTrade" && "border-rage-100 rounded border-2",
              )}
            />
          </div>
        )}
      </NavLink>

      <NavLink
        className={cn(
          "relative flex h-full w-fit flex-1 items-center justify-center px-4 whitespace-nowrap hover:bg-white/10",
        )}
        href={{
          pathname: `/home`,
          query: {
            sortType: "marketCap",
          },
        }}
        as={`/home?sortType=marketCap`}
        replace
        prefetch={false}
      >
        {({ isActive }) => (
          <div className="relative flex h-full w-fit items-center">
            <span
              className={cn(
                "text-text-200 text-[15px] font-medium",
                sortType === "marketCap" && "text-white",
              )}
            >
              Market Cap
            </span>

            <div
              className={cn(
                "absolute right-0 bottom-0 left-0 h-[1px]",
                sortType === "marketCap" && "border-rage-100 rounded border-2",
              )}
            />
          </div>
        )}
      </NavLink>
    </div>
  );
}
