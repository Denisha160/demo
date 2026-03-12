"use client";

import { useState } from "react";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import Image from "next/image";

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
            console.log("Product updated successfully:", updatedProduct);
            setLastUpdated(updatedProduct.title);
            setTimeout(() => setLastUpdated(null), 3000);
        },
    });

    const handleUpdateClick = (id: number, currentTitle: string) => {
        const newTitle = `${currentTitle} +1`;
        mutation.mutate({ id, title: newTitle });
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

            <div className="overflow-hidden rounded-3xl border border-gray-200 dark:border-white/10 bg-white/50 dark:bg-black/20 backdrop-blur-xl shadow-2xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 dark:bg-white/5 border-b border-gray-200 dark:border-white/10">
                                <th className="px-6 py-5 text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">Product</th>
                                <th className="px-6 py-5 text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">Category</th>
                                <th className="px-6 py-5 text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">Stock</th>
                                <th className="px-6 py-5 text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">Rating</th>
                                <th className="px-6 py-5 text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider text-right">Price</th>
                                <th className="px-6 py-5 text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                            {data?.products.map((product) => (
                                <tr
                                    key={product.id}
                                    className="group hover:bg-blue-50/30 dark:hover:bg-blue-400/5 transition-all duration-300"
                                >
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-4">
                                            <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-gray-100 dark:bg-white/5 group-hover:scale-105 transition-transform duration-300 shadow-md">
                                                <Image
                                                    src={product.thumbnail}
                                                    alt={product.title}
                                                    fill
                                                    className="object-cover"
                                                />
                                            </div>
                                            <div>
                                                <div className="font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                                    {product.title}
                                                </div>
                                                <div className="text-xs text-gray-500 dark:text-gray-500 font-medium">
                                                    {product.brand}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className="px-3 py-1 text-xs font-bold rounded-full bg-indigo-50 dark:bg-indigo-400/10 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-400/20">
                                            {product.category}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-2 h-2 rounded-full ${product.stock > 10 ? 'bg-green-500' : 'bg-amber-500'}`}></div>
                                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{product.stock} left</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-1">
                                            <span className="text-amber-400 text-lg">★</span>
                                            <span className="text-sm font-bold text-gray-900 dark:text-white">{product.rating}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 text-right">
                                        <div className="text-lg font-black text-gray-900 dark:text-white">
                                            ${product.price.toLocaleString()}
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 text-right">
                                        <button
                                            onClick={() => handleUpdateClick(product.id, product.title)}
                                            disabled={mutation.isPending && mutation.variables?.id === product.id}
                                            className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm active:scale-95"
                                        >
                                            {mutation.isPending && mutation.variables?.id === product.id ? (
                                                <span className="flex items-center gap-1">
                                                    <svg className="animate-spin h-3 w-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                    Updating...
                                                </span>
                                            ) : (
                                                "Update Title"
                                            )}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Products;