import 'axios';

declare module 'axios' {
  export interface AxiosError {
    /**
     * 에러 처리 완료 여부 플래그
     * Axios 응답 인터셉터에서 이미 처리된 에러(예: 401, 500)를
     * TanStack Query 등 하위 레이어에서 중복 처리하지 않도록 표시합니다.
     */
    isHandled?: boolean;
  }
}
