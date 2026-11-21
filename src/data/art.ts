export interface Artwork {
  id: string;
  fig: string;
  index: number;
  title: string;
  year: string;
  medium: string;
  alt: string;
  src: string;
  srcSet: string;
  sizes: string;
  full: string;
  ratio: string;
  gridClass: string;
  zClass: string;
  shadow: "dark" | "accent" | "ochre";
  parallax: number;
  collideX?: string;
  rotate?: string;
  scale?: string;
}

export interface ArtSpread {
  id: string;
  number: string;
  title: string;
  theme: "paper" | "ink";
  ghost: string;
  items: Artwork[];
}

const showcase = (slug: string, sizes: string) => ({
  src: `/art/showcase/${slug}.webp`,
  srcSet: `/art/showcase/${slug}-sm.webp 800w, /art/showcase/${slug}.webp 1600w`,
  sizes,
  full: `/art/showcase/${slug}-full.webp`,
});

const SIZES_5COL = "(min-width: 1560px) 630px, (min-width: 768px) 42vw, 75vw";
const SIZES_7COL = "(min-width: 1560px) 880px, (min-width: 768px) 58vw, 92vw";
const SIZES_8COL = "(min-width: 1560px) 1000px, (min-width: 768px) 66vw, 92vw";
const SIZES_9COL = "(min-width: 1560px) 1130px, (min-width: 768px) 75vw, 96vw";

export const spreads: ArtSpread[] = [
  {
    id: "spread-01",
    number: "SPREAD 01",
    title: "MONSTERS & EMPIRE",
    theme: "paper",
    ghost: "EMPIRE",
    items: [
      {
        id: "a01",
        fig: "01",
        index: 0,
        title: "Havatea at Beach",
        year: "2026",
        medium: "Digital painting",
        alt: "Stranded toothy sea leviathan on rocky shore under a stormy sky with crows",
        ...showcase("havatea-at-beach", SIZES_8COL),
        ratio: "16 / 9",
        gridClass: "col-span-11 col-start-1 md:col-span-8 md:col-start-1",
        zClass: "z-10",
        shadow: "dark",
        parallax: 4,
        collideX: "-3,3",
      },
      {
        id: "a02",
        fig: "02",
        index: 1,
        title: "Empire Girl",
        year: "2026",
        medium: "Digital painting",
        alt: "Portrait of a seated figure in draped crimson and cream tunic with gold cuffs",
        ...showcase("empire-girl", SIZES_5COL),
        ratio: "3 / 4",
        gridClass: "col-span-9 col-start-4 mt-6 sm:-mt-16 md:col-span-5 md:col-start-8 md:-mt-52 lg:-mt-72",
        zClass: "z-20",
        shadow: "accent",
        parallax: -8,
        collideX: "5,-4",
        rotate: "2,-1.5",
      },
      {
        id: "a03",
        fig: "03",
        index: 2,
        title: "Courtyard Light",
        year: "2025",
        medium: "Digital painting",
        alt: "Sun-striped alleyway courtyard with dark metal stairs and archway",
        ...showcase("courtyard-light", SIZES_5COL),
        ratio: "3 / 4",
        gridClass: "col-span-9 col-start-1 mt-6 sm:-mt-20 md:col-span-5 md:col-start-2 md:-mt-64 lg:-mt-96",
        zClass: "z-20",
        shadow: "dark",
        parallax: -5,
        collideX: "-4,4",
        rotate: "-2,1.5",
      },
      {
        id: "a04",
        fig: "04",
        index: 3,
        title: "Fog Railway",
        year: "2025",
        medium: "Digital painting",
        alt: "Elevated wooden trestle structures in heavy fog with a colossal cat silhouette in the mist",
        ...showcase("fog-railway", SIZES_7COL),
        ratio: "4 / 3",
        gridClass: "col-span-11 col-start-2 mt-6 sm:-mt-16 md:col-span-7 md:col-start-5 md:-mt-48 lg:-mt-64",
        zClass: "z-30",
        shadow: "accent",
        parallax: -8,
        collideX: "4,-4",
        rotate: "1,-1",
      },
    ],
  },
  {
    id: "spread-02",
    number: "SPREAD 02",
    title: "STEEL & ABYSS",
    theme: "ink",
    ghost: "ABYSS",
    items: [
      {
        id: "a05",
        fig: "05",
        index: 4,
        title: "Dune Leviathan",
        year: "2025",
        medium: "Digital painting",
        alt: "Lone figure facing a colossal segmented worm emerging from desert sand",
        ...showcase("dune-leviathan", SIZES_9COL),
        ratio: "2.39 / 1",
        gridClass: "col-span-12 col-start-1 md:col-span-9 md:col-start-1",
        zClass: "z-10",
        shadow: "ochre",
        parallax: 4,
        collideX: "-3,3",
      },
      {
        id: "a06",
        fig: "06",
        index: 5,
        title: "Iron Knight",
        year: "2025",
        medium: "Digital painting",
        alt: "Armored knight portrait with sunlit highlights against pale blue sky",
        ...showcase("iron-knight", SIZES_5COL),
        ratio: "3 / 4",
        gridClass: "col-span-9 col-start-4 mt-6 sm:-mt-14 md:col-span-5 md:col-start-8 md:-mt-44 lg:-mt-60",
        zClass: "z-20",
        shadow: "accent",
        parallax: -8,
        collideX: "5,-4",
        rotate: "2,-1.5",
      },
      {
        id: "a07",
        fig: "07",
        index: 6,
        title: "Orbital Drift",
        year: "2024",
        medium: "Digital painting",
        alt: "Textured brushstrokes painting an astronaut floating above a curved planet horizon",
        ...showcase("orbital-drift", SIZES_5COL),
        ratio: "0.73 / 1",
        gridClass: "col-span-9 col-start-1 mt-6 sm:-mt-20 md:col-span-5 md:col-start-2 md:-mt-64 lg:-mt-96",
        zClass: "z-20",
        shadow: "ochre",
        parallax: -6,
        collideX: "-5,4",
        rotate: "-2,1.5",
      },
      {
        id: "a08",
        fig: "08",
        index: 7,
        title: "Big Luma Buzul",
        year: "2026",
        medium: "Digital painting",
        alt: "Colossal sea creature lunging through whitecaps beside a tiny white sailboat",
        ...showcase("big-luma-buzul", SIZES_8COL),
        ratio: "16 / 9",
        gridClass: "col-span-11 col-start-2 mt-6 sm:-mt-16 md:col-span-8 md:col-start-4 md:-mt-48 lg:-mt-64",
        zClass: "z-30",
        shadow: "accent",
        parallax: -8,
        collideX: "5,-4",
        rotate: "-1,1.5",
      },
    ],
  },
];

export const allArt: Artwork[] = spreads.flatMap((s) => s.items);
