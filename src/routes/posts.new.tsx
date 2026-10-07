import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { PostEditor } from "@/components/cms/PostEditor";
import { newPost } from "@/lib/cms-store";

export const Route = createFileRoute("/posts/new")({
  head: () => ({
    meta: [
      { title: "New Post — Inkwell CMS" },
      { name: "description", content: "Write and publish a new blog post." },
      { property: "og:title", content: "New Post — Inkwell CMS" },
      { property: "og:description", content: "Write and publish a new blog post." },
    ],
  }),
  component: NewPost,
});

function NewPost() {
  const [p] = useState(newPost);
  return <PostEditor initial={p} />;
}
