import { z } from "zod";

export const PostIdSource = z.enum([
  "aweme_id",
  "share_url_canonical",
  "share_url_short",
  "xhs_note_url",
]);
export type PostIdSource = z.infer<typeof PostIdSource>;

export const NoteType = z.enum(["video", "image_text"]);
export type NoteType = z.infer<typeof NoteType>;

/** Platform tag for multi-platform keyword crawl (006). */
export const Platform = z.enum(["douyin", "xiaohongshu"]);
export type Platform = z.infer<typeof Platform>;

/** Media form of a captured material item. */
export const MediaKind = z.enum(["video", "images", "mixed"]);
export type MediaKind = z.infer<typeof MediaKind>;

export const commentItemSchema = z.object({
  author: z.string().max(256),
  content: z.string().max(1024),
  like_count: z.number().int().gte(-1),
  time_text: z.string().max(64),
});
export type CommentItem = z.infer<typeof commentItemSchema>;

export const materialEntrySchema = z.object({
  post_id: z.string().min(1).max(128),
  post_id_source: PostIdSource,
  share_url: z.string().min(1).max(2048),
  share_text: z.string().min(1).max(4096),
  caption: z.string().max(4096),
  author_handle: z.string().min(1).max(256),
  author_display_name: z.union([z.string().max(256), z.null()]),
  hashtags: z.array(z.string().max(64)).max(64),
  music_id: z.union([z.string().max(128), z.null()]),
  music_title: z.union([z.string().max(256), z.null()]),
  like_count: z.number().int().gte(-1),
  comment_count: z.number().int().gte(-1),
  share_count: z.number().int().gte(-1),
  collect_count: z.number().int().gte(-1),
  author_follower_count: z.union([z.number().int().positive(), z.null()]),
  captured_at: z.string().datetime({ offset: false }),
  captured_by_device: z.string().min(1).max(128),
  note_type: NoteType.default("video"),
  platform: Platform.default("douyin"),
  media_kind: MediaKind.default("video"),
  image_urls: z.union([z.array(z.string().url().max(2048)).max(64), z.null()]).default(null),
  comments: z.array(commentItemSchema).max(10).default([]),
  transcript: z.union([z.string().max(65536), z.null()]).default(null),
  transcribed_at: z.union([z.string().datetime({ offset: false }), z.null()]).default(null),
});
export type MaterialEntry = z.infer<typeof materialEntrySchema>;
export const MaterialEntry = materialEntrySchema;
