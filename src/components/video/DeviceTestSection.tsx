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
    <div className="flex-1 flex flex-col items-center justify-center p-6 text-white">
      <div className="w-full max-w-[800px] flex flex-col items-center gap-10">
        {/* 제목 */}
        <h1 className="text-2xl font-bold font-sans tracking-tight">
          웹캠, 마이크를 테스트해주세요.
        </h1>

        {/* 프리뷰 */}
        <div className="w-full aspect-video bg-[#2a2d34] rounded-xl overflow-hidden border-2 border-[#5162ff] shadow-2xl">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover -scale-x-100"
          />
        </div>

        {/* 설정 */}
        <div className="w-full grid grid-cols-2 gap-8">
          <DeviceSelect
            label="웹캠"
            options={devices.filter((d) => d.kind === 'videoinput')}
            selectedValue={selectedVideo}
            onChange={setSelectedVideo}
          />

          <div className="flex flex-col gap-4">
            <DeviceSelect
              label="마이크"
              options={devices.filter((d) => d.kind === 'audioinput')}
              selectedValue={selectedAudio}
              onChange={setSelectedAudio}
            />
            <div className="space-y-2">
              <VolumeIndicator volume={volume} />
              <p className="text-[11px] text-white/40 ml-1">또박또박한 목소리를 들려주세요.</p>
            </div>
          </div>
        </div>

        {/* 실행 */}
        <div className="w-full max-w-[400px] pt-4">
          <div className="w-full py-4 text-lg font-bold">
            <ActionButton text="영상 녹화하기" onClick={onNext} />
          </div>
        </div>
      </div>
    </div>
  );
};
