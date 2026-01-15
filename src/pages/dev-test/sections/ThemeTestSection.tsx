/**
 * @file ThemeTestSection.tsx
 * @description 테마 설정 테스트 섹션
 */
import { useThemeStore } from '@/stores/themeStore';
import type { ThemeMode } from '@/types/theme';

export function ThemeTestSection() {
  const { theme, setTheme } = useThemeStore();

  const options: { value: ThemeMode; label: string }[] = [
    { value: 'light', label: '라이트' },
    { value: 'dark', label: '다크' },
    { value: 'auto', label: '자동' },
  ];

  return (
    <section className="mb-8 rounded-xl border border-gray-200 bg-white p-6">
      <h2 className="mb-4 text-lg font-bold text-black">🎨 테마 설정</h2>

      <div className="mb-4 rounded-lg bg-gray-100 p-4 text-sm text-gray-600">
        <p className="mb-2 font-medium text-black">설명</p>
        <ul className="list-inside list-disc space-y-1">
          <li>라이트: 항상 라이트 모드</li>
          <li>다크: 항상 다크 모드</li>
          <li>자동: 시스템 설정 따름</li>
          <li>설정은 로컬스토리지에 저장됩니다.</li>
        </ul>
      </div>

      <div className="flex gap-3">
        {options.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setTheme(value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              theme === value ? 'bg-main text-white' : 'bg-gray-200 text-black hover:bg-gray-400'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <p className="mt-4 text-sm text-gray-600">
        현재 설정: <span className="font-medium text-black">{theme}</span>
      </p>
    </section>
  );
}
