import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const sizeChartRow = v.object({
  size: v.string(),
  measurements: v.record(v.string(), v.string()),
});

const colorVariant = v.object({
  name: v.string(),
  hex: v.optional(v.string()),
  imageId: v.id("_storage"),
  imageSecondaryId: v.optional(v.id("_storage")),
});

export const createProduct = mutation({
  args: {
    name: v.string(),
    slug: v.string(),
    price: v.string(),
    priceValue: v.number(),
    discountPercent: v.optional(v.number()),
    description: v.string(),
    category: v.string(),
    badge: v.optional(v.union(v.literal("new"), v.literal("hot"))),
    imageId: v.id("_storage"),
    imageSecondaryId: v.optional(v.id("_storage")),
    galleryImageIds: v.optional(v.array(v.id("_storage"))),
    stock: v.number(),
    sizes: v.array(v.string()),
    status: v.union(v.literal("active"), v.literal("draft"), v.literal("soldout")),
    inventoryPercent: v.optional(v.number()),
    sizeChart: v.optional(
      v.object({
        headers: v.array(v.string()),
        rows: v.array(sizeChartRow),
      })
    ),
    colorVariants: v.optional(v.array(colorVariant)),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("products", args);
  },
});

export const getProducts = query({
  args: {
    category: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (args.category && args.category !== "ALL") {
      return await ctx.db
        .query("products")
        .withIndex("by_category", (q) => q.eq("category", args.category!))
        .filter((q) => q.neq(q.field("status"), "draft"))
        .collect();
    }
    return await ctx.db
      .query("products")
      .filter((q) => q.neq(q.field("status"), "draft"))
      .collect();
  },
});

export const getProductBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const normalized = args.slug.toLowerCase().trim();

    const all = await ctx.db.query("products").collect();

    const match = all.find((p) => {
      const pSlug = p.slug;
      if (typeof pSlug !== "string") return false;
      return pSlug.toLowerCase().trim() === normalized;
    });
    if (match) return match;

    return null;
  },
});

export const listProductSlugs = query({
  args: {},
  handler: async (ctx) => {
    const products = await ctx.db.query("products").collect();
    return products.map((p) => ({
      _id: p._id,
      name: p.name,
      slug: p.slug ?? null,
    }));
  },
});

export const listProducts = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("products").collect();
  },
});

export const patchMissingSlugs = mutation({
  args: {},
  handler: async (ctx) => {
    const products = await ctx.db.query("products").collect();
    let patched = 0;
    for (const p of products) {
      if (!p.slug) {
        const slug = toSlug(p.name);
        await ctx.db.patch(p._id, { slug });
        patched++;
      }
    }
    return { patched };
  },
});

export const deleteProduct = mutation({
  args: { id: v.id("products") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

export const updateProduct = mutation({
  args: {
    id: v.id("products"),
    fields: v.object({
      name: v.optional(v.string()),
      slug: v.optional(v.string()),
      price: v.optional(v.string()),
      priceValue: v.optional(v.number()),
      discountPercent: v.optional(v.number()),
      description: v.optional(v.string()),
      category: v.optional(v.string()),
      badge: v.optional(v.union(v.literal("new"), v.literal("hot"))),
      imageId: v.optional(v.id("_storage")),
      imageSecondaryId: v.optional(v.id("_storage")),
      galleryImageIds: v.optional(v.array(v.id("_storage"))),
      stock: v.optional(v.number()),
      sizes: v.optional(v.array(v.string())),
      status: v.optional(v.union(v.literal("active"), v.literal("draft"), v.literal("soldout"))),
      inventoryPercent: v.optional(v.number()),
      sizeChart: v.optional(
        v.object({
          headers: v.array(v.string()),
          rows: v.array(sizeChartRow),
        })
      ),
      colorVariants: v.optional(v.array(colorVariant)),
    }),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, args.fields);
  },
});
