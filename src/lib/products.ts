export type Category = "men" | "women" | "kids";

export type Product = {
  slug: string;
  name: string;
  price: number;
  category: Category;
  sizes: string[];
  description: string;
  tag?: string;
};

export const CATEGORY_LABELS: Record<Category, string> = {
  men: "Men",
  women: "Women",
  kids: "Kids",
};

export const CATEGORIES: Category[] = ["men", "women", "kids"];

export const SEED_PRODUCTS: Product[] = [
  {
    slug: "blackout-04",
    name: "Blackout 04",
    price: 128,
    category: "men",
    sizes: ["8", "9", "10", "10.5", "11", "12"],
    description:
      "Low-profile street runner in triple black. Reinforced toe cap, gum outsole for grip on concrete.",
    tag: "New drop",
  },
  {
    slug: "curb-runner",
    name: "Curb Runner",
    price: 152,
    category: "men",
    sizes: ["8", "9", "10", "11", "12", "13"],
    description:
      "Chunky retro trainer built for daily rotation. Breathable mesh upper with molded overlays.",
  },
  {
    slug: "deep-freeze",
    name: "Deep Freeze",
    price: 135,
    category: "men",
    sizes: ["9", "10", "10.5", "11", "12"],
    description:
      "Ice-cold colorway on a cushioned foam midsole. Built for cold-weather drops.",
    tag: "New drop",
  },
  {
    slug: "vector-pace",
    name: "Vector Pace",
    price: 106,
    category: "women",
    sizes: ["5", "6", "7", "8", "9", "10"],
    description:
      "Reactive foam trainer with zoned traction for zero drag on hard corners.",
  },
  {
    slug: "kinetic-zero",
    name: "Kinetic Zero",
    price: 172,
    category: "women",
    sizes: ["5", "6", "7", "8", "9"],
    description:
      "Performance silhouette tuned for the next split second. Locked-in heel counter.",
    tag: "New drop",
  },
  {
    slug: "frame-runner",
    name: "Frame Runner",
    price: 104,
    category: "women",
    sizes: ["5", "6", "7", "8", "9", "10"],
    description:
      "Everyday trainer with a structured cage overlay and responsive midsole.",
  },
  {
    slug: "bounce-hi",
    name: "Bounce Hi",
    price: 98,
    category: "kids",
    sizes: ["1Y", "2Y", "3Y", "4Y", "5Y", "6Y"],
    description:
      "High-top kids sneaker with extra ankle support and easy strap closure.",
  },
  {
    slug: "cloud-skip",
    name: "Cloud Skip",
    price: 84,
    category: "kids",
    sizes: ["10K", "11K", "12K", "13K", "1Y", "2Y"],
    description: "Lightweight slip-on built for the playground, machine washable.",
  },
  {
    slug: "zesty-low",
    name: "Zesty Low",
    price: 92,
    category: "kids",
    sizes: ["1Y", "2Y", "3Y", "4Y", "5Y"],
    description:
      "Bright low-top with grippy outsole tread, built to survive recess.",
    tag: "New drop",
  },
];

export function getProductsByCategory(products: Product[], category: Category) {
  return products.filter((p) => p.category === category);
}

export function getProductBySlug(products: Product[], slug: string) {
  return products.find((p) => p.slug === slug);
}

export function slugify(name: string) {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function uniqueSlug(products: Product[], name: string, ignoreSlug?: string) {
  const base = slugify(name) || "product";
  let candidate = base;
  let n = 2;
  while (products.some((p) => p.slug === candidate && p.slug !== ignoreSlug)) {
    candidate = `${base}-${n}`;
    n += 1;
  }
  return candidate;
}
