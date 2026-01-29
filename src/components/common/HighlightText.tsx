import { useMemo } from 'react';

type Props = {
  text: string;
  query: string;
  highlightClassName?: string;
};

/** 검색 로직(useProjectList)과 동일 : 공백 제거 + 소문자화 */
function normalizeForSearch(value: string) {
  return value.replace(/\s+/g, '').toLowerCase();
}

/** 원문 text에서 '공백이 아닌 문자'의 인덱스만 모아둔 매핑 */
function buildNonSpaceIndexMap(text: string) {
  const map: number[] = [];
  for (let i = 0; i < text.length; i++) {
    if (!/\s/.test(text[i])) map.push(i);
  }
  return map;
}

export function HighlightText({
  text,
  query,
  highlightClassName = 'bg-transparent text-main',
}: Props) {
  const parts = useMemo(() => {
    const rawQuery = query.trim();
    if (!rawQuery) return [{ value: text, isMatch: false }];

    const normText = normalizeForSearch(text);
    const normQuery = normalizeForSearch(rawQuery);
    if (!normQuery) return [{ value: text, isMatch: false }];

    // 공백 제거 기준으로 매핑 위치 찾기
    const start = normText.indexOf(normQuery);
    if (start === -1) return [{ value: text, isMatch: false }];

    // normText 인덱스 => 원문 text 인덱스 변환
    const map = buildNonSpaceIndexMap(text);

    const rawStart = map[start];
    const rawEnd = map[start + normQuery.length - 1] + 1; // slice end

    return [
      { value: text.slice(0, rawStart), isMatch: false },
      { value: text.slice(rawStart, rawEnd), isMatch: true },
      { value: text.slice(rawEnd), isMatch: false },
    ].filter((p) => p.value.length > 0);
  }, [text, query]);

  return (
    <>
      {parts.map((p, index) =>
        p.isMatch ? (
          <span key={index} className={highlightClassName}>
            {p.value}
          </span>
        ) : (
          // query 공백이면 그냥 원문 출력
          <span key={index}>{p.value}</span>
        ),
      )}
    </>
  );
}
