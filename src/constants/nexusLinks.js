/**
 * NEXUS sidebar shortcuts — external EHFC staff tool launcher.
 * Edit `NEXUS_LINKS` to add, remove, reorder, or change URLs; nav reads from here.
 */

export const NEXUS_LINKS = [
  {
    id: "ehfc-admin",
    title: "EHFC Admin Panel",
    href: "https://admin.ehfc.us",
    external: true,
    newTab: true,
    description: "EHFC internal admin portal.",
  },
  {
    id: "m365-admin",
    title: "Microsoft 365 Admin Center",
    href: "https://admin.microsoft.com/",
    external: true,
    newTab: true,
    description: "Microsoft 365 partner/admin center.",
  },
  {
    id: "ninjaone",
    title: "NinjaOne",
    href: "https://www.ninjaone.com/login/",
    external: true,
    newTab: true,
    description: "NinjaOne RMM login.",
  },
  {
    id: "huntress",
    title: "Huntress",
    href: "https://huntress.io/sso",
    external: true,
    newTab: true,
    description: "Huntress security platform SSO.",
  },
  {
    id: "cloudflare",
    title: "Cloudflare Dashboard",
    href: "https://dash.cloudflare.com/",
    external: true,
    newTab: true,
    description: "Cloudflare dashboard.",
  },
  {
    id: "datto-partner",
    title: "Datto Partner Portal",
    href: "https://auth.datto.com/login",
    external: true,
    newTab: true,
    description: "Datto partner authentication.",
  },
  {
    id: "pax8",
    title: "Pax8 Marketplace",
    href: "https://web.pax8.com/",
    external: true,
    newTab: true,
    description: "Pax8 cloud marketplace.",
  },
];

/** Same visibility as the main AXIOM (`PRODUCT_NAME`) settings section. */
const NEXUS_ITEM_PERMISSIONS = ["CIPP.*"];

/**
 * Maps `NEXUS_LINKS` into sidebar menu leaf items (`path` is the href used by nav).
 */
export function getNexusNavChildItems() {
  return NEXUS_LINKS.map((link) => ({
    title: link.title,
    path: link.href,
    external: link.external === true,
    permissions: NEXUS_ITEM_PERMISSIONS,
    scope: "global",
  }));
}
