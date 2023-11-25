"use client";

import { _saveDocUpload } from "@/app/_actions/contractors/upload-contractor-doc";
import Btn from "@/components/btn";
import BaseModal from "@/components/modals/base-modal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { closeModal } from "@/lib/modal";
import { uploadFile } from "@/lib/upload-file";
import { IUser } from "@/types/hrm";
// import cloudinary from "@/lib/cloudinary";
import { useRef, useTransition } from "react";
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
    const [loading, startTransition] = useTransition();
    async function uploadImage() {
        startTransition(async () => {
            const { file, ...formData } = form.getValues();
            if (!file) {
                toast.error("Upload a valid image");
            } else {
                const data = await uploadFile(file, "contractor-document");
                console.log(data);
                formData.url = data.public_url;
                await _saveDocUpload(formData);
                toast.success("upload successful");
                closeModal();
            }
        });
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
            Footer={({ data }) => (
                <>
                    <Btn isLoading={loading} onClick={uploadImage}>
                        Upload
                    </Btn>
                </>
            )}
            Content={({ data }) => (
                <div>
                    <div className="">
                        <div className="container mx-auto mt-8">
                            <div className="">
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
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label>Document Info</Label>
                            <Input
                                className=""
                                {...form.register("description")}
                            />
                        </div>
                    </div>
                </div>
            )}
        />
    );
}
