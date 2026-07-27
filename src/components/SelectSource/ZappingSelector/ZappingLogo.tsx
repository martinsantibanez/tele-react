const SRC = '/img/zapping.png';

/** Aspect ratio of the artwork, cropped to the mark itself: 872 × 520. */
const ASPECT = 872 / 520;

type Props = {
  /** Height, matching how the lucide icons next to it are sized. */
  size?: number;
  'aria-hidden'?: boolean;
  className?: string;
};

/**
 * Zapping's mark. The PNG is solid white on transparency, which would vanish on
 * the light fill the active category button carries, so the artwork is used as a
 * mask and the colour comes from `currentColor` — the same way the lucide icons
 * beside it follow the button's text colour.
 *
 * The accessible name is left to whatever wraps it.
 */
export const ZappingLogo = ({ size = 16, ...props }: Props) => (
  <span
    {...props}
    style={{
      display: 'inline-block',
      width: size * ASPECT,
      height: size,
      backgroundColor: 'currentColor',
      maskImage: `url(${SRC})`,
      WebkitMaskImage: `url(${SRC})`,
      maskSize: 'contain',
      WebkitMaskSize: 'contain',
      maskRepeat: 'no-repeat',
      WebkitMaskRepeat: 'no-repeat',
      maskPosition: 'center',
      WebkitMaskPosition: 'center'
    }}
  />
);
