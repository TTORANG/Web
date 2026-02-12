/**
 * @file HighlightText.tsx
 * @description 검색어 일치 부분을 하이라이트 처리하는 텍스트 컴포넌트
 */
import { memo, useMemo } from 'react';

import { normalizeForSearch } from '@/utils/normalizeForSearch';

type Props = {
  text: string;
  query: string;
  highlightClassName?: string;
};

type Range = { start: number; end: number };

/** 원문 text에서 정규화 후에도 남는 문자(문자/숫자)들의 원본 인덱스 매핑 */
function buildNormalizedMap(text: string) {
  const map: number[] = [];
  const normChars: string[] = [];

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    const norm = ch.normalize('NFKC');
    for (const cp of Array.from(norm)) {
      if (/\p{L}|\p{N}/u.test(cp)) {
        map.push(i);
        normChars.push(cp.toLowerCase());
      }
    }
  }

  return { normText: normChars.join(''), map };
}

function mergeRanges(ranges: Range[]) {
  if (ranges.length === 0) return [];
  const sorted = [...ranges].sort((a, b) => a.start - b.start);

  const merged: Range[] = [sorted[0]];
  for (let i = 1; i < sorted.length; i++) {
    const prev = merged[merged.length - 1];
    const current = sorted[i];

    if (current.start <= prev.end) {
      // 겹치는 경우 병합
      prev.end = Math.max(prev.end, current.end);
    } else {
      merged.push(current);
    }
  }
  return merged;
}

function findOrderedTokenRanges(text: string, query: string): Range[] {
  const rawQuery = query.trim();
  if (!rawQuery) return [];
  const tokens = rawQuery
    .split(/\s+/)
    .map((t) => normalizeForSearch(t))
    .filter(Boolean);

  if (tokens.length === 0) return [];

  const { normText, map } = buildNormalizedMap(text);

  let cursor = 0;
  const ranges: Range[] = [];

  for (const token of tokens) {
    const startIdx = normText.indexOf(token, cursor);
    if (startIdx === -1) return []; // 순서대로 못 찾으면 매칭 실패

    const endIdx = startIdx + token.length;
    cursor = endIdx;

    const rawStart = map[startIdx];
    const rawEnd = map[endIdx - 1] + 1; // slice end
    ranges.push({ start: rawStart, end: rawEnd });
  }

  return mergeRanges(ranges);
}

function HighlightTextBase({
  text,
  query,
  highlightClassName = 'bg-transparent text-main',
}: Props) {
  const parts = useMemo(() => {
    const ranges = findOrderedTokenRanges(text, query);
    if (ranges.length === 0) return [{ value: text, isMatch: false }];

    const out: Array<{ value: string; isMatch: boolean }> = [];
    let last = 0;

    for (const range of ranges) {
      if (last < range.start) {
        out.push({ value: text.slice(last, range.start), isMatch: false });
      }
      out.push({ value: text.slice(range.start, range.end), isMatch: true });
      last = range.end;
    }
    if (last < text.length) {
      out.push({ value: text.slice(last), isMatch: false });
    }

    return out.filter((p) => p.value.length > 0);
  }, [text, query]);

  return (
    <>
      {parts.map((p, index) =>
        p.isMatch ? (
          <span key={index} className={highlightClassName}>
            {p.value}
          </span>
        ) : (
          <span key={index}>{p.value}</span>
        ),
      )}
    </>
  );
}

export const HighlightText = memo(HighlightTextBase);
