import { BehindDoc } from "@/components/BehindDoc";
import { readDoc } from "@/lib/docs";

export const metadata = { title: "Brand" };

export default function BrandDoc() {
  return <BehindDoc content={readDoc("BRAND.md")} />;
}
