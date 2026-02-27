export const CLAW_COLOR = "#ff1493";
export const CLAW_VIEWBOX = "0 0 500 500";

// The actual AL logo SVG Lucas designed
export function AlLogo({
  size,
  className,
  fill = "currentColor",
}: {
  size?: number;
  className?: string;
  fill?: string;
}) {
  return (
    <svg
      viewBox="0 0 500 500"
      width={size}
      height={size}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="250" cy="250" r="230" fill="none" stroke={fill} strokeWidth="20" />
      <text
        x="250"
        y="290"
        fontFamily="Arial, Helvetica, sans-serif"
        fontSize="220"
        fontWeight="bold"
        fill={fill}
        textAnchor="middle"
      >
        AL
      </text>
    </svg>
  );
}

// Path-only version for OG images (Satori can't render <text>)
export function clawSvg(size: number, fill = CLAW_COLOR) {
  return (
    <svg viewBox={CLAW_VIEWBOX} width={size} height={size}>
      <circle cx="250" cy="250" r="230" fill="none" stroke={fill} strokeWidth="20" />
      <g fill={fill}>
        <path d="M118,370 L196,130 C198,124 202,120 208,120 C214,120 218,124 220,130 L298,370 C300,376 296,382 290,382 L278,382 C272,382 268,378 266,372 L250,326 L166,326 L150,372 C148,378 144,382 138,382 L126,382 C120,382 116,376 118,370 Z M178,290 L238,290 L208,194 Z" />
        <path d="M320,130 C320,124 324,120 330,120 L342,120 C348,120 352,124 352,130 L352,350 L392,350 C398,350 402,354 402,360 L402,370 C402,376 398,380 392,380 L330,380 C324,380 320,376 320,370 Z" />
      </g>
    </svg>
  );
}
