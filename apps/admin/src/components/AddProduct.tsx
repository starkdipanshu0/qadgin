"use client";

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



const ProductFormSchema = z
  .object({
    name: z
      .string({ message: "Product name is required!" })
      .min(1, { message: "Product name is required!" }),
    shortDescription: z
      .string({ message: "Short description is required!" })
      .min(1, { message: "Short description is required!" })
      .max(60),
    description: z
      .string({ message: "Description is required!" })
      .min(1, { message: "Description is required!" }),
    price: z
      .number({ message: "Price is required!" })
      .min(1, { message: "Price is required!" }),
    tagline: z
      .string({ message: "Tagline is required!" })
      .min(1, { message: "Tagline is required!" }),
    originalPrice: z
      .number({ message: "Original price is required!" })
      .min(1, { message: "Original price is required!" }),
    categorySlug: z
      .string({ message: "Category is required!" })
      .min(1, { message: "Category is required!" }),
    images: z.record(z.string(), z.string(), {
      message: "Image for each flavor is required!",
    }),
    flavors: z.array(z.string()).min(1, { message: "Flavor is required!" }),
    packSize: z.array(z.string()).min(1, { message: "Pack Size is required!" }),
    benefits: z
      .string({ message: "Benefits are required!" })
      .min(1, { message: "Benefits are required!" }),
  })
  .refine(
    (data) => {
      const missingImages = data.flavors.filter(
        (flavor: string) => !data.images?.[flavor]
      );
      return missingImages.length === 0;
    },
    {
      message: "Image is required for each selected flavor!",
      path: ["images"],
    }
  );

// const categories = [
//   "T-shirts",
//   "Shoes",
//   "Accessories",
//   "Bags",
//   "Dresses",
//   "Jackets",
//   "Gloves",
// ] as const;

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
      price: 0,
      originalPrice: 0,
      tagline: "",
      categorySlug: "",
      packSize: [],
      flavors: [],
      images: {},
      benefits: "",
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
        benefits: data.benefits.split(",").map((b) => b.trim()),
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
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormDescription>
                        Enter the price of the product.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="originalPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Original Price</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormDescription>
                        Enter the original price of the product.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {data && (
                  <FormField
                    control={form.control}
                    name="categorySlug"
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
                                <SelectItem key={cat.id} value={cat.slug}>
                                  {cat.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormDescription>
                          Enter the category of the product.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                <FormField
                  control={form.control}
                  name="packSize"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pack Size</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g. 1kg, 250g (comma separated)"
                          onChange={(e) => {
                            const values = e.target.value
                              .split(",")
                              .map((v) => v.trim())
                              .filter((v) => v);
                            field.onChange(values);
                          }}
                        />
                      </FormControl>
                      <FormDescription>
                        Enter available pack sizes (comma separated).
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="flavors"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Flavors</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g. Chocolate, Vanilla (comma separated)"
                          onChange={(e) => {
                            const values = e.target.value
                              .split(",")
                              .map((v) => v.trim())
                              .filter((v) => v);
                            field.onChange(values);
                          }}
                        />
                      </FormControl>
                      <FormDescription>
                        Enter available flavors (comma separated).
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="images"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Images</FormLabel>
                      <FormControl>
                        <div className="">
                          {form.watch("flavors")?.map((flavor) => (
                            <div
                              className="mb-4 flex items-center gap-4"
                              key={flavor}
                            >
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium min-w-[80px]">
                                  {flavor}:
                                </span>
                              </div>
                              <Input
                                type="file"
                                accept="image/*"
                                onChange={async (e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    try {
                                      const formData = new FormData();
                                      formData.append("file", file);
                                      formData.append(
                                        "upload_preset",
                                        "ecommerce"
                                      );

                                      const res = await fetch(
                                        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
                                        {
                                          method: "POST",
                                          body: formData,
                                        }
                                      );
                                      const data = await res.json();

                                      if (data.secure_url) {
                                        const currentImages =
                                          form.getValues("images") || {};
                                        form.setValue("images", {
                                          ...currentImages,
                                          [flavor]: data.secure_url,
                                        });
                                      }
                                    } catch (error) {
                                      console.log(error);
                                      toast.error("Upload failed!");
                                    }
                                  }
                                }}
                              />
                              {field.value?.[flavor] ? (
                                <span className="text-green-600 text-sm">
                                  Image selected
                                </span>
                              ) : (
                                <span className="text-red-600 text-sm">
                                  Image required
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="benefits"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Benefits</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Benefit 1, Benefit 2, Benefit 3"
                        />
                      </FormControl>
                      <FormDescription>
                        Enter the benefits of the product (comma separated).
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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
