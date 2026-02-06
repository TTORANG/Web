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
      <div className="flex w-full items-center justify-between rounded-lg border border-gray-200 bg-white px-5 py-3 text-body-m-bold text-gray-800 transition-all hover:border-main cursor-pointer">
        <span className="truncate">{currentDevice?.label || `${label} 선택`}</span>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="ml-2 shrink-0 text-gray-400"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </div>
    );
  };

  return (
    <div className="flex h-full w-full flex-col items-center justify-between py-4">
      <div className="flex w-full flex-col items-center gap-8">
        <h1 className="text-[1.5rem] font-semibold text-black tracking-tight">
          웹캠, 마이크를 테스트해주세요.
        </h1>

        <div className="flex w-full items-center justify-center min-h-0">
          <div className="relative w-full max-w-160 aspect-video overflow-hidden rounded-xl bg-gray-600">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </div>

      <div className="flex w-full max-w-214.5 gap-4 mt-12">
        <div className="flex flex-1 flex-col gap-2">
          <label className="text-body-m-bold text-black/60 ml-1">웹캠</label>
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
            menuClassName="w-full max-h-60 overflow-y-auto"
          />
        </div>

        <div className="flex flex-1 flex-col gap-2">
          <label className="text-body-m-bold text-black/60 ml-1">마이크</label>
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
            menuClassName="w-full max-h-60 overflow-y-auto"
          />
          <div className="mt-2 flex flex-col gap-2">
            <VolumeIndicator volume={volume} />
            <p className="text-caption text-black/40">또랑또랑한 목소리를 들려주세요.</p>
          </div>
        </div>
      </div>

      <div className="mt-8 w-full max-w-110 text-white">
        <ActionButton
          text="영상 녹화하기"
          onClick={() => {
            if (stream) {
              const clonedStream = stream.clone();
              onComplete({ cam: clonedStream });
            }
          }}
        />
      </div>
    </div>
  );
};
