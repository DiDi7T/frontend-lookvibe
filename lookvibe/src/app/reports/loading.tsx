export default function ReportsLoading() {
  return (
    <main className="mx-auto w-full max-w-6xl flex-1 animate-pulse px-4 py-12 sm:px-6">
      <div className="h-9 w-64 bg-white/10" />
      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[1, 2, 3, 4].map((item) => <div key={item} className="h-24 border-l-2 border-white/10 bg-white/[0.03]" />)}
      </div>
    </main>
  );
}