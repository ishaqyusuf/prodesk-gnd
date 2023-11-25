"use client";

import BaseModal from "@/components/modals/base-modal";
// import cloudinary from "@/lib/cloudinary";
import { useRef } from "react";

export default function UploadDocumentModal({}) {
    const fileInputRef = useRef(null);
    const handleFileUpload = async () => {
        // 'use server'
        const fileInput = fileInputRef.current as any;
        const file = fileInput?.files?.[0];
        if (file) {
            // Handle file upload logic here
            // const result = await cloudinary.uploader.upload(file.path, {
            //     folder: "contractor-documents" // optional folder in Cloudinary
            // });
            console.log("File selected:", file);
        }
    };
    return (
        <BaseModal
            className="sm:max-w-[500px]"
            onOpen={data => {}}
            modalName="uploadDoc"
            Title={({ data }) => (
                <div className="flex space-x-2 items-center">
                    Upload Document
                </div>
            )}
            Content={({ data }) => (
                <div>
                    <div className="">
                        <div className="container mx-auto mt-8">
                            <div className="max-w-md mx-auto bg-white p-6 rounded-md shadow-md">
                                <h1 className="text-2xl font-semibold mb-4">
                                    Upload Files
                                </h1>
                                <div className="border-dashed border-2 border-gray-400 p-4 mb-4">
                                    <label className="block text-gray-700 text-sm font-bold mb-2">
                                        Select a file
                                    </label>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        className="w-full p-2"
                                        onChange={handleFileUpload}
                                    />
                                </div>
                                <button
                                    className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-700"
                                    onClick={handleFileUpload}
                                >
                                    Upload
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        />
    );
}
