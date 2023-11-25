"use client";

import { _saveDocUpload } from "@/app/_actions/contractors/upload-contractor-doc";
import BaseModal from "@/components/modals/base-modal";
import { closeModal } from "@/lib/modal";
import { uploadFile } from "@/lib/upload-file";
import { IUser } from "@/types/hrm";
// import cloudinary from "@/lib/cloudinary";
import { useRef } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

export default function UploadDocumentModal({}) {
    const fileInputRef = useRef(null);
    const form = useForm({
        defaultValues: {
            file: null,
            description: null,
            url: null,
            userId: null,
            meta: {}
        }
    });
    async function uploadImage() {
        const { file, ...formData } = form.getValues();
        if (!file) {
            toast.error("Upload a valid image");
        } else {
            const data = await uploadFile(file, "contractor-document");
            formData.url = data.public_url;
            await _saveDocUpload(formData);
            toast.success("upload successful");
            closeModal();
        }
    }
    const handleFileUpload = async () => {
        // 'use server'
        const fileInput = fileInputRef.current as any;
        const file = fileInput?.files?.[0];
        if (file) {
            form.setValue("file", file);
        }
    };
    return (
        <BaseModal<IUser>
            className="sm:max-w-[500px]"
            onOpen={data => {
                form.reset({
                    userId: data?.id,
                    meta: {}
                } as any);
            }}
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
                                        accept="image/*"
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
