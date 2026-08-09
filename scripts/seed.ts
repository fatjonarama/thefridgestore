import "dotenv/config";
import { readFileSync } from "node:fs";
import { parse } from "csv-parse/sync";
import { db } from "../src/db";
import { products } from "../src/db/schema";
import { slugify } from "../src/lib/slugify";
import { eurosToCents } from "../src/lib/format";
import { isAudience } from "../src/lib/audience";

type CsvRow = {
  name: string;
  audience: string;
  price: string;
  compareAt?: string;
  description?: string;
  images?: string;
  colors?: string;
  sizes: string;
  stock?: string;
  isNew?: string;
  active?: string;
};

function splitList(value: string | undefined) {
  if (!value) return [];
  return value
    .split("|")
    .map((v) => v.trim())
    .filter(Boolean);
}

function parseBool(value: string | undefined, fallback: boolean) {
  if (value === undefined || value === "") return fallback;
  return ["true", "1", "yes", "y"].includes(value.trim().toLowerCase());
}

async function main() {
  const filePath = process.argv[2] ?? "./products.csv";
  console.log(`Reading ${filePath}…`);

  let raw: string;
  try {
    raw = readFileSync(filePath, "utf-8");
  } catch {
    console.error(`Could not read ${filePath}.`);
    console.error(`Usage: npm run seed -- path/to/products.csv`);
    process.exit(1);
  }

  const rows: CsvRow[] = parse(raw, { columns: true, skip_empty_lines: true, trim: true });

  if (rows.length === 0) {
    console.log("No rows found in CSV.");
    return;
  }

  const existingRows = await db.select({ slug: products.slug }).from(products);
  const existingSlugs = new Set(existingRows.map((r) => r.slug));

  const usedSlugs = new Set<string>();
  let created = 0;
  let updated = 0;

  for (const row of rows) {
    if (!row.name || !row.audience || !row.price || !row.sizes) {
      console.warn(`Skipping row (missing required field): ${JSON.stringify(row)}`);
      continue;
    }
    if (!isAudience(row.audience.trim().toLowerCase())) {
      console.warn(`Skipping "${row.name}": invalid audience "${row.audience}" (expected men/women)`);
      continue;
    }

    let slug = slugify(row.name);
    let n = 2;
    while (usedSlugs.has(slug)) {
      slug = `${slugify(row.name)}-${n}`;
      n += 1;
    }
    usedSlugs.add(slug);

    const values = {
      slug,
      name: row.name.trim(),
      audience: row.audience.trim().toLowerCase() as "men" | "women" | "kids",
      category: "",
      subcategory: null,
      priceCents: eurosToCents(row.price),
      compareAtCents: row.compareAt ? eurosToCents(row.compareAt) : null,
      description: row.description?.trim() ?? "",
      images: splitList(row.images),
      colors: splitList(row.colors),
      sizes: splitList(row.sizes),
      stock: row.stock ? Number(row.stock) : 0,
      isNew: parseBool(row.isNew, false),
      active: parseBool(row.active, true),
    };

    const isUpdate = existingSlugs.has(slug);

    await db
      .insert(products)
      .values(values)
      .onConflictDoUpdate({ target: products.slug, set: values });

    if (isUpdate) updated += 1;
    else created += 1;
  }

  console.log(`Done. Created ${created}, updated ${updated}, skipped ${rows.length - created - updated}.`);
}

main().then(
  () => process.exit(0),
  (err) => {
    console.error(err);
    process.exit(1);
  },
);
