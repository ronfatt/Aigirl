export const settings = {
  brand: "Batik NXT",
  signature: "Designed by Ronnie",
  location: "Malaysia",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "https://batiknxt.example",
  email: { press: "press@placeholder.com", general: "hello@placeholder.com" },
  locales: ["en", "zh", "ms"] as const,
  defaultLocale: "en" as const,
};
