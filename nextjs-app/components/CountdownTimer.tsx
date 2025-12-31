'use client';

import { useState, useEffect } from 'react';
import styles from './CountdownTimer.module.css';

interface CountdownTimerProps {
  endTime: string;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export default function CountdownTimer({ endTime }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);

  useEffect(() => {
    if (!endTime) return;

    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const end = new Date(endTime).getTime();
      const difference = end - now;

      if (difference <= 0) {
        setTimeLeft(null);
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds });
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(interval);
  }, [endTime]);

  if (!timeLeft) return null;

  return (
    <div className={styles.countdownTimer}>
      <div className={styles.countdownLabel}>Rezervasyon Bitişi:</div>
      <div className={styles.countdownTime}>
        {timeLeft.days > 0 && <span>{timeLeft.days}g </span>}
        {timeLeft.hours > 0 && <span>{timeLeft.hours}s </span>}
        {timeLeft.minutes > 0 && <span>{timeLeft.minutes}d </span>}
        <span>{timeLeft.seconds}sn</span>
      </div>
    </div>
  );
}

