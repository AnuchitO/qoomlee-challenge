export default function TopAppBar() {
  return (
    <header className="bg-surface-bright border-b border-outline-variant shadow-sm flex justify-between items-center w-full px-container-margin-mobile py-md h-16 sticky top-0 z-[60]">
      <div className="flex items-center gap-md">
        <button className="hover:bg-surface-container-high transition-colors p-2 rounded-full active:opacity-80">
          <span className="material-symbols-outlined text-primary">menu</span>
        </button>
        <span className="text-headline-lg-mobile tracking-tight text-primary">
          Qoomlee
        </span>
      </div>
      <div className="w-10 h-10 rounded-full bg-surface-container overflow-hidden border border-outline-variant">
        <img
          alt="User profile"
          className="w-full h-full object-cover"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuDbQ_XwjmT3nQVZtKrch7NWDiSTPUL-q44fRlURVa5KfhNZaH0dxy82ic4hUenos1ZZY_aEQ2IPRhThcMK3zMIzMuiEdtEGe4Iiz_TfPSM3F5dlkLdyuwIA6JJjmtM6lpikcIj-N4vDa6kyQprjMGh3Lul2reod_bHp6WgonwIR8HDKCdJq60mS_bOIeGn-ivSUui-9mIxbX37XgGkBGfde0naGFq4mtaIozJRUXY1lr80mbHdjI5xvTTZ2JvJn93nxZcbyJYvWfCA"
        />
      </div>
    </header>
  );
}
