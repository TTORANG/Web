import { Link } from 'react-router-dom';

import { CommonUITestSection } from './sections/CommonUITestSection';
import { DropdownTestSection } from './sections/DropdownTestSection';
import { ErrorTestSection } from './sections/ErrorTestSection';
import { FeedbackTestSection } from './sections/FeedbackTestSection';
import { FileUploadTestSection } from './sections/FileUploadTestSection';
import { ModalTestSection } from './sections/ModalTestSection';
import { PopoverTestSection } from './sections/PopoverTestSection';
import { SkeletonTestSection } from './sections/SkeletonTestSection';
import { SpinnerTestSection } from './sections/SpinnerTestSection';
import { ThemeTestSection } from './sections/ThemeTestSection';
import { ToastTestSection } from './sections/ToastTestSection';

export default function DevTestPage() {
  return (
    <main className="mx-auto min-h-screen max-w-4xl bg-gray-100 px-6 py-8">
      {/* 헤더 */}
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-black">개발 테스트 페이지</h1>
        <Link to="/" className="text-body-s text-main hover:underline">
          ← 홈으로 돌아가기
        </Link>
      </div>

      <ThemeTestSection />
      <CommonUITestSection />
      <ModalTestSection />
      <PopoverTestSection />
      <DropdownTestSection />
      <ToastTestSection />
      <ErrorTestSection />
      <SkeletonTestSection />
      <SpinnerTestSection />
      <FileUploadTestSection />
      <FeedbackTestSection />

      {/* 컴포넌트 테스트 영역 (확장용) */}
      <section className="rounded-xl border border-dashed border-gray-300 bg-gray-100 p-6">
        <h2 className="mb-4 text-lg font-bold text-gray-600">📦 컴포넌트 테스트 영역</h2>
        <p className="text-sm text-gray-600">새로운 컴포넌트를 테스트할 때 이 영역에 추가하세요.</p>
      </section>
    </main>
  );
}
