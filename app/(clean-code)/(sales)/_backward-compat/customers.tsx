import { Menu } from "@/components/(clean-code)/menu";
import { chunker } from "@/lib/chunker";

import { customerSynchronize, harvestCustomers } from "./customer.action";

export default function Customers({}) {
    function woker() {
        harvestCustomers().then((list) => {
            console.log(list);
            // return;
            chunker({
                worker: customerSynchronize,
                list: list.filteredGroups,
            });
        });
    }
    return <Menu.Item onClick={woker}>Customers</Menu.Item>;
}
