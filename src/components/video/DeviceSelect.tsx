import { Dropdown, type DropdownItem } from '@/components/common/Dropdown';

interface DeviceSelectProps {
  label: string;
  options: MediaDeviceInfo[];
  selectedValue: string;
  onChange: (deviceId: string) => void;
}

/**
 * @description 웹캠, 마이크 장치 선택
 */
const DeviceSelect = ({ label, options, selectedValue, onChange }: DeviceSelectProps) => {
  const dropdownItems: DropdownItem[] =
    options.length > 0
      ? options.map((device) => ({
          id: device.deviceId,
          label: device.label || `${label} ${device.deviceId.slice(0, 5)}`,
          onClick: () => onChange(device.deviceId),
          selected: device.deviceId === selectedValue,
        }))
      : [{ id: 'none', label: '장치 없음', onClick: () => {}, disabled: true }];

  const currentLabel = dropdownItems.find((item) => item.selected)?.label || `${label} 선택`;

  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs font-semibold text-white">{label}</label>
      <Dropdown
        className="w-full"
        menuClassName="w-full"
        trigger={({ isOpen }) => (
          <div className="flex w-full cursor-pointer items-center justify-between rounded-md bg-white p-3 text-sm text-black">
            <span className="truncate">{currentLabel}</span>
            <svg
              className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}
              width="12"
              height="8"
              viewBox="0 0 12 8"
              fill="none"
            >
              <path d="M1 1L6 6L11 1" stroke="#1A1A1A" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
        )}
        items={dropdownItems}
      />
    </div>
  );
};

export default DeviceSelect;
