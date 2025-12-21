export interface CompactProductInput {
    name: string;
    slug?: string;
    baseSku?: string;
    basePrice: number | string;
    baseStock: number;
    options: { name: string; values: string[] }[];
    variantOverrides?: {
        match: Record<string, string>;
        price?: number | string;
        originalPrice?: number | string;
        stock?: number;
    }[];
    imageMap?: Record<string, string>;
    images?: { main: string; gallery: string[] };
    [key: string]: any;
}

export function generateVariants(product: CompactProductInput) {
    const optionNames = product.options.map((opt) => opt.name);
    const optionValues = product.options.map((opt) => opt.values);

    // Cartesian Product Helper
    const combinations = optionValues.reduce(
        (acc, curr) => acc.flatMap((x) => curr.map((y) => [...x, y])),
        [[]] as string[][]
    );

    return combinations.map((combination) => {
        // 1. Build Attribute Map
        const attributes: Record<string, string[]> = {};
        combination.forEach((val, idx) => {
            const key = optionNames[idx];
            if (key) {
                attributes[key] = [val];
            }
        });

        // 2. Generate Base Data
        const nameSuffix = combination.join(' / ');
        const skuSuffix = combination
            .join('-')
            .toUpperCase()
            .replace(/[^A-Z0-9-]/g, '');

        // Determine SKU Prefix
        const skuPrefix = product.baseSku
            ? product.baseSku
            : (product.slug || product.name.replace(/\s+/g, '-').toLowerCase());

        // 3. Find Overrides
        const override = product.variantOverrides?.find((o) => {
            return Object.entries(o.match).every(([k, v]) => attributes[k]?.[0] === v);
        });

        // 4. Resolve Images
        let mainImage = product.images?.main || "";
        if (product.imageMap) {
            for (const val of combination) {
                if (product.imageMap[val]) {
                    mainImage = product.imageMap[val];
                    break;
                }
            }
        }

        return {
            name: `${product.name} - ${nameSuffix}`,
            sku: `${skuPrefix}-${skuSuffix}`.toUpperCase(),
            price: override?.price ? String(override.price) : String(product.basePrice),
            originalPrice: override?.originalPrice ? String(override.originalPrice) : null,
            stock: override?.stock ?? product.baseStock,
            attributes: attributes,
            images: {
                main: mainImage,
                gallery: []
            }
        };
    });
}
