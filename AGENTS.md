<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Architecture
- CMS data lives in an in-memory store (src/lib/cms-store.ts, useSyncExternalStore) seeded with sample data — frontend-only demo until a backend is added.
- Admin pages wrap themselves in AdminLayout; public blog pages use BlogShell under /blog.
