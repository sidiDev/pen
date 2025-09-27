import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const viewer = query({
  args: {},
  handler: async (ctx) => {
    console.log("Files");

    return null;
  },
});

export const createFile = mutation({
  args: {
    file: v.object({
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
          objects: v.array(v.record(v.string(), v.any())),
        })
      ),
      name: v.string(),
      createdAt: v.number(),
      updatedAt: v.number(),
      userId: v.id("users"),
    }),
  },
  handler: async (ctx, args) => {
    const fileId = await ctx.db.insert("files", { ...args.file });
    return fileId;
  },
});

export const updateFile = mutation({
  args: {
    fileId: v.id("files"),
    file: v.object({
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
          objects: v.array(v.record(v.string(), v.any())),
        })
      ),
      updatedAt: v.number(),
    }),
  },
  handler: async (ctx, args) => {
    const fileId = await ctx.db.patch(args.fileId, {
      ...args.file,
      updatedAt: Date.now(),
    });
    return fileId;
  },
});

export const getFile = query({
  args: {
    fileId: v.string(),
  },
  handler: async (ctx, args) => {
    const id = ctx.db.normalizeId("files", args.fileId);
    if (!id) return null;
    const file = await ctx.db.get(id);
    return file || null;
  },
});

export const getFiles = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    const files = await ctx.db
      .query("files")
      .filter((q) => q.eq(q.field("userId"), userId))
      .collect();
    return files.map((item) => ({
      name: item.name,
      id: item._id,
      updatedAt: item.updatedAt,
      createdAt: item.createdAt,
    }));
  },
});
