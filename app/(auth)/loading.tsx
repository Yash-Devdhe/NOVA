export default function Loading() {
  return (
    <div className="flex items-center justify-center h-screen bg-white">
      <div className="flex items-center gap-3 text-slate-600">
        <span className="h-2 w-2 rounded-full bg-slate-400 animate-pulse" />
        <span>Loading...</span>
      </div>
    </div>
  );
}
