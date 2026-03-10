import { Header } from "@/components/Header";
import { PostTable } from "@/components/PostTable";
import { getDatabaseSnapshot } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function PostsPage() {
  const snapshot = await getDatabaseSnapshot();

  return (
    <div>
      <Header
        title="Posts"
        description="Review draft captions, set publishing targets, and trigger the current publish abstraction."
      />
      <PostTable
        posts={snapshot.posts}
        characters={snapshot.characters}
        generations={snapshot.generations}
      />
    </div>
  );
}
