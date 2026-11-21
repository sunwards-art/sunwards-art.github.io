import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const book = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/book" }),
  schema: z.object({
    chapter: z.number(),
    roman: z.string().optional(),
    title: z.string(),
    subtitle: z.string().optional(),
    synopsis: z.string(),
    readingTime: z.string().optional(),
    initialTheme: z.enum(["bone", "dusk", "ash", "void"]).default("bone"),
    coverArt: z.string().optional(),
    coverCaption: z.string().optional(),
    epigraph: z.string().optional(),
    epigraphAuthor: z.string().optional(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { book };
