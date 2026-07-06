import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import AddToCartButton from "@/components/products/AddToCartButton";
import { Metadata } from "next";

interface Product {
  id: number;
  title: string;
  description: string;
  price: number;
  rating: number;
  stock: number;
  category: string;
  thumbnail: string;
  images: string[];
  brand: string;
}

async function getProduct(id: string): Promise<Product | null> {
  const res = await fetch(`https://dummyjson.com/products/${id}`, {
    next: { revalidate: 3600 },
  });

  if (!res.ok) return null;
  return res.json();
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product) {
    return {
      title: "Product Not Found",
    };
  }

  return {
    title: `${product.title} | Premium Store`,
    description: product.description,
    openGraph: {
      title: product.title,
      description: product.description,
      images: [{ url: product.thumbnail, alt: product.title }],
      type: "website",
    },
  };
}

export default async function ViewProducts({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <Link
          href="/"
          className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 mb-8 transition-colors"
        >
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Back to Products
        </Link>

        <div className="bg-white dark:bg-white/5 rounded-3xl overflow-hidden shadow-2xl border border-gray-100 dark:border-white/10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
            {/* Image Section */}
            <div className="relative aspect-square bg-gray-100 dark:bg-white/5">
              <Image
                src={product.thumbnail}
                alt={product.title}
                fill
                priority
                className="object-cover"
                sizes="auto"
              />
            </div>

            {/* Content Section */}
            <div className="p-8 md:p-12 flex flex-col justify-center">
              <div className="mb-6">
                <span className="px-3 py-1 text-xs font-bold rounded-full bg-blue-50 dark:bg-blue-400/10 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-400/20 uppercase tracking-wider">
                  {product.category}
                </span>
              </div>

              <h1 className="text-4xl font-black text-gray-900 dark:text-white mb-4 tracking-tight">
                {product.title}
              </h1>

              <div className="flex items-center gap-4 mb-8">
                <div className="text-3xl font-black text-blue-600 dark:text-blue-400">
                  ${product.price.toLocaleString()}
                </div>
                <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-400/10 px-2 py-1 rounded-lg border border-amber-100 dark:border-amber-400/20">
                  <span className="text-amber-500 font-bold">★</span>
                  <span className="text-sm font-bold text-amber-700 dark:text-amber-400">
                    {product.rating}
                  </span>
                </div>
              </div>

              <p className="text-lg text-gray-600 dark:text-gray-400 mb-10 leading-relaxed">
                {product.description}
              </p>

              <div className="grid grid-cols-2 gap-4 mb-10">
                <div className="p-4 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10">
                  <div className="text-xs text-gray-500 uppercase font-bold mb-1">
                    Brand
                  </div>
                  <div className="font-bold text-gray-900 dark:text-white">
                    {product.brand}
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10">
                  <div className="text-xs text-gray-500 uppercase font-bold mb-1">
                    Stock
                  </div>
                  <div className="font-bold text-gray-900 dark:text-white">
                    {product.stock > 0
                      ? `${product.stock} Units Available`
                      : "Out of Stock"}
                  </div>
                </div>
              </div>

              <AddToCartButton productId={product.id} />
            </div>
          </div>
        </div>

        {/* Additional Images Grid */}
        {product.images.length > 1 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Product Gallery
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {product.images.slice(0, 4).map((img, idx) => (
                <div
                  key={idx}
                  className="relative aspect-square rounded-2xl overflow-hidden border border-gray-200 dark:border-white/10 shadow-sm"
                >
                  <Image
                    src={img}
                    alt={`${product.title} ${idx + 1}`}
                    fill
                    className="object-cover"
                    sizes="auto"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
