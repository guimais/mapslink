export function SectionHeading({ eyebrow, title, description, align = "left", className = "" }) {
  return (
    <div className={`section-heading section-heading--${align} ${className}`.trim()}>
      {eyebrow ? <span className="section-heading__eyebrow">{eyebrow}</span> : null}
      <h2>{title}</h2>
      {description ? <p>{description}</p> : null}
    </div>
  );
}
