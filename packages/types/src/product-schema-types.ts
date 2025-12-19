
// Pure interface definitions for Product Schema JSON columns
// Avoids circular dependencies with @repo/db

export interface ProductAttributes {
    [key: string]: string[]; // e.g. "Color": ["Red", "Blue"]
}

export interface ListingOverride {
    show: boolean;
    name?: string;     // Override product name
    image?: string;    // Override listing image
    slugSuffix?: string; // unique URL suffix
    price?: number;        // Override price
    originalPrice?: number; // Override original price
}

export interface ListingConfig {
    showVariantsAsCards: boolean;
    // Overrides removed in favor of relational Variants table
}

export interface ProductImageState {
    main: string | null; // Nullable for inheritance
    gallery: string[];
}

export type ContentBlock =
    | { type: 'header'; data: { text: string; level: 1 | 2 | 3 | 4 | 5 | 6 } }
    | { type: 'paragraph'; data: { text: string } }
    | { type: 'image'; data: { file: { url: string }; caption: string; withBorder: boolean; withBackground: boolean; stretched: boolean } }
    | { type: 'list'; data: { style: 'ordered' | 'unordered'; items: string[] } }
    | { type: 'delimiter'; data: {} }
    | { type: 'quote'; data: { text: string; caption: string; alignment: 'left' | 'center' } }
    // Generic fallback
    | { type: string; data: any };

export interface ProductContent {
    blocks: ContentBlock[];
}
