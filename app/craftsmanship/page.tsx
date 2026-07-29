import type { Metadata } from "next";
import { EditorialHero } from "@/src/components/layout/EditorialHero";
import { CraftArchive } from "@/src/components/motion/CraftArchive";
export const metadata:Metadata={title:"Craftsmanship",description:"An interactive archive of motif, drawing, fabric, cut and construction."};
export default function CraftsmanshipPage(){return <><EditorialHero dark title="Craftsmanship" intro="Batik is deconstructed, scaled, redrawn and layered until motif becomes garment architecture."/><section className="bg-charcoal text-ivory"><CraftArchive/></section></>}
