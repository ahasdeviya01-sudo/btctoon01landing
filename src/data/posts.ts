/**
 * ── Modular Posts Registry ──
 *
 * HOW TO ADD A NEW POST:
 * 1. Drop your image into  public/posts/  (e.g. post-2026-04-02.png)
 * 2. Add an entry to the POSTS array below (newest FIRST).
 * 3. That's it — the site picks it up automatically.
 *
 * The first FEATURED_COUNT posts show prominently on the page.
 * Older posts collapse into a "See More" section.
 */

export interface Post {
  /** Unique slug — also used in the URL */
  id: string;
  /** ISO date string YYYY-MM-DD (used for sorting & display) */
  date: string;
  /** Headline */
  title: string;
  /** Short description / caption */
  description: string;
  /** Path relative to public/ — e.g. '/posts/post-2026-04-01.png' */
  image: string;
  /** Hashtags */
  tags: string[];
  /** Optional alt text for the image (SEO) */
  alt?: string;
}

/** Number of posts shown above the fold before "See More" */
export const FEATURED_COUNT = 3;

/**
 * ╔════════════════════════════════════════════════╗
 * ║  ADD NEW POSTS HERE  (newest first)           ║
 * ╚════════════════════════════════════════════════╝
 */
export const POSTS: Post[] = [
  {
    id: 'btc-battle-2026-04-01',
    date: '2026-04-01',
    title: 'April Fools\' Day Bull Trap',
    description: 'Bulls charged hard at the open only to get rugged by a classic April 1st fakeout. Bears dancing.',
    image: '/posts/post-2026-04-01.png',
    tags: ['#Bitcoin', '#AprilFools', '#BullTrap', '#BTC'],
    alt: 'Bitcoin bulls vs bears April 1 2026 battle cartoon',
  },
  {
    id: 'eth-dump-2026-03-31',
    date: '2026-03-31',
    title: 'End-of-Quarter Liquidation Storm',
    description: 'Massive sell-off as Q1 closes. Bears dominate the battlefield with relentless waves.',
    image: '/posts/post-2026-03-31.png',
    tags: ['#Ethereum', '#Liquidation', '#BearMarket', '#Q1'],
    alt: 'Crypto market liquidation battle cartoon March 2026',
  },
  {
    id: 'classic-battle-01',
    date: '2026-03-30',
    title: 'The OG Battleground',
    description: 'Where it all started — the original BTC vs Bears showdown that launched btctoon.com.',
    image: '/posts/post-classic-01.jpg',
    tags: ['#BTC', '#OG', '#Battleground', '#Classic'],
    alt: 'Original btctoon.com crypto battleground illustration',
  },
];
