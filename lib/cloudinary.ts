"use server";
import { env } from "@/env.mjs";
// import cloudinary from "@cloudinary/react";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
    cloud_name: env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
    api_secret: env.NEXT_PUBLIC_CLOUDINARY_API_SECRET
});
export default cloudinary;
