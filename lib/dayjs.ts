import dayjs from "dayjs";

import relativeTime from "dayjs/plugin/relativeTime";
import isBetween from "dayjs/plugin/isBetween";

// Import any additional plugins or locales if needed
import "dayjs/locale/en";

// Initialize dayjs with relativeTime plugin
dayjs.extend(relativeTime);
dayjs.extend(isBetween);

// Set the default locale
dayjs.locale("en");
export default dayjs;
