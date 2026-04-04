import { Product } from "@/types/products";
import { Card, CardContent } from "@/components/ui/card";
import { Package, MoreVertical, Eye } from "lucide-react";
import StatusBadge from "@/components/StatusBadge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface ProductGridViewProps {
  items: Product[];
  isLoading: boolean;
  onView: (id: string) => void;
}

const getImageUrl = (image: any) => {
  if (!image) return "";
  if (typeof image === "string") return image;
  if (typeof image === "object") {
    return image.url || image.image?.url || image.image_url?.url || "";
  }
  return "";
};

const ProductGridView = ({ items, isLoading, onView }: ProductGridViewProps) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 p-1">
        {Array.from({ length: 10 }).map((_, i) => (
          <Card key={i} className="animate-pulse border-border/50 rounded-sm overflow-hidden h-[240px]">
            <div className="h-32 bg-muted/30" />
            <div className="p-3 space-y-2">
              <div className="h-4 bg-muted/40 rounded w-3/4" />
              <div className="h-3 bg-muted/30 rounded w-1/2" />
              <div className="pt-2 flex justify-between">
                <div className="h-4 bg-muted/40 rounded w-16" />
                <div className="h-4 bg-muted/40 rounded w-12" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground border-2 border-dashed border-border/40 rounded-lg">
        <Package className="h-10 w-10 mb-2 opacity-20" />
        <p className="text-sm font-medium">No products found matching your filters</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 p-1 animate-in fade-in duration-500">
      {items.map((product) => (
        <Card
          key={product.id}
          className="group hover:shadow-xl transition-all duration-500 border-border/50 hover:border-primary/20 rounded-sm overflow-hidden bg-card flex flex-col relative"
        >
          {/* Status Overlay */}
          <div className="absolute top-3 left-3 z-10 transition-transform group-hover:scale-105">
            <StatusBadge
              status={product.product_type}
              variant="info"
              className="text-[9px] h-4.5 px-2 font-black tracking-widest uppercase bg-white/90 backdrop-blur-md border border-white/20 shadow-md text-slate-800"
            />
          </div>

          {/* Action Menu */}
          <div className="absolute top-3 right-1.5 z-10 opacity-0 group-hover:opacity-100 transition-all transform group-hover:-translate-x-1">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7 bg-white/90 backdrop-blur-md hover:bg-white shadow-sm">
                  <MoreVertical className="h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="text-xs font-semibold">
                <DropdownMenuItem onClick={() => onView(product.id)} className="cursor-pointer">
                  <Eye className="h-3.5 w-3.5 mr-2 text-primary" /> View Details
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Image Container */}
          <div
            className="h-44 w-full bg-slate-50 relative overflow-hidden cursor-zoom-in group/img"
            onClick={() => onView(product.id)}
          >
            {product.images && product.images.length > 0 ? (
              <img
                src={getImageUrl(product.images[0])}
                alt={product.product_name}
                className="h-full w-full object-cover transition-transform duration-700 group-hover/img:scale-110"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center bg-slate-100/50">
                <Package className="h-10 w-10 text-muted-foreground/20" />
              </div>
            )}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500" />
          </div>

          <CardContent className="p-2 flex-1 flex flex-col gap-1 bg-white">
            <div className="space-y-2 flex-1">
              <h3
                className="text-sm font-bold tracking-tight text-slate-800 line-clamp-2 cursor-pointer hover:text-primary transition-colors h-[40px]"
                onClick={() => onView(product.id)}
              >
                {product.product_name}
              </h3>

              <div className="flex flex-wrap gap-1 items-center">
                {product.category_name && (
                  <span className="text-[10px] font-bold text-primary bg-primary/5 px-1 rounded-sm border border-primary/10">
                    {product.category_name}
                  </span>
                )}
                {product.brand_name && (
                  <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-1 rounded-sm uppercase tracking-tighter">
                    {product.brand_name}
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between text-[11px] font-mono font-bold text-slate-400">
                <span>#{product.code || 'NO-CODE'}</span>
                <span className="text-[10px] text-muted-foreground/40 font-bold uppercase">
                  {product.base_unit}
                </span>
              </div>
            </div>

            <div className="pt-1 border-t border-slate-100 grid grid-cols-2 gap-4 mt-auto">
              <div className="space-y-0.5">
                <p className="text-[8px] font-black uppercase tracking-[0.15em] text-slate-400">Stock</p>
                <div className="flex items-baseline gap-1">
                  <p className={`text-sm font-black ${Number(product.stock) <= 0 ? 'text-destructive' : 'text-slate-800'}`}>
                    {product.stock || 0}
                  </p>
                  <span className="text-[9px] font-bold text-slate-400 uppercase">Qty</span>
                </div>
              </div>

              <div className="text-right flex flex-col items-end gap-0.5">
                <p className="text-[8px] font-black uppercase tracking-[0.15em] text-slate-400">Price</p>
                <div className="flex items-baseline gap-1 justify-end">
                  <span className="text-xs font-black font-mono text-primary">₹{product.selling_price || 0}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ProductGridView;
