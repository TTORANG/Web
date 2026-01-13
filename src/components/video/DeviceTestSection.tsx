/* eslint-disable no-console */
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
        console.error('Media device access denied:', err);
      }
    };

    initDevices();
  }, []);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center text-white overflow-hidden p-4">
      <div className="w-full max-w-[800px] max-h-full flex flex-col items-center justify-between gap-4 py-2">
        <h1 className="text-xl md:text-2xl font-bold shrink-0">웹캠, 마이크를 테스트해주세요.</h1>

        <div className="w-full flex-1 min-h-[200px] max-h-[450px] aspect-video bg-[#2a2d34] rounded-xl overflow-hidden border-2 border-[#5162ff] shadow-xl shrink">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover -scale-x-100"
          />
        </div>

        <div className="w-full grid grid-cols-2 gap-4 md:gap-8 shrink-0">
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
              <p className="text-[10px] text-white/40 ml-1 leading-none">
                또랑또랑한 목소리를 들려주세요.
              </p>
            </div>
          </div>
        </div>

        <div className="w-full max-w-[320px] shrink-0 mt-2">
          <ActionButton text="영상 녹화하기" onClick={onNext} />
        </div>
      </div>
    </div>
  );
};
