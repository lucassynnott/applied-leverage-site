export const CLAW_COLOR = "#ff1493";

export function clawSvg(size: number, fill = CLAW_COLOR) {
  return (
    <svg
      viewBox="0 0 500 500"
      width={size}
      height={size}
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle
        cx="250"
        cy="250"
        r="230"
        fill="none"
        stroke={fill}
        strokeWidth="20"
      />
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
