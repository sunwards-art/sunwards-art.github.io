export interface Project {
  id: string;
  num: string;
  title: string;
  category: string;
  status: string;
  hook: string;
  href?: string;
  comingSoon?: boolean;
  accent: "accent" | "ochre" | "mint";
  /**
   * Uploaded project images ordered from bottom-most layer to top cover layer.
   * On hover in the isometric grid, all layers lift straight up in 3D Z-space.
   */
  layers: string[];
  /**
   * Optional animated WebP sources swapped in only on hover so scrolling stays 60fps.
   */
  animatedLayers?: string[];
}

export const projects: Project[] = [
  {
    id: "visual-index",
    num: "01",
    title: "The Visual Index",
    category: "Discord Community",
    status: "JOIN SERVER ↗",
    hook: "A community-based Discord server focused on gathering curated reference for art.",
    href: "https://discord.gg/mXDcXXAfQ",
    accent: "accent",
    layers: [
      "/projects/visual-index-3-static.webp",
      "/projects/visual-index-2-static.webp",
      "/projects/visual-index-1-static.webp",
    ],
    animatedLayers: [
      "/projects/visual-index-3.webp",
      "/projects/visual-index-2.webp",
      "/projects/visual-index-1.webp",
    ],
  },
  {
    id: "pindrop-board",
    num: "02",
    title: "Pindrop Board",
    category: "Desktop App",
    status: "ITCH.IO ↗",
    hook: "A skeuomorphic app for organizing images, tactile boards, and art references.",
    href: "https://sunward-software.itch.io/pindrop-board-app",
    accent: "ochre",
    layers: [
      "/projects/pindrop-1.webp",
      "/projects/pindrop-3.webp",
      "/projects/pindrop-2.webp",
    ],
  },
  {
    id: "starling-exe",
    num: "03",
    title: "Starling.exe",
    category: "Indie Game",
    status: "COMING SOON",
    hook: "A horde incremental shooter game wrapped in a curved CRT dungeon.",
    comingSoon: true,
    accent: "accent",
    layers: [
      "/projects/starling-3.webp",
      "/projects/starling-2.webp",
      "/projects/starling-1.webp",
    ],
  },
  {
    id: "godup-modeler",
    num: "04",
    title: "Godup Modeler",
    category: "3D Tool · Godot",
    status: "COMING SOON",
    hook: "An easy, direct push-pull 3D modeler built specifically for Godot.",
    comingSoon: true,
    accent: "mint",
    layers: [
      "/projects/godup-3.webp",
      "/projects/godup-2.webp",
      "/projects/godup-1.webp",
    ],
  },
  {
    id: "catle-herdin",
    num: "05",
    title: "Cat'le Herdin'",
    category: "GMTK Game Jam",
    status: "PLAY ON ITCH.IO ↗",
    hook: "A Wild West game jam game that I painted most of the pixel art sprites for.",
    href: "https://droei.itch.io/catle-herdin",
    accent: "ochre",
    layers: [
      "/projects/catle-2.webp",
      "/projects/catle-1.webp",
    ],
  },
  {
    id: "were-you-ever-free",
    num: "06",
    title: "Were You Ever Free? (GameJam version)",
    category: "First Game · Jam",
    status: "PLAY ON ITCH.IO ↗",
    hook: "The first game I ever made after a single week of learning how to code.",
    href: "https://cisnerosshanti.itch.io/were-you-ever-free-gj",
    accent: "accent",
    layers: [
      "/projects/free-3.webp",
      "/projects/free-2.webp",
      "/projects/free-1.webp",
    ],
  },
];
