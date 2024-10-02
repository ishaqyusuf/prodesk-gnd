import dayjs from "dayjs";

import relativeTime from "dayjs/plugin/relativeTime";
import isBetween from "dayjs/plugin/isBetween";
import updateLocale from "dayjs/plugin/updateLocale";

// Import any additional plugins or locales if needed
import "dayjs/locale/en";

// Initialize dayjs with relativeTime plugin
dayjs.extend(relativeTime);
dayjs.extend(isBetween);
dayjs.extend(updateLocale);
// dayjs.updateLocale("en", {
//     relativeTime: {
//         past: "%s ago",
//     },
// });
// Set the default locale
dayjs.locale("en");
export default dayjs;
