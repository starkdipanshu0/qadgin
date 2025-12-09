import { ShippingFormInputs, shippingFormSchema } from "@repo/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Building, MapPin, Phone, User, Mail, Navigation } from "lucide-react";
import { useRouter } from "next/navigation";
import { SubmitHandler, useForm } from "react-hook-form";

const ShippingForm = ({
  setShippingForm,
}: {
  setShippingForm: (data: ShippingFormInputs) => void;
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ShippingFormInputs>({
    resolver: zodResolver(shippingFormSchema as any),
  });

  const router = useRouter();

  const handleShippingForm: SubmitHandler<ShippingFormInputs> = (data) => {
    setShippingForm(data);
    router.push("/cart?step=3", { scroll: false });
  };

  return (
    <form
      className="flex flex-col gap-6"
      onSubmit={handleSubmit(handleShippingForm)}
    >
      {/* --- CONTACT INFO SECTION --- */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-stone-400 uppercase tracking-wider mb-2">Contact Details</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Name */}
          <div className="relative group">
            <User className="absolute left-3 top-3 w-5 h-5 text-stone-400 group-focus-within:text-emerald-600 transition-colors" />
            <input
              type="text"
              placeholder="Full Name"
              {...register("name")}
              className="w-full bg-stone-50 border border-stone-200 rounded-xl py-3 pl-10 pr-4 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder:text-stone-400 text-stone-800 text-sm font-medium"
            />
            {errors.name && <p className="text-xs text-red-500 mt-1 ml-1">{errors.name.message}</p>}
          </div>

          {/* Phone (India Format) */}
          <div className="relative group">
            <div className="absolute left-3 top-3 flex items-center gap-2 border-r border-stone-300 pr-2">
              <span className="text-stone-500 text-sm font-bold">🇮🇳 +91</span>
            </div>
            <input
              type="tel"
              placeholder="98765 43210"
              maxLength={10}
              {...register("phone")}
              className="w-full bg-stone-50 border border-stone-200 rounded-xl py-3 pl-24 pr-4 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder:text-stone-400 text-stone-800 text-sm font-medium"
            />
            {errors.phone && <p className="text-xs text-red-500 mt-1 ml-1">{errors.phone.message}</p>}
          </div>
        </div>

        {/* Email */}
        <div className="relative group">
          <Mail className="absolute left-3 top-3 w-5 h-5 text-stone-400 group-focus-within:text-emerald-600 transition-colors" />
          <input
            type="email"
            placeholder="Email Address"
            {...register("email")}
            className="w-full bg-stone-50 border border-stone-200 rounded-xl py-3 pl-10 pr-4 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder:text-stone-400 text-stone-800 text-sm font-medium"
          />
          {errors.email && <p className="text-xs text-red-500 mt-1 ml-1">{errors.email.message}</p>}
        </div>
      </div>

      {/* --- ADDRESS SECTION --- */}
      <div className="space-y-4 mt-2">
        <h3 className="text-sm font-bold text-stone-400 uppercase tracking-wider mb-2">Shipping Address</h3>

        {/* Pincode & City (Auto-fill logic usually goes here) */}
        <div className="grid grid-cols-2 gap-4">
          <div className="relative group">
            <Navigation className="absolute left-3 top-3 w-5 h-5 text-stone-400 group-focus-within:text-emerald-600 transition-colors" />
            {/* Note: Ensure your schema has 'pincode' or map this to address */}
            <input
              type="text"
              placeholder="Pincode (e.g. 560034)"
              maxLength={6}
              // {...register("pincode")} 
              className="w-full bg-stone-50 border border-stone-200 rounded-xl py-3 pl-10 pr-4 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder:text-stone-400 text-stone-800 text-sm font-medium"
            />
          </div>
          <div className="relative group">
            <Building className="absolute left-3 top-3 w-5 h-5 text-stone-400 group-focus-within:text-emerald-600 transition-colors" />
            <input
              type="text"
              placeholder="City / District"
              {...register("city")}
              className="w-full bg-stone-50 border border-stone-200 rounded-xl py-3 pl-10 pr-4 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder:text-stone-400 text-stone-800 text-sm font-medium"
            />
            {errors.city && <p className="text-xs text-red-500 mt-1 ml-1">{errors.city.message}</p>}
          </div>
        </div>

        {/* Full Address */}
        <div className="relative group">
          <MapPin className="absolute left-3 top-3 w-5 h-5 text-stone-400 group-focus-within:text-emerald-600 transition-colors" />
          <textarea
            placeholder="Flat / House No, Floor, Building Name, Street"
            {...register("address")}
            rows={2}
            className="w-full bg-stone-50 border border-stone-200 rounded-xl py-3 pl-10 pr-4 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder:text-stone-400 text-stone-800 text-sm font-medium resize-none"
          />
          {errors.address && <p className="text-xs text-red-500 mt-1 ml-1">{errors.address.message}</p>}
        </div>

        {/* Landmark & State */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative group">
            <input
              type="text"
              placeholder="Landmark (Optional)"
              // {...register("landmark")} 
              className="w-full bg-stone-50 border border-stone-200 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder:text-stone-400 text-stone-800 text-sm font-medium"
            />
          </div>
          <div className="relative group">
            <select
              // {...register("state")} 
              defaultValue=""
              className="w-full bg-stone-50 border border-stone-200 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-stone-800 text-sm font-medium appearance-none"
            >
              <option value="" disabled>Select State</option>
              <option value="Maharashtra">Maharashtra</option>
              <option value="Delhi">Delhi</option>
              <option value="Karnataka">Karnataka</option>
              <option value="Tamil Nadu">Tamil Nadu</option>
              <option value="Uttar Pradesh">Uttar Pradesh</option>
              {/* Add other Indian states */}
            </select>
            <div className="absolute right-4 top-3.5 pointer-events-none">
              <ArrowRight className="w-4 h-4 text-stone-400 rotate-90" />
            </div>
          </div>
        </div>

      </div>

      {/* --- SUBMIT BUTTON --- */}
      <button
        type="submit"
        className="mt-4 w-full bg-stone-900 hover:bg-emerald-700 transition-all duration-300 text-white font-bold py-4 rounded-xl shadow-lg shadow-stone-200 flex items-center justify-center gap-2 group"
      >
        Proceed to Payment
        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
      </button>
    </form>
  );
};

export default ShippingForm;
