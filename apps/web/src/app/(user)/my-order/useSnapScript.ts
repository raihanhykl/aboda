import { SNAP_MIDTRANS, SNAP_MIDTRANS_CLIENT_KEY } from '@/config';
import { useState, useEffect } from 'react';

export function useSnapScript() {
  const [snapLoaded, setSnapLoaded] = useState(false);

  useEffect(() => {
    const snapScript = `${SNAP_MIDTRANS}`;
    const clientKey = `${SNAP_MIDTRANS_CLIENT_KEY}`;

    if (!document.getElementById('snap-script')) {
      const script = document.createElement('script');
      script.id = 'snap-script';
      script.src = snapScript;
      script.setAttribute('data-client-key', clientKey);
      script.async = true;
      script.onload = () => setSnapLoaded(true);
      document.body.appendChild(script);
    } else {
      setSnapLoaded(true);
    }

    return () => {
      const existingScript = document.getElementById('snap-script');
      if (existingScript) {
        document.body.removeChild(existingScript);
      }
    };
  }, []);

  return snapLoaded;
}
