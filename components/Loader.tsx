// Loader genérico de marca — reemplaza los "Cargando..." de texto plano
// en toda la PWA (estados de carga de rutas y de fetch client-side).
export default function Loader({ label = "Cargando" }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16">
      <div
        className="w-10 h-10 rounded-full border-[3px] border-[#DAD0C7] border-t-[#372D2E] animate-spin motion-reduce:animate-none"
        aria-hidden="true"
      />
      <span className="font-bebas text-sm tracking-[0.2em] text-[#372D2E]/60 uppercase">
        {label}
      </span>
    </div>
  );
}
