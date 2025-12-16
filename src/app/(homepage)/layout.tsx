import React from "react";
import { HomepageLayout } from "@/components/layout/homepage-layout/homepage-layout";

function HomeLayout({ children }: { children: React.ReactNode }) {
  return <HomepageLayout>{children}</HomepageLayout>;
}

export default HomeLayout;
