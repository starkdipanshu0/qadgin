"use client";

import { useFieldArray, Control } from "react-hook-form";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Trash2, Plus } from "lucide-react";
import { toast } from "react-toastify";

interface VariantsEditorProps {
    control: Control<any>; // generic control
    name: string; // field name "variants"
}

export const VariantsEditor = ({ control, name }: VariantsEditorProps) => {
    const { fields, append, remove, update } = useFieldArray({
        control,
        name,
    });

    const handleUpload = async (file: File, index: number) => {
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
                // Merge existing data with new image
                const current = fields[index] as any;
                update(index, { ...current, images: { ...current.images, main: data.secure_url } });
                toast.success("Image uploaded!");
            }
        } catch (e) { toast.error("Upload failed"); }
    };

    return (
        <div className="space-y-4 border p-4 rounded-md bg-stone-50/50">
            <div className="flex justify-between items-center">
                <Label className="text-base font-semibold">Variants</Label>
                <Button type="button" variant="outline" size="sm" onClick={() => append({
                    name: "", sku: "", price: 0, stock: 0, attributes: {}, images: { main: "" }
                })}>
                    <Plus className="w-4 h-4 mr-2" /> Add Variant
                </Button>
            </div>

            <div className="space-y-4">
                {fields.map((field: any, index) => (
                    <div key={field.id} className="p-4 border rounded-md bg-white shadow-sm space-y-4">
                        <div className="flex justify-between items-start">
                            <h4 className="text-sm font-medium text-stone-500">Variant #{index + 1}</h4>
                            <Button type="button" variant="ghost" size="icon" className="h-6 w-6" onClick={() => remove(index)}>
                                <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <Label className="text-xs">Name *</Label>
                                <Input {...control.register(`${name}.${index}.name`)} placeholder="Red / S" />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs">SKU *</Label>
                                <Input {...control.register(`${name}.${index}.sku`)} placeholder="PROD-RED-S" />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs">Price</Label>
                                <Input type="number" {...control.register(`${name}.${index}.price`, { valueAsNumber: true })} />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs">Stock</Label>
                                <Input type="number" {...control.register(`${name}.${index}.stock`, { valueAsNumber: true })} />
                            </div>
                        </div>

                        {/* Image Upload Area */}
                        <div className="space-y-2">
                            <Label className="text-xs">Variant Image</Label>
                            <div className="flex items-center gap-4">
                                {field.images?.main ? (
                                    <div className="relative group">
                                        <img src={field.images.main} alt="Variant" className="w-12 h-12 object-cover rounded border" />
                                    </div>
                                ) : (
                                    <div className="w-12 h-12 bg-gray-100 rounded border flex items-center justify-center text-xs text-gray-400">
                                        None
                                    </div>
                                )}
                                <Input type="file" accept="image/*" className="text-xs h-9 w-full"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) handleUpload(file, index);
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                ))}

                {fields.length === 0 && (
                    <div className="text-center py-8 text-sm text-stone-400 italic">
                        No variants added. Product will use main attributes only.
                    </div>
                )}
            </div>
        </div>
    )
}
