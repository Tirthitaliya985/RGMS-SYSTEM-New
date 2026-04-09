import React from "react";

export default function SocietyLoader({
  spinning = true,
  fullScreen = false,
  inline = false,
  size = "md",
  text = "Loading Society...",
  showText = true,
  children,
}) {
  if (!spinning) return children ?? null;

  const core = (
    <div className={`society-loader__inner size-${size}`}>
      <div className="society-loader__society">
        <div className="society-loader__building b1">
          <div className="society-loader__window" />
          <div className="society-loader__window" />
          <div className="society-loader__window" />
          <div className="society-loader__window" />
          <div className="society-loader__window" />
          <div className="society-loader__window" />
        </div>

        <div className="society-loader__building b2">
          <div className="society-loader__window" />
          <div className="society-loader__window" />
          <div className="society-loader__window" />
          <div className="society-loader__window" />
          <div className="society-loader__window" />
          <div className="society-loader__window" />
          <div className="society-loader__window" />
          <div className="society-loader__window" />
        </div>

        <div className="society-loader__building b3">
          <div className="society-loader__window" />
          <div className="society-loader__window" />
          <div className="society-loader__window" />
          <div className="society-loader__window" />
        </div>
      </div>

      {showText && <p className="society-loader__text">{text}</p>}
    </div>
  );

  if (inline) {
    return <div className={`society-loader-inline size-${size}`}>{core}</div>;
  }

  if (children) {
    return (
      <div className="society-loader-container">
        {children}
        <div className={`society-loader-overlay ${fullScreen ? "is-fullscreen" : ""}`}>
          {core}
        </div>
      </div>
    );
  }

  return (
    <div className={`society-loader-overlay ${fullScreen ? "is-fullscreen" : "is-inline"}`}>
      {core}
    </div>
  );
}
