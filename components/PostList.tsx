import { Post } from '../lib/schema';

export default function PostList({ posts }: { posts: Post[] }) {
  if (!posts.length) {
    return <p className="text-xs text-neutral-500">No posts yet.</p>;
  }

  return (
    <div className="space-y-2">
      {posts.map((p) => (
        <a
          key={p.id}
          href={p.url}
          target="_blank"
          rel="noreferrer"
          className="block rounded-lg border border-neutral-800 bg-neutral-900/60 px-3 py-2 text-xs hover:border-neutral-500 transition-colors"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="font-medium">
              {p.platform.toUpperCase()} • {p.title || p.id}
            </span>
            <span className="text-[10px] text-neutral-500">
              {p.postedAt?.slice(0, 10)}
            </span>
          </div>
          <p className="text-[11px] text-neutral-500 truncate">{p.url}</p>
        </a>
      ))}
    </div>
  );
}
