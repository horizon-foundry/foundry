import { MarkdownDoc } from "@/components/MarkdownDoc";
import { readDoc } from "@/lib/docs";

export const metadata = { title: "Brand" };

export default function BrandDoc() {
  return <MarkdownDoc content={readDoc("BRAND.md")} />;
}
