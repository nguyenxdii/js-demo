import React, { useState, useEffect } from "react";

const CountdownTimer = ({ targetDate, small = false }) => {
  const calculateTimeLeft = () => {
    const difference = +new Date(targetDate) - +new Date();
    let timeLeft = {};

    if (difference > 0) {
      timeLeft = {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    }

    return timeLeft;
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setTimeout(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeLeft]);

  const addLeadingZero = (num) => {
    return num < 10 ? `0${num}` : num;
  };

  const TimeBox = ({ value, label, primary = false }) => (
    <div className="flex flex-col items-center gap-0.5">
      <div className={`
        ${primary ? 'bg-orange-600' : 'bg-gray-800'} 
        w-8 h-9 md:w-9 md:h-10 rounded-lg flex items-center justify-center shadow-sm border border-white/5
      `}>
        <span className="text-white text-sm md:text-base font-black tracking-tighter">
          {addLeadingZero(value || 0)}
        </span>
      </div>
      <span className="text-[7px] font-bold uppercase tracking-widest text-gray-400 mt-0.5">{label}</span>
    </div>
  );

  if (!timeLeft || (timeLeft.days === 0 && timeLeft.hours === 0 && timeLeft.minutes === 0 && timeLeft.seconds === 0)) {
    return (
        <div className="bg-red-600 px-3 py-1 rounded-lg animate-pulse">
            <span className="text-white font-black text-[9px] uppercase tracking-widest">CLOSED</span>
        </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5 md:gap-2">
      {timeLeft.days > 0 && <TimeBox value={timeLeft.days} label="Ngày" primary />}
      <TimeBox value={timeLeft.hours} label="Giờ" />
      <span className="text-gray-300 font-bold mb-3">:</span>
      <TimeBox value={timeLeft.minutes} label="Phút" />
      <span className="text-gray-300 font-bold mb-3">:</span>
      <TimeBox value={timeLeft.seconds} label="Giây" />
    </div>
  );
};

export default CountdownTimer;
