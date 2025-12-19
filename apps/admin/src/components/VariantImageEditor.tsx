"use client";

import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { toast } from "react-toastify";
import { X } from "lucide-react";

interface VariantImageEditorProps {
    attributes: Record<string, string[]>;
    value: Record<string, { main: string; gallery?: string[] }>;
    onChange: (value: Record<string, { main: string; gallery?: string[] }>) => void;
}

export const VariantImageEditor = ({ attributes, value, onChange }: VariantImageEditorProps) => {
    // 1. Extract all possible values from attributes (e.g. "Red", "Blue", "Small", "Large")
    // We flatten them into a unique list.
    const allValues = Array.from(
        new Set(Object.values(attributes).flat())
    ).filter((v) => v);

    const handleUpload = async (file: File, variantKey: string) => {
        try {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("upload_preset", "ecommerce");

            const res = await fetch(
                `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
                { method: "POST", body: formData }
            );
            const data = await res.json();

            if (data.secure_url) {
                const newValue = { ...value };
                newValue[variantKey] = {
                    ...newValue[variantKey],
                    main: data.secure_url
                };
                onChange(newValue);
                toast.success(`Image uploaded for ${variantKey}`);
            }
        } catch (err) {
            toast.error("Upload failed");
        }
    };

    const removeImage = (variantKey: string) => {
        const newValue = { ...value };
        delete newValue[variantKey];
        onChange(newValue);
    };

    if (allValues.length === 0) {
        return <div className="text-sm text-muted-foreground italic">Add attributes to enable variant image uploads.</div>
    }

    return (
        <div className="space-y-4 border p-4 rounded-md bg-slate-50">
            <Label className="text-base font-semibold">Variant Images</Label>
            <p className="text-xs text-muted-foreground mb-4">Upload images for specific attribute values (e.g. specific image for "Red").</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {allValues.map((variantKey) => {
                    const existingImage = value?.[variantKey]?.main;

                    return (
                        <div key={variantKey} className="flex items-center gap-3 p-2 bg-white rounded border">
                            <div className="flex-1 min-w-0">
                                <span className="text-sm font-medium block truncate">{variantKey}</span>
                            </div>

                            {existingImage ? (
                                <div className="relative group shrink-0">
                                    <img src={existingImage} alt={variantKey} className="w-10 h-10 rounded object-cover border" />
                                    <button
                                        onClick={(e) => { e.preventDefault(); removeImage(variantKey); }}
                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </div>
                            ) : (
                                <div className="shrink-0">
                                    <Input
                                        type="file"
                                        accept="image/*"
                                        className="w-[180px] h-8 text-xs file:text-xs"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) handleUpload(file, variantKey);
                                        }}
                                    />
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
