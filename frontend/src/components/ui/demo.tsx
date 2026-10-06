"use client";

import { InfiniteRibbon } from "@/components/ui/infinite-ribbon";

export function InfiniteRibbonPreview() {
  return (
    <>
      <InfiniteRibbon className="absolute" duration={42} rotation={5}>
        Craft crisp dashboards, lively landing pages, and polished product flows
        with components that feel ready from the first click.
      </InfiniteRibbon>
      <InfiniteRibbon duration={42} reverse={true} rotation={-5}>
        Craft crisp dashboards, lively landing pages, and polished product flows
        with components that feel ready from the first click.
      </InfiniteRibbon>
    </>
  );
}

export default InfiniteRibbonPreview;
