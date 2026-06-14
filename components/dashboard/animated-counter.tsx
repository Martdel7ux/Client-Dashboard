"use client";

import { useEffect, useRef } from "react";
import {
  useInView,
  useMotionValue,
  useSpring,
  useTransform,
  motion,
} from "framer-motion";

interface AnimatedCounterProps {
  value: number;
  /** Decimal places to render. */
  decimals?: number;
  suffix?: string;
  prefix?: string;
  className?: string;
}

/**
 * Spring-animated number that counts up when scrolled into view.
 * Tabular-nums keeps the width stable so it never jitters.
 */
export function AnimatedCounter({
  value,
  decimals = 0,
  suffix = "",
  prefix = "",
  className,
}: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const motionValue = useMotionValue(0);
  const spring = useSpring(motionValue, {
    stiffness: 90,
    damping: 18,
    mass: 0.8,
  });
  const display = useTransform(spring, (latest) =>
    latest.toFixed(decimals),
  );

  useEffect(() => {
    if (inView) motionValue.set(value);
  }, [inView, value, motionValue]);

  return (
    <span ref={ref} className={className}>
      {prefix}
      <motion.span className="tabular">{display}</motion.span>
      {suffix}
    </span>
  );
}
