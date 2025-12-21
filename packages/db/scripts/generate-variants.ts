import fs from 'fs';
import path from 'path';

import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const INPUT_FILE = path.join(__dirname, '../data/products-compact.json');
const OUTPUT_FILE = path.join(__dirname, '../products-detailed.json');

// Interface for the Compact Input
interface CompactProduct {
    name: string;
    slug: string;
    basePrice: number | string;
    baseStock: number;
    options: { name: string; values: string[] }[];
    variantOverrides?: {
        match: Record<string, string>;
        price?: number | string;
        stock?: number;
    }[];
    imageMap?: Record<string, string>;
    [key: string]: any; // Allow other props to pass through
}

function generateCartesianProduct(arrays: string[][]): string[][] {
    return arrays.reduce(
        (acc, curr) => acc.flatMap((x) => curr.map((y) => [...x, y])),
        [[]] as string[][]
    );
}

function generateVariants(product: CompactProduct) {
    const optionNames = product.options.map((opt) => opt.name);
    const optionValues = product.options.map((opt) => opt.values);

    // Generate all combinations (e.g. [[Red, S], [Red, M], ...])
    const combinations = generateCartesianProduct(optionValues);

    return combinations.map((combination) => {
        // 1. Build Attribute Map for this variant
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
            .replace(/[^A-Z0-9-]/g, ''); // Clean SKU

        // 3. Find Overrides
        const override = product.variantOverrides?.find((o) => {
            return Object.entries(o.match).every(([k, v]) => attributes[k]?.[0] === v);
        });

        // 4. Resolve Images
        // Simple logic: If any attribute value matches a key in imageMap, use that image.
        let mainImage = product.images?.main || ""; // Fallback
        if (product.imageMap) {
            for (const val of combination) {
                if (product.imageMap[val]) {
                    mainImage = product.imageMap[val];
                    break; // Use the first match (e.g. prioritize Color over Size if Color is first)
                }
            }
        }

        return {
            name: `${product.name} - ${nameSuffix}`,
            sku: `${product.slug}-${skuSuffix}`.toUpperCase(),
            price: override?.price ? String(override.price) : String(product.basePrice),
            stock: override?.stock ?? product.baseStock,
            attributes: attributes,
            images: {
                main: mainImage,
                gallery: []
            }
        };
    });
}

function main() {
    try {
        const rawData = fs.readFileSync(INPUT_FILE, 'utf-8');
        const products: CompactProduct[] = JSON.parse(rawData);

        const detailedProducts = products.map((product) => {
            const {
                options,
                variantOverrides,
                basePrice,
                baseStock,
                imageMap,
                ...baseProduct
            } = product; // Extract generation meta-data, keep the rest

            return {
                ...baseProduct,
                attributes: {
                    // Include all available options in the parent product attributes
                    ...options.reduce((acc, opt) => {
                        acc[opt.name] = opt.values;
                        return acc;
                    }, {} as Record<string, string[]>)
                },
                variants: generateVariants(product),
            };
        });

        fs.writeFileSync(OUTPUT_FILE, JSON.stringify(detailedProducts, null, 2));
        console.log(`✅ Generated ${detailedProducts.length} products with variants to ${OUTPUT_FILE}`);
    } catch (err) {
        console.error("❌ Error generating variants:", err);
        process.exit(1);
    }
}

main();
