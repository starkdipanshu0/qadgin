"use client";

import { AttributeEditor } from "./AttributeEditor";
import { VariantsEditor } from "./VariantsEditor";
import {
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Checkbox } from "./ui/checkbox";
import { ScrollArea } from "./ui/scroll-area";
import { CategoryType } from "@repo/types";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { useAuth } from "@clerk/nextjs";



const ProductFormSchema = z.object({
  name: z.string({ message: "Product name is required!" }).min(1, { message: "Product name is required!" }),
  tagline: z.string({ message: "Tagline is required!" }).min(1, { message: "Tagline is required!" }),
  shortDescription: z.string({ message: "Short description is required!" }).min(1).max(160),
  description: z.string({ message: "Description is required!" }).min(1),
  // Price/Original removed from main
  categoryId: z.string({ message: "Category is required!" }).min(1),

  // New Generic Attributes
  attributes: z.record(z.string(), z.array(z.string())).optional(),

  // New Image Structure
  images: z.object({
    main: z.string().min(1, { message: "Main image is required!" }),
    gallery: z.array(z.string()).optional(),
  }),

  // Variants (Mandatory now)
  variants: z.array(z.object({
    name: z.string().min(1, { message: "Name required" }),
    sku: z.string().min(1, { message: "SKU required" }),
    price: z.number().min(0),
    originalPrice: z.number().optional(),
    stock: z.number().default(0),
    attributes: z.record(z.string(), z.any()).optional(),
    images: z.object({
      main: z.string().nullable().optional(),
      gallery: z.array(z.string()).optional()
    }).optional(),
    description: z.string().optional()
  })).min(1, { message: "At least one variant is required to set the price!" }),
});

const fetchCategories = async () => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_PRODUCT_SERVICE_URL}/categories`
  );

  if (!res.ok) {
    throw new Error("Failed to fetch categories!");
  }

  return await res.json();
};

const AddProduct = () => {
  const form = useForm<z.infer<typeof ProductFormSchema>>({
    resolver: zodResolver(ProductFormSchema),
    defaultValues: {
      name: "",
      shortDescription: "",
      description: "",
      // price removed
      tagline: "",
      categoryId: "", // default empty
      attributes: {},
      images: {
        main: "",
        gallery: [],
      },
      variants: [],
    },
  });

  const { isPending, error, data } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });

  const { getToken } = useAuth();

  const mutation = useMutation({
    mutationFn: async (data: z.infer<typeof ProductFormSchema>) => {
      const token = await getToken();
      const payload = {
        ...data,
        categoryId: Number(data.categoryId), // Convert to number for backend
      };
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_PRODUCT_SERVICE_URL}/products`,
        {
          method: "POST",
          body: JSON.stringify(payload),
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!res.ok) {
        throw new Error("Failed to create product!");
      }
    },
    onSuccess: () => {
      toast.success("Product created successfully");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  return (
    <SheetContent>
      <ScrollArea className="h-screen">
        <SheetHeader>
          <SheetTitle className="mb-4">Add Product</SheetTitle>
          <SheetDescription asChild>
            <Form {...form}>
              <form
                className="space-y-8"
                onSubmit={form.handleSubmit((data) => mutation.mutate(data))}
              >
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormDescription>
                        Enter the name of the product.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="tagline"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tagline</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormDescription>
                        Enter the tagline of the product.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="shortDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Short Description</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormDescription>
                        Enter the short description of the product.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea {...field} />
                      </FormControl>
                      <FormDescription>
                        Enter the description of the product.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* Price Fields Removed */}
                {data && (
                  <FormField
                    control={form.control}
                    control={form.control}
                    name="categoryId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <FormControl>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                            <SelectContent>
                              {data.map((cat: CategoryType) => (
                                <SelectItem key={cat.id} value={String(cat.id)}>
                                  {cat.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormDescription>
                          Select the category.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {/* MAIN IMAGE UPLOAD */}
                <FormField
                  control={form.control}
                  name="images.main"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Main Product Image</FormLabel>
                      <FormControl>
                        <div className="flex gap-4 items-center">
                          <Input
                            type="file"
                            accept="image/*"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;

                              // Helper to upload (Duplicated for now, ideally generic hook)
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
                                  field.onChange(data.secure_url);
                                  toast.success("Image uploaded!");
                                }
                              } catch (err) {
                                toast.error("Upload failed");
                              }
                            }}
                          />
                          {field.value && (
                            <img src={field.value} alt="Preview" className="w-16 h-16 object-cover rounded-md border" />
                          )}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* DYNAMIC ATTRIBUTES EDITOR */}
                <FormField
                  control={form.control}
                  name="attributes"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <AttributeEditor
                          value={field.value || {}}
                          onChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* VARIANT EDITOR (Replaces old VariantImageEditor) */}
                <VariantsEditor control={form.control} name="variants" />

                <Button
                  type="submit"
                  disabled={mutation.isPending}
                  className="disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {mutation.isPending ? "Submitting..." : "Submit"}
                </Button>
              </form>
            </Form>
          </SheetDescription>
        </SheetHeader>
      </ScrollArea>
    </SheetContent>
  );
};

export default AddProduct;
