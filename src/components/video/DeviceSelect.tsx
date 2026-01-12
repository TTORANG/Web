interface DeviceSelectProps {
  label: string;
  options: MediaDeviceInfo[];
  selectedValue: string;
  onChange: (deviceId: string) => void;
}

/**
 * @description 웹캠 및 마이크 선택 컴포넌트
 */
export const DeviceSelect = ({ label, options, selectedValue, onChange }: DeviceSelectProps) => {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs font-semibold text-white">{label}</label>
      <div className="relative">
        <select
          value={selectedValue}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-white text-black p-3 rounded-md text-sm outline-none appearance-none cursor-pointer pr-10"
        >
          {options.length === 0 && <option value="">장치를 찾을 수 없습니다</option>}
          {options.map((device) => (
            <option key={device.deviceId} value={device.deviceId}>
              {device.label || `${label} ${device.deviceId.slice(0, 5)}`}
            </option>
          ))}
        </select>
        {/* 드롭다운 화살표 */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
          <svg
            width="12"
            height="8"
            viewBox="0 0 12 8"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M1 1L6 6L11 1" stroke="#1A1A1A" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
      </div>
    </div>
  );
};
