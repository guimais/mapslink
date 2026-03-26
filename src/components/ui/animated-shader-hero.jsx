import React from "react";
import { BlurredStagger } from "./blurred-stagger-text";

function Hero({
  trustBadge,
  headline,
  subtitle,
  buttons,
  className = "",
}) {
  return (
    <section className={`minimal-hero ${className}`}>
      <div className="minimal-hero__overlay">
        {trustBadge ? (
          <div className="minimal-hero__badge">
            {trustBadge.icons?.length ? (
              <div className="minimal-hero__badge-icons">
                {trustBadge.icons.map((icon, index) => (
                  <span key={`${icon}-${index}`}>{icon}</span>
                ))}
              </div>
            ) : null}
            <span>{trustBadge.text}</span>
          </div>
        ) : null}

        <div className="minimal-hero__content">
          <div className="minimal-hero__headline">
            <BlurredStagger text={headline.line1} className="minimal-hero__title" />
            <BlurredStagger
              text={headline.line2}
              className="minimal-hero__title minimal-hero__title--accent"
            />
          </div>

          <p className="minimal-hero__subtitle">{subtitle}</p>

          {buttons ? (
            <div className="minimal-hero__actions">
              {buttons.primary ? (
                <button
                  type="button"
                  className="minimal-hero__button minimal-hero__button--primary"
                  onClick={buttons.primary.onClick}
                >
                  {buttons.primary.text}
                </button>
              ) : null}
              {buttons.secondary ? (
                <button
                  type="button"
                  className="minimal-hero__button minimal-hero__button--secondary"
                  onClick={buttons.secondary.onClick}
                >
                  {buttons.secondary.text}
                </button>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

export default Hero;
