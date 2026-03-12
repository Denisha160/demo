"use client";

import { useState } from "react";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import ProductTable from "./ProductTable";
import EditTitleDialog from "./EditTitleDialog";

interface Product {
    id: number;
    title: string;
    description: string;
    price: number;
    rating: number;
    stock: number;
    category: string;
    thumbnail: string;
    brand: string;
}

interface ProductsResponse {
    products: Product[];
    total: number;
    skip: number;
    limit: number;
}

const fetchProducts = async (): Promise<ProductsResponse> => {
    const { data } = await axios.get("https://dummyjson.com/products");
    return data;
};

const updateProduct = async ({ id, title }: { id: number; title: string }) => {
    const { data } = await axios.put(`https://dummyjson.com/products/${id}`, {
        title,
    });
    return data;
};

const Products = () => {
    const queryClient = useQueryClient();
    const [lastUpdated, setLastUpdated] = useState<string | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [tempTitle, setTempTitle] = useState("");

    const { data, isLoading, isError, error } = useQuery({
        queryKey: ["products"],
        queryFn: fetchProducts,
    });

    const mutation = useMutation({
        mutationFn: updateProduct,
        onSuccess: (updatedProduct) => {
            queryClient.setQueryData(["products"], (oldData: ProductsResponse | undefined) => {
                if (!oldData) return oldData;
                return {
                    ...oldData,
                    products: oldData.products.map((p) =>
                        p.id === updatedProduct.id ? { ...p, title: updatedProduct.title } : p
                    ),
                };
            });
            setLastUpdated(updatedProduct.title);
            setIsDialogOpen(false);
            setEditingProduct(null);
            setTimeout(() => setLastUpdated(null), 3000);
        },
    });

    const handleEditClick = (product: Product) => {
        setEditingProduct(product);
        setTempTitle(product.title);
        setIsDialogOpen(true);
    };

    const handleDialogSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingProduct) {
            mutation.mutate({ id: editingProduct.id, title: tempTitle });
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="relative w-12 h-12">
                    <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-500/20 rounded-full animate-pulse"></div>
                    <div className="absolute top-0 left-0 w-full h-full border-t-4 border-blue-600 rounded-full animate-spin"></div>
                </div>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="p-8 text-center bg-red-50 dark:bg-red-900/20 rounded-2xl border border-red-100 dark:border-red-800">
                <h2 className="text-xl font-bold text-red-600 mb-2">Error Loading Products</h2>
                <p className="text-red-500">{(error as Error).message}</p>
            </div>
        );
    }

    return (
        <div className="w-full max-w-7xl mx-auto p-4 md:p-8">
            <div className="mb-10 text-center">
                <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4 tracking-tight">
                    Explore Our Collection
                </h1>
                <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto text-lg">
                    Discover high-quality products from top brands, fetched dynamically with React Query & Axios.
                </p>
            </div>

            {lastUpdated && (
                <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-2xl flex items-center justify-between animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <div>
                            <p className="font-bold text-green-800 dark:text-green-300">Update Successful!</p>
                            <p className="text-sm text-green-600 dark:text-green-400">Product title changed to "{lastUpdated}"</p>
                        </div>
                    </div>
                    <button onClick={() => setLastUpdated(null)} className="text-green-800 dark:text-green-300 hover:opacity-70">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            )}

            <ProductTable
                products={data?.products || []}
                onEditClick={handleEditClick}
                updatingId={mutation.isPending ? (mutation.variables as { id: number })?.id : null}
            />

            <EditTitleDialog
                isOpen={isDialogOpen}
                onClose={() => setIsDialogOpen(false)}
                onSubmit={handleDialogSubmit}
                product={editingProduct}
                tempTitle={tempTitle}
                setTempTitle={setTempTitle}
                isPending={mutation.isPending}
            />
        </div>
    );
};

export default Products;