function IconBase({ children, className = "", ...props }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {children}
    </svg>
  );
}

export function MenuIcon(props) {
  return (
    <IconBase {...props}>
      <path d="M4 7h16" />
      <path d="M4 12h16" />
      <path d="M4 17h16" />
    </IconBase>
  );
}

export function CloseIcon(props) {
  return (
    <IconBase {...props}>
      <path d="m6 6 12 12" />
      <path d="m18 6-12 12" />
    </IconBase>
  );
}

export function CompassIcon(props) {
  return (
    <IconBase {...props}>
      <circle cx="12" cy="12" r="8" />
      <path d="m14.6 9.4-2.5 5-2.7 1.2 1.3-2.6 4.9-2.6Z" />
    </IconBase>
  );
}

export function UserIcon(props) {
  return (
    <IconBase {...props}>
      <path d="M18 19a6 6 0 0 0-12 0" />
      <circle cx="12" cy="9" r="3.5" />
    </IconBase>
  );
}

export function BuildingIcon(props) {
  return (
    <IconBase {...props}>
      <path d="M4 20V7.5A1.5 1.5 0 0 1 5.5 6H10v14" />
      <path d="M10 20V4.5A1.5 1.5 0 0 1 11.5 3h7A1.5 1.5 0 0 1 20 4.5V20" />
      <path d="M7 10h1" />
      <path d="M7 13h1" />
      <path d="M13 7h1" />
      <path d="M16 7h1" />
      <path d="M13 11h1" />
      <path d="M16 11h1" />
      <path d="M13 15h1" />
      <path d="M16 15h1" />
    </IconBase>
  );
}
