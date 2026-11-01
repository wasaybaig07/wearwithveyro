import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

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

export default defineSchema({
  products: defineTable({
    name: v.string(),
    price: v.string(),
    priceValue: v.number(),
    discountPercent: v.optional(v.number()),//here
    description: v.string(),
    category: v.string(),
    badge: v.optional(v.union(v.literal("new"), v.literal("hot"))),
    imageId: v.optional(v.id("_storage")),
    imageSecondaryId: v.optional(v.id("_storage")),
    galleryImageIds: v.optional(v.array(v.id("_storage"))),
    imageUrl: v.optional(v.string()),
    imageSecondaryUrl: v.optional(v.string()),
    stock: v.number(),
    sizes: v.array(v.string()),
    status: v.union(v.literal("active"), v.literal("draft"), v.literal("soldout")),
    inventoryPercent: v.optional(v.number()),
    slug: v.string(),
    sizeChart: v.optional(
      v.object({
        headers: v.array(v.string()),
        rows: v.array(sizeChartRow),
      })
    ),
    colorVariants: v.optional(v.array(colorVariant)),
    videoUrl: v.optional(v.string()),
  })
    .index("by_category", ["category"])
    .index("by_slug", ["slug"]),

  orders: defineTable({
    orderId: v.string(),
    status: v.union(v.literal("pending"), v.literal("confirmed"), v.literal("shipped"), v.literal("delivered")),
    total: v.number(),
    items: v.array(
      v.object({
        productId: v.id("products"),
        name: v.string(),
        price: v.string(),
        quantity: v.number(),
        size: v.optional(v.string()),
        imageId: v.optional(v.id("_storage")),
      })
    ),
    customerName: v.string(),
    customerEmail: v.optional(v.string()),
    customerPhone: v.optional(v.string()),
    address: v.optional(v.string()),
    city: v.optional(v.string()),
    postalCode: v.optional(v.string()),
    userId: v.optional(v.string()),
    date: v.number(),
    paymentMethod: v.optional(v.string()),
    courierConsignmentId: v.optional(v.string()),
    courierSlipUrl: v.optional(v.string()),
    courierBookedAt: v.optional(v.number()),
    courierStatus: v.optional(v.string()),
    courierStatusDetail: v.optional(v.string()),
    courierStatusAt: v.optional(v.number()),
    courierError: v.optional(v.string()),
  })
    .index("by_orderId", ["orderId"])
    .index("by_userId", ["userId"]),

  customers: defineTable({
    name: v.string(),
    email: v.string(),
    userId: v.optional(v.string()),
    totalSpent: v.number(),
    lastOrderDate: v.number(),
  }).index("by_email", ["email"]),

  users: defineTable({
    name: v.string(),
    email: v.string(),
    clerkId: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_email", ["email"]),

  carts: defineTable({
    userId: v.string(),
    items: v.array(
      v.object({
        productId: v.id("products"),
        name: v.string(),
        price: v.string(),
        priceValue: v.number(),
        imageUrl: v.string(),
        quantity: v.number(),
        size: v.optional(v.string()),
      })
    ),
  }).index("by_userId", ["userId"]),

  reviews: defineTable({
    productId: v.id("products"),
    userId: v.string(),
    orderId: v.id("orders"),
    rating: v.number(),
    comment: v.string(),
    title: v.optional(v.string()),
    userName: v.optional(v.string()),
    imageStorageId: v.optional(v.id("_storage")),
    createdAt: v.number(),
  })
    .index("by_productId", ["productId"])
    .index("by_userId", ["userId"])
    .index("by_orderId", ["orderId"])
    .index("by_productId_userId", ["productId", "userId"]),
});
