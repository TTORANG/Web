/**
 * @file TextField.tsx
 * @description 공용 텍스트 입력 필드 컴포넌트
 */
import { type ComponentPropsWithoutRef, forwardRef } from 'react';

import clsx from 'clsx';

type Props = ComponentPropsWithoutRef<'input'>;

export const TextField = forwardRef<HTMLInputElement, Props>(
  ({ className, disabled, ...rest }, ref) => {
    return (
      <input
        ref={ref}
        disabled={disabled}
        className={clsx(
          'w-full rounded-lg border border-gray-200 px-3 py-2 text-body-m text-gray-800 transition-colors',
          'placeholder:text-gray-400',
          'hover:border-main',
          'focus:border-main focus:outline-none',
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-gray-200',
          className,
        )}
        {...rest}
      />
    );
  },
);

TextField.displayName = 'TextField';
