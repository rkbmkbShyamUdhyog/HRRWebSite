// A soft wavy edge between two sections, drawn over the current section's background.
// `color` is the colour of the neighbouring section. By default the wave sits at the bottom and rises
// into the next section's colour; `top` flips it for the top edge, hanging down from the previous section.
export default function Wave({ color = 'var(--white)', top = false }) {
  return (
    <svg className={`wave ${top ? 'wave--top' : ''}`} viewBox="0 0 1440 80" preserveAspectRatio="none" aria-hidden="true">
      <path fill={color} d="M0 48c120-26 240-38 360-30s240 40 360 40 240-36 360-44 240 10 360 26v40H0z" />
    </svg>
  );
}
