import type { ReactNode } from "react";
import { SiteFooter } from "@/src/components/marketing/site-footer";
import { SiteHeader } from "@/src/components/marketing/site-header";

type MarketingShellProps = {
  children: ReactNode;
};

export function MarketingShell({ children }: MarketingShellProps) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#2563eb_0%,#0f172a_36%,#020617_76%)] text-white">
      <SiteHeader />
      <div className="relative">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.04),transparent_24%)]" />
        <div className="relative">{children}</div>
      </div>
      <SiteFooter />
    </div>
  );
}
