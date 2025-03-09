"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Icons } from "@/components/_v1/icons";
import { CheckCircle, XCircle } from "lucide-react";

export default function PaymentResponsePage({ params }) {
    const { emailToken, slug, paymentId } = params;
    const [status, setStatus] = useState("processing");
    const router = useRouter();

    const hasRun = useRef(false);
    useEffect(() => {
        if (hasRun.current) return; // prevent second run
        hasRun.current = true; // mark as run
        const processPayment = async () => {
            await new Promise((resolve) => setTimeout(resolve, 3000)); // Simulate processing delay
            // const response = await salesPaymentCheckoutResponse({
            //     emailToken,
            //     slug,
            //     paymentId,
            // });
            // setStatus("error");
            setStatus("success");
            // setStatus(response.status);
        };
        processPayment();
    }, [emailToken, slug, paymentId]);

    const getStatusMessage = () => {
        switch (status) {
            case "success":
                return {
                    text: "Payment Successful!",
                    color: "text-green-600",
                    icon: <CheckCircle className="w-12 h-12 text-green-500" />,
                };
            case "error":
                return {
                    text: "Payment Failed!",
                    color: "text-red-600",
                    icon: <XCircle className="w-12 h-12 text-red-500" />,
                };
            default:
                return {
                    text: "Processing Transaction...",
                    color: "text-blue-600",
                    icon: (
                        <Icons.spinner className="w-12 h-12 animate-spin text-blue-500" />
                    ),
                };
        }
    };

    const { text, color, icon } = getStatusMessage();

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="bg-white shadow-lg rounded-lg p-6 w-full max-w-md text-center"
            >
                <div className="flex flex-col items-center space-y-4">
                    {icon}
                    <motion.p
                        key={status} // Animate on status change
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className={`text-xl font-semibold ${color}`}
                    >
                        {text}
                    </motion.p>

                    {status === "success" && (
                        <motion.button
                            whileTap={{ scale: 0.95 }}
                            className="mt-4 w-full bg-green-600 text-white py-2 rounded-lg shadow hover:bg-green-700 transition"
                            onClick={() => router.push("/dashboard")} // Redirect to dashboard or another page
                        >
                            Go to Dashboard
                        </motion.button>
                    )}

                    {status === "error" && (
                        <motion.button
                            whileTap={{ scale: 0.95 }}
                            className="mt-4 w-full bg-red-600 text-white py-2 rounded-lg shadow hover:bg-red-700 transition"
                            onClick={() => router.push("/retry-payment")} // Retry payment if needed
                        >
                            Retry Payment
                        </motion.button>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
