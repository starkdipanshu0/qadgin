import { type ProductType } from "./product";
import z from "zod";

export type CartItemType = ProductType & {
  quantity: number;
  selectedSize: string;
  selectedColor: string;
};

export type CartItemsType = CartItemType[];

export const shippingFormSchema = z.object({
  name: z.string().min(2, "Please enter your full name"),

  email: z
    .string()
    .min(1, "Email is required!")
    .email("Please enter a valid email address"),

  phone: z
    .string()
    .min(1, "Phone number is required")
    // Indian Mobile Regex: Starts with 6-9, followed by 9 digits
    .regex(/^[6-9]\d{9}$/, "Please enter a valid 10-digit Indian mobile number"),

  address: z
    .string()
    .min(5, "Please enter your full street address (House No, Street)"),

  city: z.string().min(1, "City is required!"),

  state: z.string().min(1, "State is required!"),

  pincode: z
    .string()
    .length(6, "Pincode must be exactly 6 digits")
    // Indian Pincode Regex: First digit 1-9, rest 0-9
    .regex(/^[1-9][0-9]{5}$/, "Invalid Pincode format"),

  landmark: z.string().optional(), // Optional field
});
export type ShippingFormInputs = z.infer<typeof shippingFormSchema>;

export type CartStoreStateType = {
  cart: CartItemsType;
  hasHydrated: boolean;
};

export type CartStoreActionsType = {
  addToCart: (product: CartItemType) => void;
  removeFromCart: (product: CartItemType) => void;
  clearCart: () => void;
};
