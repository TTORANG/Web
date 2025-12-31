import { Link } from 'react-router-dom';

export function LoginButton() {
  return (
    <Link to="/login" className="flex items-center gap-1 text-body-s-bold text-gray-800">
      로그인
    </Link>
  );
}
