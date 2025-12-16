import React from "react";
import { HomepageHeader } from "./homepage-header";
import { HydrateClient } from "@/trpc/server";

function HomepageLayout({ children }: { children: React.ReactNode }) {
  return (
    <HydrateClient>
      <HomepageHeader />
      <main>{children}</main>
    </HydrateClient>
  );
}

export { HomepageLayout };
