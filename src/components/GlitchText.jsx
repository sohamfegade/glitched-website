export default function GlitchText({ text, className = '' }) {
  return (
    <h1
      className={`glitch-text ${className}`}
      data-text={text}
    >
      {text}
    </h1>
  );
}
