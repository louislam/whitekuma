/*
 * dayjs in not working in Typescript, try to init in js
 * https://github.com/iamkun/dayjs/issues/475
 */

import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(relativeTime);

export {
    dayjs,
    utc, timezone, relativeTime,
};
