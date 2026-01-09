import { useEffect, useRef, useState } from 'react';

import { ActionButton, DeviceSelect, VolumeIndicator } from '@/components/common';
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
      const allDevices = await navigator.mediaDevices.enumerateDevices();
      setDevices(allDevices);
      const vInput = allDevices.find((d) => d.kind === 'videoinput');
      const aInput = allDevices.find((d) => d.kind === 'audioinput');
      if (vInput) setSelectedVideo(vInput.deviceId);
      if (aInput) setSelectedAudio(aInput.deviceId);
    };
    initDevices();
  }, []);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-200 flex flex-col items-center gap-10">
        <h1 className="text-2xl font-bold">웹캠, 마이크를 테스트해주세요.</h1>

        <div className="w-full aspect-video bg-[#4a4d55] rounded-lg overflow-hidden border-2 border-[#5162ff]">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover -scale-x-100"
          />
        </div>

        <div className="w-full grid grid-cols-2 gap-8">
          <DeviceSelect
            label="웹캠"
            options={devices.filter((d) => d.kind === 'videoinput')}
            selectedValue={selectedVideo}
            onChange={setSelectedVideo}
          />
          <div className="flex flex-col gap-2">
            <DeviceSelect
              label="마이크"
              options={devices.filter((d) => d.kind === 'audioinput')}
              selectedValue={selectedAudio}
              onChange={setSelectedAudio}
            />
            <VolumeIndicator volume={volume} />
            <p className="text-xs text-gray-400">또박또박한 목소리를 들려주세요.</p>
          </div>
        </div>

        <ActionButton text="영상 녹화하기" onClick={onNext} />
      </div>
    </div>
  );
};
