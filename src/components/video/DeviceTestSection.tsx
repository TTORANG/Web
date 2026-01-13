import { useEffect, useRef, useState } from 'react';

import { ActionButton } from '@/components/common';
import { DeviceSelect, VolumeIndicator } from '@/components/video';
import { useMediaStream } from '@/hooks/useMediaStream';

interface DeviceTestSectionProps {
  onNext: () => void;
}

export const DeviceTestSection = ({ onNext }: DeviceTestSectionProps) => {
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<string | undefined>();
  const [selectedAudio, setSelectedAudio] = useState<string | undefined>();
  const videoRef = useRef<HTMLVideoElement>(null);

  const { stream, volume } = useMediaStream(selectedVideo, selectedAudio);

  useEffect(() => {
    const initDevices = async () => {
      try {
        const tempStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
        tempStream.getTracks().forEach((track) => track.stop());
        const allDevices = await navigator.mediaDevices.enumerateDevices();
        setDevices(allDevices);
        const vInput = allDevices.find((d) => d.kind === 'videoinput');
        const aInput = allDevices.find((d) => d.kind === 'audioinput');
        if (vInput) setSelectedVideo(vInput.deviceId);
        if (aInput) setSelectedAudio(aInput.deviceId);
      } catch (err) {
        /* eslint-disable-next-line no-console */
        console.error('Access denied:', err);
      }
    };
    initDevices();
  }, []);

  useEffect(() => {
    if (videoRef.current && stream) videoRef.current.srcObject = stream;
  }, [stream]);

  return (
    <div className="flex h-full w-full flex-col items-center justify-between py-4">
      <h1 className="shrink-0 text-xl font-bold text-white md:text-2xl">
        웹캠, 마이크를 테스트해주세요.
      </h1>

      {/* 캠 */}
      <div className="flex w-full flex-1 items-center justify-center overflow-hidden shrink min-h-0">
        <div className="relative aspect-[640/359] h-full max-h-[40vh] overflow-hidden rounded-xl border-2 border-[#5162ff] bg-[#2a2d34] shadow-xl">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="h-full w-full object-cover -scale-x-100"
          />
        </div>
      </div>

      {/* 컨트롤 */}
      <div className="grid w-full shrink-0 max-w-[800px] grid-cols-2 gap-x-8 gap-y-4 pt-4">
        <DeviceSelect
          label="웹캠"
          options={devices.filter((d) => d.kind === 'videoinput')}
          selectedValue={selectedVideo ?? ''}
          onChange={setSelectedVideo}
        />
        <div className="flex flex-col gap-2">
          <DeviceSelect
            label="마이크"
            options={devices.filter((d) => d.kind === 'audioinput')}
            selectedValue={selectedAudio ?? ''}
            onChange={setSelectedAudio}
          />
          <div className="space-y-1">
            <VolumeIndicator volume={volume} />
            <p className="text-[10px] text-white/40 ml-1">또랑또랑한 목소리를 들려주세요.</p>
          </div>
        </div>
      </div>

      {/* 버튼 */}
      <div className="mt-6 w-full max-w-[320px] shrink-0">
        <ActionButton text="영상 녹화하기" onClick={onNext} />
      </div>
    </div>
  );
};

export default DeviceTestSection;
