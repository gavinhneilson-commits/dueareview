import Link from "next/link";
export default function RootNotFound() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-24 text-center">
      <h1 className="display text-7xl">Not found</h1>
      <p className="mt-4"><Link href="/" className="underline">Go to the homepage</Link></p>
    </main>
  );
}
