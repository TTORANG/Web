/**
 * WebSocket 연결 상태를 표시하는 디버그 컴포넌트
 * 개발 환경에서만 표시되며, 실시간 연결 상태를 확인할 수 있습니다.
 */
import { useState } from 'react';

interface WebSocketDebugProps {
  isConnected: boolean;
  currentRooms: string[];
  projectId?: string;
  onJoinProject?: (projectId: string) => void;
  onLeaveProject?: (projectId: string) => void;
  onGetRooms?: () => void;
}

export default function WebSocketDebug({
  isConnected,
  currentRooms,
  projectId,
  onJoinProject,
  onLeaveProject,
  onGetRooms,
}: WebSocketDebugProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // 프로덕션 환경에서는 렌더링하지 않음
  if (import.meta.env.PROD) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-[9999] font-mono text-xs">
      {/* 토글 버튼 */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`flex items-center gap-2 rounded-lg px-3 py-2 shadow-lg transition-colors ${
          isConnected
            ? 'bg-green-500 hover:bg-green-600 text-white'
            : 'bg-red-500 hover:bg-red-600 text-white'
        }`}
      >
        <span
          className={`h-2 w-2 rounded-full ${isConnected ? 'bg-white' : 'bg-white/50'} animate-pulse`}
        />
        <span>WS {isConnected ? 'Connected' : 'Disconnected'}</span>
        <span className="text-white/70">{isExpanded ? '▼' : '▲'}</span>
      </button>

      {/* 상세 정보 패널 */}
      {isExpanded && (
        <div className="mt-2 rounded-lg bg-gray-900 p-4 shadow-2xl text-white max-w-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-sm">WebSocket Debug</h3>
            <button
              onClick={() => setIsExpanded(false)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>

          {/* 연결 상태 */}
          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-2">
              <span className="text-gray-400">상태:</span>
              <span className={isConnected ? 'text-green-400' : 'text-red-400'}>
                {isConnected ? '✓ 연결됨' : '✗ 연결 안 됨'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-gray-400">프로젝트:</span>
              <span className="text-blue-400">{projectId || 'N/A'}</span>
            </div>
          </div>

          {/* Room 목록 */}
          <div className="mb-4">
            <div className="text-gray-400 mb-1">참여 중인 Room:</div>
            {currentRooms.length > 0 ? (
              <ul className="space-y-1 pl-2">
                {currentRooms.map((room) => (
                  <li key={room} className="text-yellow-400">
                    • {room}
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-gray-500 pl-2">참여 중인 Room 없음</div>
            )}
          </div>

          {/* 액션 버튼 */}
          <div className="flex flex-col gap-2">
            {projectId && onJoinProject && (
              <button
                onClick={() => onJoinProject(projectId)}
                disabled={!isConnected}
                className="rounded px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:text-gray-500 transition-colors"
              >
                Join Project {projectId}
              </button>
            )}

            {projectId && onLeaveProject && (
              <button
                onClick={() => onLeaveProject(projectId)}
                disabled={!isConnected}
                className="rounded px-3 py-1.5 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-700 disabled:text-gray-500 transition-colors"
              >
                Leave Project {projectId}
              </button>
            )}

            {onGetRooms && (
              <button
                onClick={onGetRooms}
                disabled={!isConnected}
                className="rounded px-3 py-1.5 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:text-gray-500 transition-colors"
              >
                Get Rooms
              </button>
            )}
          </div>

          {/* 서버 URL 표시 */}
          <div className="mt-4 pt-3 border-t border-gray-700">
            <div className="text-gray-500 text-[10px]">
              Server: {import.meta.env.VITE_API_URL || 'Default'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
