import { createFileRoute, Link } from "@tanstack/react-router";
import { FileText } from "lucide-react";
import { AdminLayout } from "@/components/cms/AdminLayout";
import { PostEditor } from "@/components/cms/PostEditor";
import { EmptyState, Panel } from "@/components/cms/ui-bits";
import { Button } from "@/components/ui/button";
import { useCms } from "@/lib/cms-store";

export const Route = createFileRoute("/posts/$id")({
  head: () => ({
    meta: [
      { title: "Edit Post — Inkwell CMS" },
      { name: "description", content: "Edit content, SEO and publishing settings for a post." },
      { property: "og:title", content: "Edit Post — Inkwell CMS" },
      { property: "og:description", content: "Edit content, SEO and publishing settings for a post." },
    ],
  }),
  component: EditPost,
});

function EditPost() {
  const { id } = Route.useParams();
  const post = useCms().posts.find((p) => p.id === id);
  if (!post)
    return (
      <AdminLayout>
        <Panel>
          <EmptyState icon={FileText} title="Post not found" text="It may have been deleted." action={<Button asChild><Link to="/posts">Back to posts</Link></Button>} />
        </Panel>
      </AdminLayout>
    );
  return <PostEditor key={post.id} initial={post} />;
}
