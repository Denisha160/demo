"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
  useQuery,
} from "@tanstack/react-query";
import axios from "axios";
import ProductTable from "./ProductTable";
import EditTitleDialog from "./EditTitleDialog";
import DeleteDialog from "./DeleteProductsDialog";
import { useSearch } from "@/components/providers/SearchProvider";

const LIMIT = 10;

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

const fetchProducts = async ({ pageParam = 0 }): Promise<ProductsResponse> => {
  const { data } = await axios.get(
    `https://dummyjson.com/products?limit=${LIMIT}&skip=${pageParam}`,
  );
  return data;
};

const searchProducts = async (q: string): Promise<ProductsResponse> => {
  const { data } = await axios.get(
    `https://dummyjson.com/products/search?q=${encodeURIComponent(q)}`,
  );
  return data;
};

const updateProduct = async ({ id, title }: { id: number; title: string }) => {
  const { data } = await axios.put(`https://dummyjson.com/products/${id}`, {
    title,
  });
  return data;
};

const deleteProduct = async (id: number) => {
  const { data } = await axios.delete(`https://dummyjson.com/products/${id}`);
  return data;
};

const Products = () => {
  const queryClient = useQueryClient();
  const { searchQuery } = useSearch();
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [tempTitle, setTempTitle] = useState("");
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const {
    data: infiniteData,
    isLoading: isInfiniteLoading,
    isError: isInfiniteError,
    error: infiniteError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["products"],
    queryFn: fetchProducts,
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      const nextSkip = lastPage.skip + lastPage.limit;
      return nextSkip < lastPage.total ? nextSkip : undefined;
    },
    enabled: !searchQuery,
  });

  const {
    data: searchData,
    isLoading: isSearchLoading,
    isError: isSearchError,
    error: searchError,
  } = useQuery({
    queryKey: ["products", "search", searchQuery],
    queryFn: () => searchProducts(searchQuery),
    enabled: !!searchQuery,
  });

  // ── IntersectionObserver: fire fetchNextPage when sentinel is visible ───────
  const handleIntersection = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
    [hasNextPage, isFetchingNextPage, fetchNextPage],
  );

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(handleIntersection, {
      rootMargin: "200px", // start loading 200px before the bottom
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [handleIntersection]);

  // ── Mutations ──────────────────────────────────────────────────────────────

  const mutation = useMutation({
    mutationFn: updateProduct,
    onSuccess: (updatedProduct) => {
      // Update in both infinite pages and search cache
      queryClient.setQueryData(
        ["products"],
        (old: { pages: ProductsResponse[] } | undefined) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              products: page.products.map((p) =>
                p.id === updatedProduct.id
                  ? { ...p, title: updatedProduct.title }
                  : p,
              ),
            })),
          };
        },
      );
      setLastUpdated(updatedProduct.title);
      setIsDialogOpen(false);
      setEditingProduct(null);
      setTimeout(() => setLastUpdated(null), 3000);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: (deletedProduct) => {
      queryClient.setQueryData(
        ["products"],
        (old: { pages: ProductsResponse[] } | undefined) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              products: page.products.filter((p) => p.id !== deletedProduct.id),
            })),
          };
        },
      );
    },
  });

  // ── Derived state ─────────────────────────────────────────────────────────

  const isLoading = searchQuery ? isSearchLoading : isInfiniteLoading;
  const isError = searchQuery ? isSearchError : isInfiniteError;
  const error = searchQuery ? searchError : infiniteError;

  // Flatten infinite pages OR use search results flat list
  const products: Product[] = searchQuery
    ? (searchData?.products ?? [])
    : (infiniteData?.pages.flatMap((p) => p.products) ?? []);

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handleEditClick = (product: Product) => {
    setEditingProduct(product);
    setTempTitle(product.title);
    setIsDialogOpen(true);
  };

  const handleDeleteClick = (id: number) => {
    setDeleteDialog(true);
    setDeletingId(id);
  };

  const handelDeleteSubmit = () => {
    if (deletingId) {
      deleteMutation.mutate(deletingId);
      setDeleteDialog(false);
      setDeletingId(null);
    }
  };

  const handleDialogSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProduct) {
      mutation.mutate({ id: editingProduct.id, title: tempTitle });
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="relative w-12 h-12">
          <div className="absolute top-0 left-0 w-full h-full border-4 border-pink-500/20 rounded-full animate-pulse" />
          <div className="absolute top-0 left-0 w-full h-full border-t-4 border-pink-500 rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-8 text-center bg-red-50 dark:bg-red-900/20 rounded-2xl border border-red-100 dark:border-red-800">
        <h2 className="text-xl font-bold text-red-600 mb-2">
          Error Loading Products
        </h2>
        <p className="text-red-500">{(error as Error).message}</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto p-4 md:p-8">
      {/* Page heading */}
      <div className="mb-10 text-center">
        {searchQuery ? (
          <>
            <h1 className="text-2xl md:text-3xl font-black bg-gradient-to-r from-pink-500 via-fuchsia-500 to-violet-600 bg-clip-text text-transparent mb-3 tracking-tight">
              Results for &ldquo;{searchQuery}&rdquo;
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              {`${products.length} product${products.length !== 1 ? "s" : ""} found`}
            </p>
          </>
        ) : (
          <>
            <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4 tracking-tight">
              Explore Our Collection
            </h1>
            <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto text-lg">
              Discover high-quality products from top brands, fetched
              dynamically with React Query &amp; Axios.
            </p>
          </>
        )}
      </div>

      {/* Update success toast */}
      {lastUpdated && (
        <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <div>
              <p className="font-bold text-green-800 dark:text-green-300">
                Update Successful!
              </p>
              <p className="text-sm text-green-600 dark:text-green-400">
                Product title changed to &quot;{lastUpdated}&quot;
              </p>
            </div>
          </div>
          <button
            onClick={() => setLastUpdated(null)}
            className="text-green-800 dark:text-green-300 hover:opacity-70"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      )}

      {/* Product grid */}
      <ProductTable
        products={products}
        onEditClick={handleEditClick}
        onDeleteClick={handleDeleteClick}
        updatingId={
          mutation.isPending
            ? (mutation.variables as { id: number })?.id
            : deleteMutation.isPending
              ? (deleteMutation.variables as number)
              : null
        }
      />

      {/* ── Infinite scroll sentinel + loader ─────────────────────────── */}
      {!searchQuery && (
        <>
          {/* Invisible sentinel — IntersectionObserver watches this */}
          <div ref={sentinelRef} className="h-1" />

          {/* Bottom loader */}
          {isFetchingNextPage && (
            <div className="flex flex-col items-center justify-center gap-3 py-12">
              <div className="relative w-10 h-10">
                <div className="absolute inset-0 border-4 border-pink-500/20 rounded-full animate-pulse" />
                <div className="absolute inset-0 border-t-4 border-pink-500 rounded-full animate-spin" />
              </div>
              <p className="text-sm text-gray-400 font-medium">
                Loading more products...
              </p>
            </div>
          )}

          {/* End of list message */}
          {!hasNextPage && products.length > 0 && !isFetchingNextPage && (
            <p className="text-center text-gray-400 text-sm py-8">
              🎉 You&apos;ve seen all {products.length} products!
            </p>
          )}
        </>
      )}

      <EditTitleDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSubmit={handleDialogSubmit}
        product={editingProduct}
        tempTitle={tempTitle}
        setTempTitle={setTempTitle}
        isPending={mutation.isPending}
      />

      <DeleteDialog
        isOpen={deleteDialog}
        onClose={() => setDeleteDialog(false)}
        onSubmit={handelDeleteSubmit}
        isPending={deleteMutation.isPending}
      />
    </div>
  );
};

export default Products;
