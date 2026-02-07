import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

import { RecordingEmptySection } from '@/components/video';
import { showToast } from '@/utils/toast';

interface Video {
  id: number;
  projectId: string;
  title: string;
  createdAt: string;
  durationSeconds: number;
  slideCount: number;
  size: number;
  videoData?: string;
  videoUrl?: string;
  thumbnailUrl?: string;
  status: 'processing' | 'ready' | 'failed';
  durations?: { [key: number]: number };
}

const isSafeVideoUrl = (url: string | undefined): boolean => {
  if (!url) return false;

  try {
    if (url.startsWith('data:')) {
      return url.startsWith('data:video/');
    }

    if (url.startsWith('blob:')) {
      return true;
    }

    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
};

const getSafeThumbnailUrl = (url?: string | null): string | undefined => {
  if (!url) return undefined;

  try {
    const parsed = new URL(url, window.location.origin);
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      return parsed.toString();
    }
  } catch {
    return undefined;
  }

  return undefined;
};

const VideoPage = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const [videos, setVideos] = useState<Video[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (location.state?.uploadSuccess) {
      showToast.success('영상이 성공적으로 저장되었습니다!');
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate]);

  useEffect(() => {
    const loadVideos = async () => {
      setIsLoading(true);
      try {
        console.log('📂 영상 목록 로드 시작 - projectId:', projectId);

        const storedData = localStorage.getItem('mockVideos');
        if (!storedData) {
          setVideos([]);
          return;
        }

        const mockVideos: Video[] = JSON.parse(storedData);

        const projectVideos = mockVideos.filter((v) => v.projectId === projectId);

        const sanitizedVideos = projectVideos.map((v) => ({
          ...v,
          videoData: isSafeVideoUrl(v.videoData) ? v.videoData : undefined,
          videoUrl: isSafeVideoUrl(v.videoUrl) ? v.videoUrl : undefined,
          thumbnailUrl: getSafeThumbnailUrl(v.thumbnailUrl),
        }));

        setVideos(sanitizedVideos);
      } catch (error) {
        console.error('영상 목록 로드 실패:', error);
        setVideos([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadVideos();
  }, [projectId, location.state]);

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

  const getSafeVideoSrc = (video: Video): string | undefined => {
    if (video.videoData && isSafeVideoUrl(video.videoData)) {
      return video.videoData;
    }
    if (video.videoUrl && isSafeVideoUrl(video.videoUrl)) {
      return video.videoUrl;
    }
    return undefined;
  };

  const hasVideos = videos.length > 0;

  return (
    <div
      role="tabpanel"
      id="tabpanel-video"
      aria-labelledby="tab-video"
      className="relative h-full w-full overflow-y-auto bg-gray-100"
    >
      {selectedVideo &&
        (() => {
          const safeVideoSrc = getSafeVideoSrc(selectedVideo);

          return (
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
                  {safeVideoSrc ? (
                    <video
                      src={safeVideoSrc}
                      controls
                      autoPlay
                      className="w-full aspect-video bg-black rounded-lg"
                    >
                      Your browser does not support the video tag.
                    </video>
                  ) : (
                    <div className="w-full aspect-video bg-gray-200 rounded-lg flex items-center justify-center">
                      <p className="text-gray-500">영상 데이터를 찾을 수 없습니다</p>
                    </div>
                  )}

                  <div className="mt-4 grid grid-cols-3 gap-4">
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">재생 시간</p>
                      <p className="text-lg font-bold text-gray-900">
                        {selectedVideo.durationSeconds}초
                      </p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">슬라이드 수</p>
                      <p className="text-lg font-bold text-gray-900">
                        {selectedVideo.slideCount}개
                      </p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">파일 크기</p>
                      <p className="text-lg font-bold text-gray-900">
                        {(selectedVideo.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>

                  {selectedVideo.durations && (
                    <div className="mt-4 bg-gray-50 p-4 rounded-lg">
                      <h3 className="text-sm font-bold text-gray-900 mb-2">슬라이드별 소요 시간</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {Object.entries(selectedVideo.durations).map(([slideId, duration]) => (
                          <div key={slideId} className="bg-white p-2 rounded text-center">
                            <p className="text-xs text-gray-500">슬라이드 {slideId}</p>
                            <p className="text-sm font-bold text-gray-900">{duration}초</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })()}

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
            <h1 className="text-body-l-bold text-gray-800">녹화된 영상</h1>
            <p className="text-body-s text-gray-600">발표 연습 영상을 선택해서 확인하세요</p>
          </div>
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <p className="text-body-s text-gray-600">총 {videos.length}개의 영상</p>
              <button
                onClick={handleStart}
                className="flex items-center gap-2 rounded-lg bg-main px-6 py-2.5 text-body-m-bold text-white transition-colors hover:bg-main-variant2"
              >
                영상 녹화하기
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {videos.map((video) => {
                const safeVideoSrc = getSafeVideoSrc(video);
                const safeThumbnail = getSafeThumbnailUrl(video.thumbnailUrl);

                return (
                  <div
                    key={video.id}
                    onClick={() => handleVideoClick(video)}
                    className="group relative cursor-pointer overflow-hidden rounded-lg border border-gray-200 bg-white transition-shadow hover:shadow-md"
                  >
                    {video.status === 'processing' && (
                      <div className="absolute right-2 top-2 z-10 rounded-full bg-warning px-2 py-1 text-caption-bold text-white">
                        처리 중
                      </div>
                    )}

                    <div className="relative flex aspect-video items-center justify-center overflow-hidden bg-gray-200">
                      {safeVideoSrc ? (
                        <>
                          <video src={safeVideoSrc} className="h-full w-full object-cover" />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                            <svg
                              className="h-16 w-16 text-white"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                            </svg>
                          </div>
                        </>
                      ) : safeThumbnail ? (
                        <img
                          src={safeThumbnail}
                          alt={video.title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <svg
                          className="h-12 w-12 text-gray-400"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                        </svg>
                      )}
                    </div>

                    <div className="flex flex-col gap-1 p-4">
                      <h3 className="text-body-m-bold text-gray-800 transition-colors group-hover:text-main">
                        {video.title}
                      </h3>
                      <div className="flex items-center gap-2 text-caption text-gray-600">
                        <span>{video.slideCount}개 슬라이드</span>
                        <span>•</span>
                        <span>{video.durationSeconds}초</span>
                        <span>•</span>
                        <span>{(video.size / 1024 / 1024).toFixed(2)} MB</span>
                      </div>
                      <p className="text-caption text-gray-400">
                        {new Date(video.createdAt).toLocaleString('ko-KR')}
                      </p>
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
