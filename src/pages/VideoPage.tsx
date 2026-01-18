import { useNavigate, useParams } from 'react-router-dom';

import { RecordingEmptySection } from '@/components/video';

const VideoPage = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();

  const handleStart = () => {
    navigate(`/${projectId}/video/record`);
  };

  return (
    <div className="relative h-full w-full bg-gray-100">
      <div className="flex h-full items-center justify-center p-4">
        <RecordingEmptySection onStart={handleStart} />
      </div>
    </div>
  );
};

export default VideoPage;
