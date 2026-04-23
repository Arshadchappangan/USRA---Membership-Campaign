import { useEffect, useState } from "react";

const pad = (n) => String(n).padStart(2, "0");

function getTimeLeft() {
  const diff = new Date("2026-05-01T00:00:00") - new Date();
  if (diff <= 0) return null;
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / 1000 / 60) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

const UNITS = [
  { key: "days", label: "Days" },
  { key: "hours", label: "Hours" },
  { key: "minutes", label: "Mins" },
  { key: "seconds", label: "Secs" },
];

export function Countdown() {
  const [time, setTime] = useState(getTimeLeft);

  useEffect(() => {
    const id = setInterval(() => setTime(getTimeLeft()), 1000);
    return () => clearInterval(id);
  }, []);

  if (!time)
    return (
      <div
        className="flex items-center gap-3 px-8 py-4 rounded-2xl text-white font-black text-xl"
        style={{ background: "linear-gradient(135deg, #4EAEE5, #9B59B6)" }}
      >
        <span className="w-3 h-3 rounded-full bg-green-400 animate-pulse" />
        Campaign is Live!
      </div>
    );

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Label */}
      <p
        className="text-center text-sm font-bold tracking-widest uppercase mb-5"
        style={{ color: "#9B59B6", letterSpacing: "0.2em" }}
      >
        Campaign Starts In
      </p>

      {/* Countdown cards row */}
      <div className="flex items-center justify-center gap-3 sm:gap-5">
        {UNITS.map(({ key, label }, i) => (
          <div key={key} className="flex items-center gap-3 sm:gap-5">
            {/* Card */}
            <div className="flex flex-col items-center">
              <div
                className="relative flex items-center justify-center rounded-2xl overflow-hidden"
                style={{
                  width: "clamp(64px, 18vw, 96px)",
                  height: "clamp(72px, 20vw, 108px)",
                  background:
                    "linear-gradient(160deg, rgba(255,255,255,0.92) 0%, rgba(240,245,255,0.85) 100%)",
                  border: "1.5px solid rgba(78,174,229,0.25)",
                  backdropFilter: "blur(12px)",
                  boxShadow:
                    "0 8px 32px rgba(78,174,229,0.15), 0 2px 8px rgba(0,0,0,0.06)",
                }}
              >
                {/* Top shimmer */}
                <div
                  className="absolute top-0 left-0 right-0 h-px"
                  style={{
                    background:
                      "linear-gradient(90deg, transparent, rgba(78,174,229,0.6), transparent)",
                  }}
                />
                {/* Mid divider */}
                <div
                  className="absolute left-0 right-0"
                  style={{
                    top: "50%",
                    height: "1px",
                    background:
                      "linear-gradient(90deg, transparent, rgba(155,89,182,0.2), transparent)",
                  }}
                />
                {/* Number */}
                <span
                  className="font-black tabular-nums"
                  style={{
                    fontSize: "clamp(26px, 7vw, 44px)",
                    background:
                      "linear-gradient(135deg, #4EAEE5 0%, #9B59B6 55%, #E91E8C 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                    lineHeight: 1,
                  }}
                >
                  {pad(time[key])}
                </span>
                {/* Bottom glow */}
                <div
                  className="absolute bottom-0 left-0 right-0 h-6 pointer-events-none"
                  style={{
                    background:
                      "linear-gradient(to top, rgba(78,174,229,0.07), transparent)",
                  }}
                />
              </div>

              {/* Label */}
              <span
                className="mt-2 font-bold uppercase"
                style={{
                  fontSize: "clamp(9px, 2vw, 11px)",
                  color: "#9B59B6",
                  letterSpacing: "0.15em",
                }}
              >
                {label}
              </span>
            </div>

            {/* Separator dots */}
            {i < UNITS.length - 1 && (
              <div className="flex flex-col gap-1.5 mb-6">
                <span
                  className="w-1.5 h-1.5 rounded-full animate-pulse"
                  style={{
                    background: "linear-gradient(135deg, #4EAEE5, #E91E8C)",
                  }}
                />
                <span
                  className="w-1.5 h-1.5 rounded-full animate-pulse"
                  style={{
                    background: "linear-gradient(135deg, #4EAEE5, #E91E8C)",
                    animationDelay: "0.4s",
                  }}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Bottom hint */}
      <p
        className="text-center mt-5 text-xs font-semibold tracking-wide"
        style={{ color: "rgba(155,89,182,0.55)" }}
      >
        May 01 – 15, 2026 &nbsp;·&nbsp; Registration Open
      </p>
    </div>
  );
}