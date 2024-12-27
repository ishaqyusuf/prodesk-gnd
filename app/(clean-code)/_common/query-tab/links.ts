export const siteLinks = {
    orders: "/sales-book/orders",
    quotes: "/sales-book/quotes",
} as const;
export type SiteLinksPage = keyof typeof siteLinks;
