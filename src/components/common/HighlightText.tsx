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

export function HighlightText({ text, query, markClassName = 'rounded bg-yellow-200' }: Props) {
  const trimmed = query.trim();

  const parts = useMemo(() => {
    if (!trimmed) return [{ value: text, isMatch: false }];

    // 대소문자 무시 (gi)
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
          // query 공백이면 그냥 원문 출력
          <span key={index}>{p.value}</span>
        ),
      )}
    </>
  );
}
