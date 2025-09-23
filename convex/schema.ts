import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
  ...authTables,
  files: defineTable({
    pages: v.array(
      v.object({
        id: v.string(),
        name: v.string(),
        zoom: v.object({
          pointer: v.object({
            x: v.number(),
            y: v.number(),
          }),
          delta: v.object({
            x: v.number(),
            y: v.number(),
          }),
          value: v.number(),
        }),
        backgroundColor: v.object({
          hex: v.string(),
          rgba: v.string(),
          alpha: v.number(),
        }),
        // Allow arbitrary object shapes for canvas objects
        objects: v.array(v.record(v.string(), v.any())),
      })
    ),
    name: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
    userId: v.id("users"),
  }),
  //   users: defineTable({
  //     name: v.optional(v.string()),
  //     image: v.optional(v.string()),
  //     email: v.optional(v.string()),
  //   }).index("email", ["email"]),
});
