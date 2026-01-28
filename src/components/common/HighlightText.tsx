import { useMemo } from 'react';

type Props = {
  text: string;
  query: string;
  markClassName?: string;
};

//정규식 특수문자(예: . + ?) 들어와도 깨지지 않게 escape 함
function escapeRegExp(str: string) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function HighlightText({
  text,
  query,
  markClassName = 'rounded bg-yellow-200 px-0.5',
}: Props) {
  const trimmed = query.trim();

  const parts = useMemo(() => {
    if (!trimmed) return [{ value: text, isMatch: false }];

    const pattern = new RegExp(`(${escapeRegExp(trimmed)})`, 'gi');
    const split = text.split(pattern);

    return split
      .filter((v) => v.length > 0)
      .map((value) => ({
        value,
        isMatch: value.toLowerCase() === trimmed.toLowerCase(),
      }));
  }, [text, trimmed]);

  return (
    <>
      {parts.map((p, index) =>
        p.isMatch ? (
          <mark key={index} className={markClassName}>
            {p.value}
          </mark>
        ) : (
          <span key={index}>{p.value}</span>
        ),
      )}
    </>
  );
}
