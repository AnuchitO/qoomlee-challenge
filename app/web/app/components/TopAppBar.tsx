import Link from "next/link";

export default function TopAppBar() {
  return (
    <header className="bg-surface-bright border-b border-outline-variant shadow-sm w-full sticky top-0 z-[60]">
      <div className="max-w-6xl mx-auto px-container-margin-mobile md:px-container-margin-desktop flex justify-between items-center h-16">
        <div className="flex items-center gap-md">
          <Link
            href="/support"
            className="hover:bg-surface-container-high transition-colors p-2 rounded-full active:opacity-80"
          >
            <span className="material-symbols-outlined text-primary">menu</span>
          </Link>
          <Link href="/flights" className="text-headline-lg-mobile tracking-tight text-primary">
            Qoomlee
          </Link>
        </div>
        <Link
          href="/profile"
          className="w-10 h-10 rounded-full bg-surface-container overflow-hidden border border-outline-variant hover:ring-2 hover:ring-primary/20 transition-all"
        >
          <div className="w-full h-full bg-secondary-fixed text-on-secondary-fixed flex items-center justify-center text-label-md font-bold">
            JD
          </div>
        </Link>
      </div>
    </header>
  );
}
