import { Tradu } from "@/components/Tradu";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

export default function Home() {
  return (
    <div className="h-screen bg-background text-foreground p-4 flex flex-col">
      <Tradu />
      <Analytics />
      <SpeedInsights />
    </div>
  );
}
