import { useEffect, useRef, useState } from 'react';

import { ActionButton, Dropdown } from '@/components/common';
import { VolumeIndicator } from '@/components/video';
import { useMediaStream } from '@/hooks/useMediaStream';

interface DeviceTestSectionProps {
  onNext: () => void;
}

export const DeviceTestSection = ({ onNext }: DeviceTestSectionProps) => {
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
        /* eslint-disable-next-line no-console */
        console.error('Device Init Error:', err);
      }
    };
    initDevices();
  }, []);

  useEffect(() => {
    if (videoRef.current && stream && videoRef.current.srcObject !== stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  const renderTrigger = (label: string, value: string, kind: MediaDeviceKind) => {
    const currentDevice = devices.find((d) => d.deviceId === value && d.kind === kind);
    return (
      <div className="flex w-full items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-800 transition-all hover:border-[#5162ff] cursor-pointer">
        <span className="truncate">{currentDevice?.label || `${label} 선택`}</span>
        {/* 화살표 */}
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="ml-2 text-gray-400"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </div>
    );
  };

  return (
    <div className="flex h-full w-full flex-col items-center justify-between py-4">
      <h1 className="shrink-0 text-xl font-bold text-black md:text-2xl">
        웹캠, 마이크를 테스트해주세요.
      </h1>

      <div className="flex w-full flex-1 items-center justify-center min-h-0 shrink py-6">
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

      <div className="grid w-full shrink-0 max-w-200 grid-cols-2 gap-x-8 gap-y-4 text-left">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-black/60 ml-1">웹캠</label>
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

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-black/60 ml-1">마이크</label>
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
          <div className="mt-1 space-y-1">
            <VolumeIndicator volume={volume} />
            <p className="text-[10px] text-black/40 ml-1 leading-none font-medium">
              또랑또랑한 목소리를 들려주세요.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-8 w-full max-w-[320px] shrink-0">
        <ActionButton text="영상 녹화하기" onClick={onNext} />
      </div>
    </div>
  );
};

export default DeviceTestSection;
