import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

import { RecordingEmptySection } from '@/components/video';
import { useProjectVideos } from '@/hooks/useProjectVideos';
import type { VideoPresentation } from '@/types/video';
import { showToast } from '@/utils/toast';

const getSafeThumbnailUrl = (url?: string | null): string | undefined => {
  if (!url) return undefined;
  try {
    const parsed = new URL(url, window.location.origin);
    return parsed.toString();
  } catch {
    return undefined;
  }
};

const VideoPage = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const [selectedVideo, setSelectedVideo] = useState<VideoPresentation | null>(null);

  const {
    data,
    isLoading,
    error: apiError,
  } = useProjectVideos({
    projectId: projectId!,
    sort: 'recent',
    filter: 'all',
  });

  const videos = data?.videos || [];

  useEffect(() => {
    if (location.state?.uploadSuccess) {
      showToast.success('영상을 저장했습니다.');
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate]);

  const handleStart = () => {
    navigate(`/${projectId}/video/record`);
  };

  const handleVideoClick = (video: VideoPresentation) => {
    if (video.status === 'ready') {
      navigate(`/${projectId}/videos/${video.videoId}`);
    } else if (video.status === 'processing') {
      showToast.info('영상을 처리하고 있습니다.', '잠시 후 다시 확인해주세요.');
    } else {
      showToast.error('영상 처리에 실패했습니다.', '다시 녹화해주세요.');
    }
  };

  const handleClosePlayer = () => {
    setSelectedVideo(null);
  };

  if (apiError) {
    showToast.error('영상 목록을 불러오지 못했습니다.');
  }

  const hasVideos = videos.length > 0;

  return (
    <div
      role="tabpanel"
      id="tabpanel-video"
      className="relative h-full w-full overflow-y-auto bg-gray-100"
    >
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
              <div className="w-full aspect-video bg-black rounded-lg flex items-center justify-center">
                <p className="text-white text-body-m">영상 재생 영역</p>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-4">
                <div className="bg-gray-50 p-3 rounded-lg text-center">
                  <p className="text-xs text-gray-500 mb-1">재생 시간</p>
                  <p className="text-lg font-bold text-gray-900">
                    {selectedVideo.durationSeconds}초
                  </p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg text-center">
                  <p className="text-xs text-gray-500 mb-1">조회수</p>
                  <p className="text-lg font-bold text-gray-900">{selectedVideo.viewCount}회</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg text-center">
                  <p className="text-xs text-gray-500 mb-1">피드백</p>
                  <p className="text-lg font-bold text-gray-900">{selectedVideo.commentCount}개</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex h-full items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-main border-t-transparent" />
        </div>
      ) : !hasVideos ? (
        <div className="flex h-full items-center justify-center">
          <RecordingEmptySection onStart={handleStart} />
        </div>
      ) : (
        <div className="flex h-full flex-col px-18 py-8">
          <div className="mb-6 flex flex-col gap-1">
            <h1 className="text-body-l-bold text-gray-800">녹화된 연습 영상</h1>
            <p className="text-body-s text-gray-600">발표 연습 기록을 확인하세요.</p>
          </div>
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <p className="text-body-s text-gray-600">총 {videos.length}개의 영상</p>
              <button
                onClick={handleStart}
                className="rounded-lg bg-main px-6 py-2.5 text-body-m-bold text-white transition-colors hover:bg-main-variant2"
              >
                새 연습 시작하기
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {videos.map((video) => {
                const safeThumbnail = getSafeThumbnailUrl(video.thumbnailUrl);
                return (
                  <div
                    key={video.videoId}
                    onClick={() => handleVideoClick(video)}
                    className="group cursor-pointer overflow-hidden rounded-lg border border-gray-200 bg-white transition-shadow hover:shadow-md"
                  >
                    <div className="relative aspect-video bg-gray-200">
                      {video.status === 'processing' && (
                        <div className="absolute left-2 top-2 z-10 rounded-full bg-warning px-2 py-1 text-caption-bold text-white">
                          처리 중
                        </div>
                      )}
                      {safeThumbnail ? (
                        <img
                          src={safeThumbnail}
                          alt={video.title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-gray-400">
                          <svg className="h-12 w-12" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                          </svg>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-1 p-4">
                      <h3 className="text-body-m-bold text-gray-800 truncate group-hover:text-main">
                        {video.title}
                      </h3>
                      <div className="flex items-center gap-2 text-caption text-gray-600">
                        <span>{video.durationSeconds}초</span>
                        <span>•</span>
                        <span>피드백 {video.commentCount}개</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoPage;
