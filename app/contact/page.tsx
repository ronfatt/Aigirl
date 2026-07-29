import type { Metadata } from "next";
import { EditorialHero } from "@/src/components/layout/EditorialHero";
import { ContactForm } from "@/src/components/forms/ContactForm";
import { Container } from "@/src/components/ui/Container";
import { settings } from "@/src/data/settings";
export const metadata:Metadata={title:"Contact",description:"General, press, editorial, buyer and collaboration enquiries for Batik NXT."};
export default function ContactPage(){return <><EditorialHero title="Contact" intro="Begin a conversation with the studio — for private viewings, editorial, press and considered collaborations."/><section className="bg-ivory pb-28 text-black"><Container><div className="grid gap-16 lg:grid-cols-[.7fr_1.3fr]"><div className="space-y-10"><div><p className="label">General Enquiries</p><a href={`mailto:${settings.email.general}`} className="font-display text-2xl">{settings.email.general}</a></div><div><p className="label">Press & Editorial</p><a href={`mailto:${settings.email.press}`} className="font-display text-2xl">{settings.email.press}</a></div><div><p className="label">Buyers & Collaborations</p><p className="mt-2 text-sm text-black/55">Private appointments and collection previews by enquiry.</p></div><div><p className="label">Studio</p><p className="font-display text-2xl">Malaysia</p></div></div><ContactForm/></div></Container></section></>}
