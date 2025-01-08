import Button from "@/components/common/button";
import { txStore } from "./store";
import Money from "@/components/_v1/money";

export default function PayForm({}) {
    const tx = txStore();
    if (!tx.phoneNo) return null;
    return (
        <div className="border-t pt-2 -mb-2 bg-white">
            {!tx.paymentMethod || <div></div>}
            <div className="flex justify-end">
                <Button
                    onClick={() => {
                        tx.dotUpdate("paymentMethod", "terminal");
                    }}
                    disabled={!tx.totalPay}
                >
                    Pay
                    <Money className="ml-2" value={tx.totalPay} />
                </Button>
            </div>
        </div>
    );
}
