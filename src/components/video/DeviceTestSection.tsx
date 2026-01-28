import { useEffect, useRef, useState } from 'react';

import { ActionButton, Dropdown } from '@/components/common';
import { VolumeIndicator } from '@/components/video';
import { useMediaStream } from '@/hooks/useMediaStream';

interface DeviceTestSectionProps {
  onComplete: (streams: { cam: MediaStream }) => void;
}

export const DeviceTestSection = ({ onComplete }: DeviceTestSectionProps) => {
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<string>('');
  const [selectedAudio, setSelectedAudio] = useState<string>('');
  const videoRef = useRef<HTMLVideoElement>(null);

  const { stream, volume } = useMediaStream(selectedVideo, selectedAudio);

  useEffect(() => {
    const initDevices = async () => {
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
        const allDevices = await navigator.mediaDevices.enumerateDevices();
        setDevices(allDevices);
        const vInput = allDevices.find((d) => d.kind === 'videoinput');
        const aInput = allDevices.find((d) => d.kind === 'audioinput');
        if (vInput) setSelectedVideo(vInput.deviceId);
        if (aInput) setSelectedAudio(aInput.deviceId);
      } catch (err) {
        console.error('Device Init Error:', err);
      }
    };
    initDevices();
  }, []);

  useEffect(() => {
    if (videoRef.current && stream) videoRef.current.srcObject = stream;
  }, [stream]);

  const renderTrigger = (label: string, value: string, kind: MediaDeviceKind) => {
    const currentDevice = devices.find((d) => d.deviceId === value && d.kind === kind);
    return (
      <div className="flex w-full items-center justify-between rounded-lg border border-gray-200 bg-white px-[1rem] py-[0.625rem] text-[0.875rem] text-gray-800 transition-all hover:border-main cursor-pointer">
        <span className="truncate">{currentDevice?.label || `${label} 선택`}</span>
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="ml-[0.5rem] text-gray-400"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </div>
    );
  };

  return (
    <div className="flex h-full w-full flex-col items-center justify-between py-[1rem]">
      <h1 className="text-[1.25rem] font-bold text-black md:text-[1.5rem]">
        웹캠, 마이크를 테스트해주세요.
      </h1>

      <div className="flex w-full flex-1 items-center justify-center py-[1.5rem] min-h-0">
        <div className="relative aspect-video h-full max-h-[45vh] overflow-hidden rounded-xl border-2 border-main bg-gray-200 shadow-xl">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="h-full w-full object-cover -scale-x-100"
          />
        </div>
      </div>

      <div className="grid w-full max-w-[50rem] grid-cols-2 gap-[2rem] text-left">
        <div className="flex flex-col gap-[0.5rem]">
          <label className="text-[0.875rem] font-medium text-black/60 ml-[0.25rem]">웹캠</label>
          <Dropdown
            trigger={renderTrigger('웹캠', selectedVideo, 'videoinput')}
            items={devices
              .filter((d) => d.kind === 'videoinput')
              .map((d) => ({
                id: d.deviceId,
                label: d.label,
                selected: d.deviceId === selectedVideo,
                onClick: () => setSelectedVideo(d.deviceId),
              }))}
            className="w-full"
            menuClassName="w-full max-h-[15rem] overflow-y-auto"
          />
        </div>

        <div className="flex flex-col gap-[0.5rem]">
          <label className="text-[0.875rem] font-medium text-black/60 ml-[0.25rem]">마이크</label>
          <Dropdown
            trigger={renderTrigger('마이크', selectedAudio, 'audioinput')}
            items={devices
              .filter((d) => d.kind === 'audioinput')
              .map((d) => ({
                id: d.deviceId,
                label: d.label,
                selected: d.deviceId === selectedAudio,
                onClick: () => setSelectedAudio(d.deviceId),
              }))}
            className="w-full"
            menuClassName="w-full max-h-[15rem] overflow-y-auto"
          />
          <div className="mt-[0.25rem]">
            <VolumeIndicator volume={volume} />
            <p className="text-[0.625rem] text-black/40 ml-[0.25rem] mt-[0.25rem] font-medium">
              또랑또랑한 목소리를 들려주세요.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-[2rem] w-full max-w-[27.5rem]">
        <ActionButton text="영상 녹화하기" onClick={() => stream && onComplete({ cam: stream })} />
      </div>
    </div>
  );
};
