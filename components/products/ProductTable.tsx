"use client";

import Image from "next/image";
import Link from "next/link";

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

interface ProductTableProps {
    products: Product[];
    onEditClick: (product: Product) => void;
    updatingId?: number | null;
}

const ProductTable = ({ products, onEditClick, updatingId }: ProductTableProps) => {
    return (
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
                        {products.map((product) => (
                            <tr
                                key={product.id}
                                className="group hover:bg-blue-50/30 dark:hover:bg-blue-400/5 transition-all duration-300"
                            >
                                <td className="px-6 py-5">
                                    <div className="flex items-center gap-4">
                                        <Link href={`/products/${product.id}`} className="relative w-14 h-14 rounded-xl overflow-hidden bg-gray-100 dark:bg-white/5 group-hover:scale-105 transition-transform duration-300 shadow-md block">
                                            <Image
                                                src={product.thumbnail}
                                                alt={product.title}
                                                fill
                                                className="object-cover"
                                            />
                                        </Link>
                                        <div>
                                            <Link 
                                                href={`/products/${product.id}`}
                                                className="font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors block"
                                            >
                                                {product.title}
                                            </Link>
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
                                    <div className="flex items-center justify-end gap-2">
                                        <Link
                                            href={`/products/${product.id}`}
                                            className="px-4 py-2 text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-400/10 hover:bg-blue-100 dark:hover:bg-blue-400/20 rounded-lg transition-colors border border-blue-100 dark:border-blue-400/20 shadow-sm active:scale-95"
                                        >
                                            View
                                        </Link>
                                        <button
                                            onClick={() => onEditClick(product)}
                                            disabled={updatingId === product.id}
                                            className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm active:scale-95"
                                        >
                                            Edit Title
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ProductTable;
