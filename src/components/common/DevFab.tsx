import GanadiIcon from '@/assets/icons/ganadi.webp';

export function DevFab() {
  // 개발 환경이 아니면 렌더링하지 않음
  if (!import.meta.env.DEV) return null;

  return (
    <a
      href="/dev"
      className="fixed bottom-6 left-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#eeeeee] shadow-xl transition hover:scale-110 active:scale-95 overflow-hidden border border-gray-200"
      aria-label="개발 테스트 페이지로 이동"
      title="개발 테스트 페이지"
    >
      <img src={GanadiIcon} alt="DEV" className="h-full w-full object-cover" />
    </a>
  );
}
