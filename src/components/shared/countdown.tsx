"use client";

import { useEffect, useState } from "react";
import { formatCountdown } from "@/lib/format";

/**
 * Contagem regressiva a partir de `initialSeconds` (calculado sobre o "agora" da demo).
 * O primeiro render é idêntico no servidor e no navegador; o relógio só anda após montar.
 */
export function useCountdown(initialSeconds: number) {
  const [remaining, setRemaining] = useState(initialSeconds);
  const [cycle, setCycle] = useState(0);

  useEffect(() => {
    setRemaining(initialSeconds);
    const start = Date.now();
    const id = setInterval(() => {
      const left = Math.max(0, initialSeconds - Math.floor((Date.now() - start) / 1000));
      setRemaining(left);
      if (left === 0) clearInterval(id);
    }, 1000);
    return () => clearInterval(id);
  }, [initialSeconds, cycle]);

  return { remaining, restart: () => setCycle((c) => c + 1) };
}

export function Countdown({ seconds, className }: { seconds: number; className?: string }) {
  const { remaining } = useCountdown(seconds);
  return <span className={className}>{formatCountdown(remaining)}</span>;
}
