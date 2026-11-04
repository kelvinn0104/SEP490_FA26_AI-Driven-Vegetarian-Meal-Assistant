import test from "node:test";
import assert from "node:assert/strict";
import { mediaLink, postMedia, recipeNumber, validatePost, postDate } from "../src/user/postData.js";

test("community media accepts safe sources and embeds only known YouTube hosts", () => {
  for (const url of ["javascript:alert(1)", "data:text/html,x", "http://example.com/v.mp4", "not-a-url", "https://user:pass@example.com/x"]) assert.equal(mediaLink(url), null);
  assert.equal(mediaLink("/uploads/video.mp4").hostname, "veggieai-api.onrender.com");
  assert.deepEqual(postMedia("https://youtu.be/abcdefghijk?t=8"), { kind: "youtube", src: "https://www.youtube-nocookie.com/embed/abcdefghijk" });
  assert.equal(postMedia("https://www.youtube.com/watch?v=abcdefghijk").kind, "youtube");
  assert.equal(postMedia("https://youtube.com.evil.example/watch?v=abcdefghijk").kind, "link");
  assert.equal(postMedia("https://media.example/clip.MP4?token=public").kind, "video");
  assert.equal(postMedia("https://example.com/watch/9").kind, "link");
});

test("community payload follows backend limits, numeric recipe IDs and optional video content", () => {
  const post = { postType: "blog", title: "Căn bếp nhỏ", content: "Chia sẻ món chay", mediaUrl: "", recipeId: "r12" };
  assert.equal(validatePost(post), "");
  assert.equal(recipeNumber("r12"), 12);
  assert.equal(recipeNumber(12), 12);
  for (const invalid of ["r0", "r12x", "1.2", "-3", "2147483648", ""]) assert.equal(recipeNumber(invalid), null);
  assert.ok(validatePost({ ...post, title: "  " }));
  assert.ok(validatePost({ ...post, content: " " }));
  assert.ok(validatePost({ ...post, title: "x".repeat(201) }));
  assert.ok(validatePost({ ...post, content: "x".repeat(20001) }));
  assert.ok(validatePost({ ...post, recipeId: "r2x" }));
  assert.equal(validatePost({ ...post, postType: "video", content: "", mediaUrl: "https://example.com/clip.mp4" }), "");
  assert.ok(validatePost({ ...post, postType: "video", mediaUrl: "" }));
  assert.ok(validatePost({ ...post, postType: "video", mediaUrl: "/uploads/clip.mp4" }));
  assert.ok(validatePost({ ...post, postType: "invalid" }));
  assert.equal(postDate(null), "");
  assert.equal(postDate("invalid-date"), "");
});
