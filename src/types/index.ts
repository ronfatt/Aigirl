export type SEOData = { title: string; description: string; keywords?: string[]; ogImage?: string };

export type MediaAsset = {
  src: string;
  alt: string;
  width: number;
  height: number;
  aspectRatio: "portrait" | "landscape" | "square" | "wide";
  focalPoint?: { x: number; y: number };
  blurDataURL?: string;
};

export type Collection = {
  id: string;
  slug: string;
  number: string;
  title: string;
  subtitle: string;
  year: number;
  category: "couture" | "ready-to-wear" | "editorial" | "concept";
  description: string;
  story: string[];
  coverImage: MediaAsset;
  heroMedia: { type: "image" | "video"; src: string; poster?: string; alt: string };
  palette: string[];
  materials: string[];
  motifs: string[];
  lookIds: string[];
  featured: boolean;
  status: "published" | "draft";
  seo: SEOData;
};

export type Look = {
  id: string;
  slug: string;
  collectionId: string;
  number: string;
  title: string;
  year: number;
  category: string;
  colour: string[];
  materials: string[];
  motif: string;
  silhouette: string;
  construction: string;
  availability: "concept" | "private-order" | "archive" | "coming-soon";
  designer: string;
  description: string;
  images: MediaAsset[];
  coverImage: MediaAsset;
  featured: boolean;
  seo: SEOData;
};

export type JournalContentBlock =
  | { type: "paragraph"; text: string }
  | { type: "heading"; text: string }
  | { type: "quote"; text: string }
  | { type: "image"; image: MediaAsset };

export type JournalArticle = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: "studio" | "craft" | "collection" | "culture";
  publishedAt: string;
  readingTime: number;
  author: string;
  coverImage: MediaAsset;
  content: JournalContentBlock[];
  relatedArticleIds: string[];
  seo: SEOData;
};

export type SearchResult = { id: string; title: string; eyebrow: string; href: string; terms: string[] };
