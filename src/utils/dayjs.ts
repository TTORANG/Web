import dayjs from 'dayjs';
import 'dayjs/locale/ko';
import relativeTime from 'dayjs/plugin/relativeTime';
import updateLocale from 'dayjs/plugin/updateLocale';

// 플러그인 설정
dayjs.extend(relativeTime);
dayjs.extend(updateLocale);

// 한국어 로케일
dayjs.updateLocale('ko', {
  relativeTime: {
    future: '%s 후',
    past: '%s 전',
    s: '방금',
    m: '1분',
    mm: '%d분',
    h: '1시간',
    hh: '%d시간',
    d: '1일',
    dd: '%d일',
    M: '1개월',
    MM: '%d개월',
    y: '1년',
    yy: '%d년',
  },
});

dayjs.locale('ko');

export type ManipulateType = 'second' | 'minute' | 'hour' | 'day' | 'week' | 'month' | 'year';
export default dayjs;
