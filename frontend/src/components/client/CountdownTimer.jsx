import React, { useState, useEffect } from "react";

const CountdownTimer = ({ targetDate }) => {
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

  if (!timeLeft.hours && !timeLeft.minutes && !timeLeft.seconds) {
    return <span className="text-white font-bold ml-2">KHUYẾN MÃI ĐÃ KẾT THÚC</span>;
  }

  return (
    <div className="flex items-center gap-2">
      {timeLeft.days > 0 && (
        <>
          <span className="bg-black text-white px-2 py-1 rounded text-sm font-black min-w-[32px] text-center">
            {addLeadingZero(timeLeft.days)}
          </span>
          <span className="text-white font-bold text-xs">NGÀY</span>
        </>
      )}
      <div className="flex items-center gap-1.5 ml-1">
        <span className="bg-black text-white px-2 py-1 rounded text-sm font-black min-w-[32px] text-center">
          {addLeadingZero(timeLeft.hours)}
        </span>
        <span className="text-white font-black">:</span>
        <span className="bg-black text-white px-2 py-1 rounded text-sm font-black min-w-[32px] text-center">
          {addLeadingZero(timeLeft.minutes)}
        </span>
        <span className="text-white font-black">:</span>
        <span className="bg-black text-white px-2 py-1 rounded text-sm font-black min-w-[32px] text-center">
          {addLeadingZero(timeLeft.seconds)}
        </span>
      </div>
    </div>
  );
};

export default CountdownTimer;
