import { readFileSync, writeFileSync } from "node:fs";
import { parse } from "csv-parse/sync";
import { slugify } from "../src/lib/slugify";
import { dollarsToCents } from "../src/lib/format";
import { isAudience } from "../src/lib/audience";

type CsvRow = {
  name: string;
  audience: string;
  category: string;
  subcategory?: string;
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
  return value.split("|").map((v) => v.trim()).filter(Boolean);
}

function parseBool(value: string | undefined, fallback: boolean) {
  if (value === undefined || value === "") return fallback;
  return ["true", "1", "yes", "y"].includes(value.trim().toLowerCase());
}

function sqlString(value: string) {
  return `'${value.replace(/'/g, "''")}'`;
}

function sqlArray(values: string[]) {
  if (values.length === 0) return "'{}'";
  const escaped = values.map((v) => v.replace(/"/g, '\\"'));
  return `'{${escaped.map((v) => `"${v}"`).join(",")}}'`;
}

const filePath = process.argv[2] ?? "./products.sample.csv";
const raw = readFileSync(filePath, "utf-8");
const rows: CsvRow[] = parse(raw, { columns: true, skip_empty_lines: true, trim: true });

const usedSlugs = new Set<string>();
const values: string[] = [];

for (const row of rows) {
  if (!row.name || !row.audience || !row.category || !row.price || !row.sizes) continue;
  if (!isAudience(row.audience.trim().toLowerCase())) continue;

  let slug = slugify(row.name);
  let n = 2;
  while (usedSlugs.has(slug)) {
    slug = `${slugify(row.name)}-${n}`;
    n += 1;
  }
  usedSlugs.add(slug);

  const priceCents = dollarsToCents(row.price);
  const compareAtCents = row.compareAt ? dollarsToCents(row.compareAt) : null;
  const description = row.description?.trim() ?? "";
  const images = splitList(row.images);
  const colors = splitList(row.colors);
  const sizes = splitList(row.sizes);
  const stock = row.stock ? Number(row.stock) : 0;
  const isNew = parseBool(row.isNew, false);
  const active = parseBool(row.active, true);

  values.push(
    `(${sqlString(slug)}, ${sqlString(row.name.trim())}, ${sqlString(row.category.trim())}, ` +
      `${row.subcategory?.trim() ? sqlString(row.subcategory.trim()) : "NULL"}, ` +
      `${sqlString(row.audience.trim().toLowerCase())}, ${priceCents}, ` +
      `${compareAtCents ?? "NULL"}, ${sqlString(description)}, ${sqlArray(images)}, ` +
      `${sqlArray(colors)}, ${sqlArray(sizes)}, ${stock}, ${isNew}, ${active})`,
  );
}

const sql =
  `INSERT INTO "products" ("slug", "name", "category", "subcategory", "audience", ` +
  `"price_cents", "compare_at_cents", "description", "images", "colors", "sizes", ` +
  `"stock", "is_new", "active")\nVALUES\n  ${values.join(",\n  ")}\n` +
  `ON CONFLICT ("slug") DO NOTHING;\n`;

writeFileSync("seed-output.sql", sql);
console.log(`Wrote seed-output.sql with ${values.length} products.`);
