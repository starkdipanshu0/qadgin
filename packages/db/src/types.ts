
// Product Schema Types
// these are used in the DB schema for strict typing of JSON columns

export interface ProductAttributes {
    [key: string]: string[];
}

export interface ListingOverride {
    show: boolean;
    name?: string;
    image?: string;
    slugSuffix?: string;
}


export interface ListingConfig {
    showVariantsAsCards: boolean;
}

export interface ProductImageState {
    main: string | null;
    gallery: string[];
}


export type ContentBlock =
    | { type: 'header'; data: { text: string; level: 1 | 2 | 3 | 4 | 5 | 6 } }
    | { type: 'paragraph'; data: { text: string } }
    | { type: 'image'; data: { file: { url: string }; caption: string; withBorder: boolean; withBackground: boolean; stretched: boolean } }
    | { type: 'list'; data: { style: 'ordered' | 'unordered'; items: string[] } }
    | { type: 'delimiter'; data: {} }
    | { type: 'quote'; data: { text: string; caption: string; alignment: 'left' | 'center' } }
    | { type: string; data: any };

export interface ProductContent {
    blocks: ContentBlock[];
}
