import { useEffect } from 'react';

export default function usePageTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} — HRR` : 'HRR — Happy clothes for little adventures';
  }, [title]);
}
