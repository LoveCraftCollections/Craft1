import { WeddingSite } from "@/components/invitation";
import { demoWedding } from "@/lib/wedding";

export default function HomePage() {
  return <WeddingSite wedding={demoWedding} />;
}