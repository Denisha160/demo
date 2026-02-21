export type ProductType = 'raw_material' | 'finished_good' | 'branded_product' | 'unbranded_product';

export interface Variant {
    id: string;
    variant_name: string;
    sku: string;
    weight_volume: number;
    unit: string;
    cost_price: number;
    selling_price: number;
}

export interface BOMItem {
    component_variant_id: string;
    quantity_required: number;
    // UI helper fields
    component_name?: string;
}

export interface Product {
    id: string;
    name: string;
    type: ProductType;
    base_unit: string;
    is_active: boolean;
    variants: Variant[];
    bom?: BOMItem[]; // Only for finished_good or kit
}
