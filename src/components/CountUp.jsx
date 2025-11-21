import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useInView, useMotionValue, useSpring } from 'motion/react';

const getDecimalPlaces = (num) => {
  const str = num.toString();
  if (str.includes('.')) {
    const decimals = str.split('.')[1];
    if (parseInt(decimals, 10) !== 0) {
      return decimals.length;
    }
  }
  return 0;
};

export default function CountUp({
  to,
  from = 0,
  direction = 'up',
  delay = 0,
  duration = 2,
  className = '',
  startWhen = true,
  separator = '',
  onStart,
  onEnd
}) {
  const ref = useRef(null);
  const motionValue = useMotionValue(direction === 'down' ? to : from);

  const { damping, stiffness } = useMemo(() => {
    const safeDuration = Math.max(duration, 0.1);
    return {
      damping: 20 + 40 * (1 / safeDuration),
      stiffness: 100 * (1 / safeDuration)
    };
  }, [duration]);

  const springValue = useSpring(motionValue, {
    damping,
    stiffness
  });

  const isInView = useInView(ref, { once: true, margin: '0px' });
  const maxDecimals = useMemo(
    () => Math.max(getDecimalPlaces(from), getDecimalPlaces(to)),
    [from, to]
  );

  const numberFormatter = useMemo(() => {
    const hasDecimals = maxDecimals > 0;
    return new Intl.NumberFormat('en-US', {
      useGrouping: !!separator,
      minimumFractionDigits: hasDecimals ? maxDecimals : 0,
      maximumFractionDigits: hasDecimals ? maxDecimals : 0
    });
  }, [maxDecimals, separator]);

  const formatValue = useCallback(
    (latest) => {
      const formattedNumber = numberFormatter.format(latest);
      if (separator && separator !== ',') {
        return formattedNumber.replace(/,/g, separator);
      }
      return formattedNumber;
    },
    [numberFormatter, separator]
  );

  useEffect(() => {
    if (ref.current) {
      ref.current.textContent = formatValue(direction === 'down' ? to : from);
    }
  }, [from, to, direction, formatValue]);

  useEffect(() => {
    if (isInView && startWhen) {
      if (typeof onStart === 'function') onStart();

      const timeoutId = setTimeout(() => {
        motionValue.set(direction === 'down' ? from : to);
      }, delay * 1000);

      const durationTimeoutId = setTimeout(() => {
        if (typeof onEnd === 'function') onEnd();
      }, delay * 1000 + duration * 1000);

      return () => {
        clearTimeout(timeoutId);
        clearTimeout(durationTimeoutId);
      };
    }

    return undefined;
  }, [isInView, startWhen, motionValue, direction, from, to, delay, onStart, onEnd, duration]);

  useEffect(() => {
    const unsubscribe = springValue.on('change', (latest) => {
      if (ref.current) {
        ref.current.textContent = formatValue(latest);
      }
    });

    return () => unsubscribe();
  }, [springValue, formatValue]);

  return <span className={className} ref={ref} />;
}





