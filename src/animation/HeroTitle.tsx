import type { CSSProperties } from 'react';

export function HeroTitle({ animate }: { animate: boolean }) {
  const lines = ['BAUEN MIT', 'PRÄZISION'];
  return (
    <h1 id="hero-title" tabIndex={-1} lang="de" className={animate ? 'hero-title title-reveal' : 'hero-title'}>
      <span className="sr-only">{lines.join(' ')}</span>
      <span aria-hidden="true">
        {lines.map((line, lineIndex) => (
          <span className="title-line" key={line}>
            {Array.from(line, (letter, index) => (
              <span key={index} className="title-letter"
                style={{ '--letter-index': index + lineIndex * lines[0].length } as CSSProperties}>
                {letter === ' ' ? '\u00a0' : letter}
              </span>
            ))}
          </span>
        ))}
      </span>
    </h1>
  );
}
