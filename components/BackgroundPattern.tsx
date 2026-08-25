// Trama de fondo decorativa: arcos anidados espejados, inspirados en el lenguaje
// geométrico de una cancha de básquet. Muy sutil a propósito — nunca debe competir
// con la información. No interactivo, fijo detrás de todo el contenido.
export default function BackgroundPattern() {
  return (
    <svg
      className="fixed inset-0 -z-10 h-full w-full"
      viewBox="0 0 390 900"
      preserveAspectRatio="xMidYMin slice"
      aria-hidden="true"
      focusable="false"
    >
      <g fill="#DAD0C7" opacity="0.5">
        <path d="M-226,940 L-226,676 A306,306 0 0 1 386,676 L386,940 Z" />
        <path d="M-174,940 L-174,556 A254,254 0 0 1 334,556 L334,940 Z" />
        <path d="M-122,940 L-122,436 A202,202 0 0 1 282,436 L282,940 Z" />
        <path d="M-70,940 L-70,316 A150,150 0 0 1 230,316 L230,940 Z" />
        <path d="M-18,940 L-18,196 A98,98 0 0 1 178,196 L178,940 Z" />
        <path d="M34,940 L34,76 A46,46 0 0 1 126,76 L126,940 Z" />

        <path d="M4,940 L4,676 A306,306 0 0 1 616,676 L616,940 Z" />
        <path d="M56,940 L56,556 A254,254 0 0 1 564,556 L564,940 Z" />
        <path d="M108,940 L108,436 A202,202 0 0 1 512,436 L512,940 Z" />
        <path d="M160,940 L160,316 A150,150 0 0 1 460,316 L460,940 Z" />
        <path d="M212,940 L212,196 A98,98 0 0 1 408,196 L408,940 Z" />
        <path d="M264,940 L264,76 A46,46 0 0 1 356,76 L356,940 Z" />
      </g>
    </svg>
  );
}
