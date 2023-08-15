import dayjs from "dayjs";

import relativeTime from "dayjs/plugin/relativeTime";

// Import any additional plugins or locales if needed
import "dayjs/locale/en";

// Initialize dayjs with relativeTime plugin
dayjs.extend(relativeTime);

// Set the default locale
dayjs.locale("en");
export default dayjs;
