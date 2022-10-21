import { library } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";

// Add Free Font Awesome Icons
// https://fontawesome.com/v5.15/icons?d=gallery&p=2&s=solid&m=free
import {
    faArrowAltCircleUp,
    faAngleDown,
    faPlus,
    faCog,
    faSearch,
    faSignOutAlt
} from "@fortawesome/free-solid-svg-icons";

library.add(
    faArrowAltCircleUp,
    faAngleDown,
    faPlus,
    faCog,
    faSearch,
    faSignOutAlt
);

export { FontAwesomeIcon };

