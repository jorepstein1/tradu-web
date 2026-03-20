import { Tradu } from "@/components/Tradu";
import { Analytics } from "@vercel/analytics/next";
export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground p-4">
      <Tradu />
      <Analytics />
    </div>
  );
}
