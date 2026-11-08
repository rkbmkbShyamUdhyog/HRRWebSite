import { useEffect, useState } from 'react';
import SafeImage from '../common/SafeImage.jsx';

// Main image with a row of thumbnails. Resets to the first image when the image set changes.
// fit="contain" shows whole photos (e.g. wide group shots) instead of cropping them to the frame.
export default function Gallery({ images, alt, fit }) {
  const contain = fit === 'contain' ? 'is-contain' : '';
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex(0);
  }, [images]);

  const current = images[index] ?? images[0];

  return (
    <div className="gallery">
      <div className={`gallery__main ${contain}`}>
        <SafeImage src={current} alt={`${alt}, image ${index + 1} of ${images.length}`} className="gallery__img" />
      </div>
      {images.length > 1 && (
        <ul className="gallery__thumbs">
          {images.map((src, i) => (
            <li key={`${src}-${i}`}>
              <button
                type="button"
                className={`thumb ${contain} ${i === index ? 'is-active' : ''}`}
                aria-label={`Show image ${i + 1}`}
                aria-current={i === index}
                onClick={() => setIndex(i)}
              >
                <SafeImage src={src} alt="" className="thumb__img" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
