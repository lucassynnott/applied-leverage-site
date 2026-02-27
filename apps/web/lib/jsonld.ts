import type { PostMeta } from "./posts";
import { SITE_URL, SITE_NAME, AUTHOR } from "./constants";

export function blogPostingJsonLd(meta: PostMeta) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: meta.title,
    description: meta.description,
    datePublished: meta.date,
    dateModified: meta.date,
    url: `${SITE_URL}/${meta.slug}`,
    author: {
      "@type": "Person",
      name: AUTHOR.name,
      url: AUTHOR.url,
    },
    publisher: {
      "@type": "Person",
      name: AUTHOR.name,
      url: AUTHOR.url,
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${SITE_URL}/${meta.slug}`,
    },
    isPartOf: {
      "@type": "Blog",
      name: SITE_NAME,
      url: SITE_URL,
    },
  };
}

export function blogJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: SITE_NAME,
    description:
      "AI-powered agency operations. Building autonomous agent systems for the creator economy.",
    url: SITE_URL,
    author: {
      "@type": "Person",
      name: AUTHOR.name,
      url: AUTHOR.url,
    },
  };
}

export function personJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: AUTHOR.name,
    url: AUTHOR.url,
    sameAs: ["https://github.com/lucassynnott", "https://twitter.com/LucasSynnott"],
  };
}

export function breadcrumbJsonLd(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}
