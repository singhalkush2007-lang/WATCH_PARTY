import { useEffect } from 'react';

const MAGNET_MAX = 6; // px: how far a magnetic button can drift toward the cursor

// One pointer listener for the whole app (mouse/trackpad only):
// - writes --mx/--my on the .btn / .spotlight / .edge-light under the cursor,
//   so their copper light follows the pointer
// - pulls [data-magnetic] elements a few pixels toward the cursor
// Work is batched to one update per animation frame. Magnetic pull is
// skipped when the visitor prefers reduced motion.
export function usePointerEffects() {
  useEffect(() => {
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let frame = 0;
    let lastEvent = null;
    let magnet = null;

    const releaseMagnet = () => {
      if (!magnet) return;
      magnet.style.removeProperty('--tx');
      magnet.style.removeProperty('--ty');
      magnet = null;
    };

    const update = () => {
      frame = 0;
      const e = lastEvent;
      if (!e || !(e.target instanceof Element)) return;

      const lit = e.target.closest('.btn, .spotlight, .edge-light');
      if (lit) {
        const r = lit.getBoundingClientRect();
        lit.style.setProperty('--mx', `${e.clientX - r.left}px`);
        lit.style.setProperty('--my', `${e.clientY - r.top}px`);
      }

      const next = reduceMotion.matches ? null : e.target.closest('[data-magnetic]');
      if (next !== magnet) releaseMagnet();
      if (next) {
        const r = next.getBoundingClientRect();
        const pull = (offset) => Math.max(-MAGNET_MAX, Math.min(MAGNET_MAX, offset * 0.3));
        next.style.setProperty('--tx', `${pull(e.clientX - (r.left + r.width / 2))}px`);
        next.style.setProperty('--ty', `${pull(e.clientY - (r.top + r.height / 2))}px`);
        magnet = next;
      }
    };

    const onMove = (e) => {
      lastEvent = e;
      if (!frame) frame = requestAnimationFrame(update);
    };
    const root = document.documentElement;
    document.addEventListener('pointermove', onMove, { passive: true });
    root.addEventListener('pointerleave', releaseMagnet);
    return () => {
      document.removeEventListener('pointermove', onMove);
      root.removeEventListener('pointerleave', releaseMagnet);
      cancelAnimationFrame(frame);
      releaseMagnet();
    };
  }, []);
}
