import { NewsletterForm } from "@/src/components/forms/NewsletterForm";
import { Container } from "@/src/components/ui/Container";
import { content } from "@/src/content/en";
export function NewsletterSection() { return <section className="bg-deep-red py-24 text-ivory sm:py-32"><Container><div className="grid gap-12 lg:grid-cols-[1fr_.8fr] lg:items-end"><h2 className="max-w-4xl font-display text-[clamp(4rem,9vw,9rem)] uppercase leading-[.78] tracking-[-.05em]">{content.newsletter.title}</h2><div><p className="mb-9 max-w-md text-sm leading-6 text-white/65">{content.newsletter.body}</p><NewsletterForm/></div></div></Container></section>; }
