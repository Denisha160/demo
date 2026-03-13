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
    onDeleteClick: (id: number) => void;
}

const StarRating = ({ rating }: { rating: number }) => {
    return (
        <div className="flex items-center gap-1">
            <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                    <svg
                        key={star}
                        className={`w-3 h-3 ${star <= Math.round(rating) ? "text-amber-400" : "text-gray-300 dark:text-gray-600"}`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                    >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                ))}
            </div>
            <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">{rating}</span>
        </div>
    );
};

const ProductTable = ({ products, onEditClick, updatingId, onDeleteClick }: ProductTableProps) => {
    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 p-2">
            {products.map((product) => (
                <div
                    key={product.id}
                    className="group relative bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 border border-gray-100 dark:border-white/10 flex flex-col"
                >
                    {/* Product Image */}
                    <Link href={`/products/${product.id}`} className="relative block overflow-hidden bg-gray-50 dark:bg-gray-800" style={{ paddingBottom: "120%" }}>
                        <Image
                            src={product.thumbnail}
                            alt={product.title}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-500"
                            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                        />
                        {/* Stock badge */}
                        {product.stock <= 10 && (
                            <span className="absolute top-2 left-2 bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow">
                                Only {product.stock} left!
                            </span>
                        )}
                        {/* Category pill */}
                        <span className="absolute top-2 right-2 bg-white/90 dark:bg-black/70 backdrop-blur text-indigo-600 dark:text-indigo-400 text-[10px] font-bold px-2 py-0.5 rounded-full shadow border border-indigo-100 dark:border-indigo-400/20 capitalize">
                            {product.category}
                        </span>
                    </Link>

                    {/* Card Body */}
                    <div className="flex flex-col flex-1 p-3 gap-1">
                        {/* Brand */}
                        <p className="text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide truncate">
                            {product.brand}
                        </p>

                        {/* Title */}
                        <Link href={`/products/${product.id}`}>
                            <h3 className="text-sm font-bold text-gray-900 dark:text-white leading-snug line-clamp-2 group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors">
                                {product.title}
                            </h3>
                        </Link>

                        {/* Rating */}
                        <StarRating rating={product.rating} />

                        {/* Price Row */}
                        <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-100 dark:border-white/5">
                            <div>
                                <span className="text-base font-black text-gray-900 dark:text-white">
                                    ₹{product.price.toLocaleString()}
                                </span>
                                <span className="ml-1.5 text-[10px] line-through text-gray-400">
                                    ₹{Math.round(product.price * 1.3).toLocaleString()}
                                </span>
                                <div className="text-[10px] font-bold text-green-600 dark:text-green-400">
                                    23% OFF
                                </div>
                            </div>
                            <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${product.stock > 10 ? "bg-green-500" : "bg-amber-400"}`} title={`${product.stock} in stock`} />
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-1.5 mt-2">
                            <button
                                onClick={() => onEditClick(product)}
                                disabled={updatingId === product.id}
                                className="flex-1 py-1.5 text-[11px] font-bold text-white bg-pink-600 hover:bg-pink-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 shadow-sm"
                            >
                                {updatingId === product.id ? "Saving…" : "Edit"}
                            </button>
                            <button
                                onClick={() => onDeleteClick(product.id)}
                                disabled={updatingId === product.id}
                                className="flex-1 py-1.5 text-[11px] font-bold text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 shadow-sm"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default ProductTable;
