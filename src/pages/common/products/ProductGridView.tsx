import { Product } from "@/types/products";
import { Card, CardContent } from "@/components/ui/card";
import { Package } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 p-1">
        {Array.from({ length: 12 }).map((_, i) => (
          <Card key={i} className="animate-pulse border-border/50 rounded-sm overflow-hidden h-[240px]">
            <div className="h-32 bg-muted/30" />
            <div className="p-3 space-y-2">
              <div className="h-4 bg-muted/40 rounded w-3/4" />
              <div className="h-3 bg-muted/30 rounded w-1/2" />
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
    <TooltipProvider>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 p-1 animate-in fade-in duration-500">
        {items.map((product) => (
          <Card
            key={product.id}
            className="group hover:shadow-xl transition-all duration-500 border-border/50 hover:border-primary/20 rounded-sm overflow-hidden bg-white flex flex-col relative"
          >
            {/* Abbreviated Indicators Overlay */}
            <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="w-6 h-6 rounded-sm bg-white/90 backdrop-blur-md border border-slate-200 flex items-center justify-center text-[10px] font-black text-slate-800 shadow-sm cursor-help">
                    {product.product_type?.charAt(0) || 'P'}
                  </div>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>{product.product_type}</p>
                </TooltipContent>
              </Tooltip>

              {product.category_name && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="w-6 h-6 rounded-sm bg-primary/90 backdrop-blur-md border border-primary/10 flex items-center justify-center text-[10px] font-black text-white shadow-sm cursor-help">
                      {product.category_name.charAt(0)}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p>{product.category_name}</p>
                  </TooltipContent>
                </Tooltip>
              )}
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
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-500" />
            </div>

            <CardContent className="p-2 flex-1 flex flex-col gap-1.5">
              <div className="space-y-1">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <h3
                      className="text-[14px] font-black tracking-tight text-slate-800 truncate cursor-pointer hover:text-primary transition-colors pr-1"
                      onClick={() => onView(product.id)}
                    >
                      {product.product_name}
                    </h3>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p>{product.product_name}</p>
                  </TooltipContent>
                </Tooltip>

                <div className="flex items-center justify-between text-[9px] font-mono font-bold text-slate-400">
                  <span className="truncate max-w-[60px]">#{product.code || 'NO-CODE'}</span>
                  {product.brand_name && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="text-indigo-500 truncate max-w-[60px] uppercase tracking-tighter">
                          {product.brand_name}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-[10px] font-black uppercase tracking-widest">{product.brand_name}</p>
                      </TooltipContent>
                    </Tooltip>
                  )}
                </div>
              </div>

              <div className="pt-1.5 border-t border-slate-100 grid grid-cols-2 gap-2 mt-auto">
                <div className="space-y-0.5">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-baseline gap-1 cursor-help">
                        <p className={`text-[11px] font-black ${Number(product.stock) <= 0 ? 'text-destructive' : 'text-slate-800'}`}>
                          {product.stock || 0}
                        </p>
                        <span className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">{product.base_unit?.substring(0, 3)}</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      <p className="text-[10px] font-black uppercase tracking-widest">Stock: {product.stock} {product.base_unit}</p>
                    </TooltipContent>
                  </Tooltip>
                </div>

                <div className="text-right">
                  <p className="text-[11px] font-black font-mono text-primary truncate">₹{product.selling_price || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </TooltipProvider>
  );
};

export default ProductGridView;
