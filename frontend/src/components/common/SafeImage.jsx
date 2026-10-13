import { useState } from 'react';
import { resolveImage } from '../../utils/images.js';

// An <img> that swaps to a soft "HRR" tile if the image fails to load.
export default function SafeImage({ src: path, alt, className = '', ...rest }) {
  const src = resolveImage(path);
  const [failedSrc, setFailedSrc] = useState(null);

  if (!src || failedSrc === src) {
    return (
      <div className={`image-placeholder ${className}`} role="img" aria-label={alt}>
        <span>HRR</span>
      </div>
    );
  }

  return <img src={src} alt={alt} className={className} onError={() => setFailedSrc(src)} {...rest} />;
}
