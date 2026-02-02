// src/pages/VideoPage.tsx
import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

import { RecordingEmptySection } from '@/components/video';

// import { videosApi } from '@/api/endpoints/videos'; // 실제 API 연동 시 사용

interface Video {
  id: number;
  projectId: string;
  title: string;
  createdAt: string;
  durationSeconds: number;
  slideCount: number;
  size: number;
  videoUrl?: string; // HLS URL
  thumbnailUrl?: string;
  status: 'processing' | 'ready' | 'failed';
}

const VideoPage = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const [videos, setVideos] = useState<Video[]>([]);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // 업로드 성공 토스트
  useEffect(() => {
    if (location.state?.uploadSuccess) {
      setShowSuccessToast(true);
      navigate(location.pathname, { replace: true, state: {} });
      const timer = setTimeout(() => setShowSuccessToast(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [location, navigate]);

  // 영상 목록 로드
  useEffect(() => {
    const loadVideos = async () => {
      setIsLoading(true);
      try {
        // TODO: 실제 API 호출로 교체
        // const response = await videosApi.getProjectVideos(projectId);
        // setVideos(response.data.videos);

        // 임시: localStorage에서 로드 (개발 중)
        const storedData = localStorage.getItem('mockVideos');
        if (storedData) {
          const mockVideos: Video[] = JSON.parse(storedData);
          const projectVideos = mockVideos.filter((v) => v.projectId === projectId);
          setVideos(projectVideos);
          console.log('📂 로드된 영상 수:', projectVideos.length);
        }
      } catch (error) {
        console.error('영상 목록 로드 실패:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadVideos();
  }, [projectId]);

  const handleStart = () => {
    navigate(`/${projectId}/video/record`);
  };

  const handleVideoClick = (video: Video) => {
    if (video.status === 'ready') {
      setSelectedVideo(video);
    } else if (video.status === 'processing') {
      alert('영상이 처리 중입니다. 잠시 후 다시 시도해주세요.');
    } else {
      alert('영상 처리에 실패했습니다.');
    }
  };

  const handleClosePlayer = () => {
    setSelectedVideo(null);
  };

  const hasVideos = videos.length > 0;

  return (
    <div className="relative h-full w-full bg-gray-100">
      {/* 성공 토스트 */}
      {showSuccessToast && (
        <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-slide-in">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
          <span className="font-medium">
            영상이 업로드되었습니다! 처리가 완료되면 확인할 수 있습니다.
          </span>
        </div>
      )}

      {/* 영상 플레이어 모달 */}
      {selectedVideo && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-5xl w-full max-h-[90vh] overflow-auto">
            <div className="flex items-center justify-between p-4 border-b">
              <div>
                <h2 className="text-xl font-bold text-gray-900">{selectedVideo.title}</h2>
                <p className="text-sm text-gray-500">
                  {new Date(selectedVideo.createdAt).toLocaleString('ko-KR')}
                </p>
              </div>
              <button
                onClick={handleClosePlayer}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="p-4">
              {selectedVideo.videoUrl ? (
                <video
                  src={selectedVideo.videoUrl}
                  controls
                  autoPlay
                  className="w-full aspect-video bg-black rounded-lg"
                >
                  Your browser does not support the video tag.
                </video>
              ) : (
                <div className="w-full aspect-video bg-gray-200 rounded-lg flex items-center justify-center">
                  <p className="text-gray-500">영상 처리 중입니다</p>
                </div>
              )}

              {/* 영상 정보 */}
              <div className="mt-4 grid grid-cols-3 gap-4">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">재생 시간</p>
                  <p className="text-lg font-bold text-gray-900">
                    {selectedVideo.durationSeconds}초
                  </p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">슬라이드 수</p>
                  <p className="text-lg font-bold text-gray-900">{selectedVideo.slideCount}개</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">상태</p>
                  <p className="text-lg font-bold text-gray-900">
                    {selectedVideo.status === 'ready' ? '완료' : '처리 중'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex h-full flex-col p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">녹화된 영상</h1>
          <p className="text-gray-600">발표 연습 영상을 선택해서 확인하세요</p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center flex-1">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent" />
          </div>
        ) : !hasVideos ? (
          <div className="flex flex-1 items-center justify-center">
            <RecordingEmptySection onStart={handleStart} />
          </div>
        ) : (
          <div className="flex-1">
            <div className="mb-4 flex justify-between items-center">
              <p className="text-sm text-gray-600">총 {videos.length}개의 영상</p>
              <button
                onClick={handleStart}
                className="bg-blue-500 text-white px-6 py-2.5 rounded-lg font-bold hover:bg-blue-600 transition"
              >
                영상 녹화하기
              </button>
            </div>

            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {videos.map((video) => (
                <div
                  key={video.id}
                  onClick={() => handleVideoClick(video)}
                  className="bg-white rounded-lg p-4 shadow hover:shadow-md transition cursor-pointer group relative"
                >
                  {/* 처리 중 배지 */}
                  {video.status === 'processing' && (
                    <div className="absolute top-2 right-2 z-10 bg-yellow-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                      처리 중
                    </div>
                  )}

                  <div className="aspect-video bg-gray-200 rounded mb-3 flex items-center justify-center relative overflow-hidden">
                    {video.thumbnailUrl ? (
                      <img
                        src={video.thumbnailUrl}
                        alt={video.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <svg
                        className="w-12 h-12 text-gray-400"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                      </svg>
                    )}
                    {video.status === 'ready' && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                        <svg
                          className="w-16 h-16 text-white"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <h3 className="font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition">
                    {video.title}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span>{video.slideCount}개 슬라이드</span>
                    <span>•</span>
                    <span>{video.durationSeconds}초</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">
                    {new Date(video.createdAt).toLocaleString('ko-KR')}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoPage;
