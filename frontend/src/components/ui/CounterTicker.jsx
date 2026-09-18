import { useEffect, useState } from "react";
import { useMotionValue, useSpring, motion } from "motion/react";

/**
 * CounterTicker component
 * Smoothly animates a number from 0 (or previous value) to the target value using spring physics.
 */
export default function CounterTicker({
  value,
  className = "",
  style = {},
  prefix = "",
  suffix = "",
}) {
  const numericValue = typeof value === "number" ? value : 0;
  const motionVal = useMotionValue(0);

  const springVal = useSpring(motionVal, {
    stiffness: 75,
    damping: 18,
    restDelta: 0.001,
  });

  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    motionVal.set(numericValue);
  }, [numericValue, motionVal]);

  useEffect(() => {
    const unsubscribe = springVal.on("change", (latest) => {
      setDisplayValue(Math.round(latest));
    });
    return () => unsubscribe();
  }, [springVal]);

  if (value === null || value === undefined) {
    return <span className={className} style={style}>N/A</span>;
  }

  return (
    <motion.span
      className={className}
      style={{ display: "inline-block", fontVariantNumeric: "tabular-nums", ...style }}
    >
      {prefix}{displayValue}{suffix}
    </motion.span>
  );
}
