import { posterStripe } from "@/lib/design-tokens";

/**
 * PosterStripe — signature 4-color horizontal bar.
 * red 60 · yellow 28 · cobalt 14 · pink 28 (ratios), 4px tall by default.
 * Stretches edge-to-edge via flex-basis so ratios scale with container width.
 */
export interface PosterStripeProps {
  /** Height in px. Default: 4. */
  height?: number;
  className?: string;
}

export function PosterStripe({ height = posterStripe.height, className }: PosterStripeProps) {
  return (
    <div
      role="presentation"
      aria-hidden="true"
      data-testid="poster-stripe"
      className={className}
      style={{ display: "flex", width: "100%", height }}
    >
      {posterStripe.segments.map((seg, i) => (
        <div
          key={i}
          data-color={seg.color}
          style={{
            flexGrow: seg.width,
            flexShrink: 0,
            flexBasis: 0,
            background: seg.color,
          }}
        />
      ))}
    </div>
  );
}

export default PosterStripe;
