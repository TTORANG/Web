/**
 * @file LoginButton.tsx
 * @description 로그인 버튼 컴포넌트
 *
 * 헤더 우측에 표시되는 로그인 링크입니다.
 */
import { Link } from 'react-router-dom';

export function LoginButton() {
  return (
    <Link to="/login" className="flex items-center gap-1 text-body-s-bold text-gray-800">
      로그인
    </Link>
  );
}
