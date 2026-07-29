import type { Metadata } from "next";
import { Suspense } from "react";
import { EditorialHero } from "@/src/components/layout/EditorialHero";
import { CollectionsClient } from "@/src/components/collection/CollectionsClient";
import { Container } from "@/src/components/ui/Container";
import { getCollections } from "@/src/lib/repositories/collection-repository";
export const metadata: Metadata = { title: "Collections", description: "A continuing study of batik, form and contemporary identity." };
export default async function CollectionsPage() { const collections = await getCollections(); return <><EditorialHero title="Collections" intro="A continuing study of batik, form and contemporary identity."/><section className="bg-ivory pb-28 text-black"><Container><Suspense><CollectionsClient collections={collections}/></Suspense></Container></section></>; }
