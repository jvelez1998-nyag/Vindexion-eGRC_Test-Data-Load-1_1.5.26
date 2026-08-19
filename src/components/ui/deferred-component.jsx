import { useState, useEffect } from "react";

/**
 * Defers rendering of non-critical components until after initial page interaction
 * or after a timeout, improving initial page load performance
 */
export default function DeferredComponent({ 
  children, 
  fallback = null,
  delay = 100,
  waitForInteraction = true 
}) {
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    let timeoutId;

    const handleInteraction = () => {
      setShouldRender(true);
    };

    if (waitForInteraction) {
      // Listen for any user interaction
      const events = ['mousedown', 'touchstart', 'keydown', 'scroll'];
      events.forEach(event => {
        window.addEventListener(event, handleInteraction, { once: true });
      });

      // Also set a fallback timeout
      timeoutId = setTimeout(() => setShouldRender(true), delay);

      return () => {
        events.forEach(event => {
          window.removeEventListener(event, handleInteraction);
        });
        clearTimeout(timeoutId);
      };
    } else {
      // Just use delay
      timeoutId = setTimeout(() => setShouldRender(true), delay);
      return () => clearTimeout(timeoutId);
    }
  }, [delay, waitForInteraction]);

  return shouldRender ? children : fallback;
}