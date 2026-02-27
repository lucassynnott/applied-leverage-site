export const CLAW_COLOR = "#ff1493";

// AL logo as path — circle ring + letters as geometric paths (Satori-compatible)
export const AL_CIRCLE = {
  cx: 250,
  cy: 250,
  r: 230,
  strokeWidth: 20,
};

// "A" letter path (geometric, centered left)
const A_PATH =
  "M140,350 L200,130 L260,350 M160,290 L240,290";

// "L" letter path (geometric, centered right)  
const L_PATH =
  "M280,130 L280,350 L370,350";

export const CLAW_PATH = `${A_PATH} ${L_PATH}`;

export function clawSvg(size: number, fill = CLAW_COLOR) {
  return (
    <svg
      viewBox="0 0 500 500"
      width={size}
      height={size}
    >
      <circle
        cx={AL_CIRCLE.cx}
        cy={AL_CIRCLE.cy}
        r={AL_CIRCLE.r}
        fill="none"
        stroke={fill}
        strokeWidth={AL_CIRCLE.strokeWidth}
      />
      <path
        d={CLAW_PATH}
        fill="none"
        stroke={fill}
        strokeWidth="32"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
