import { Product } from "@/types/products";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package, MoreVertical, Eye, Edit2, Archive } from "lucide-react";
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
          className="group hover:shadow-md transition-all duration-300 border-border/60 hover:border-primary/30 rounded-sm overflow-hidden bg-card/40 backdrop-blur-sm flex flex-col relative"
        >
          {/* Status Overlay */}
          <div className="absolute top-2 left-2 z-10">
            <StatusBadge
              status={product.product_type}
              variant="info"
              className="text-[9px] h-4 px-1.5 font-black tracking-widest uppercase bg-background/80 backdrop-blur-sm border-white/10 shadow-sm"
            />
          </div>

          {/* Action Menu */}
          <div className="absolute top-2 right-1 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6 bg-background/80 backdrop-blur-sm hover:bg-background">
                  <MoreVertical className="h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="text-xs">
                <DropdownMenuItem onClick={() => onView(product.id)}>
                  <Eye className="h-3 w-3 mr-2" /> View Details
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Image Container */}
          <div
            className="h-32 w-full bg-muted/20 relative overflow-hidden cursor-zoom-in group/img"
            onClick={() => onView(product.id)}
          >
            {product.images && product.images.length > 0 ? (
              <img
                src={getImageUrl(product.images[0])}
                alt={product.product_name}
                className="h-full w-full object-cover transition-transform duration-500 group-hover/img:scale-110"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center bg-slate-50/50">
                <Package className="h-8 w-8 text-muted-foreground/10" />
              </div>
            )}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
          </div>

          <CardContent className="p-3 flex-1 flex flex-col gap-3">
            <div className="space-y-1.5 flex-1">
              <div className="flex items-start justify-between gap-2">
                <h3
                  className="text-sm font-bold tracking-tight text-foreground line-clamp-2 cursor-pointer hover:text-primary transition-colors h-10"
                  onClick={() => onView(product.id)}
                >
                  {product.product_name}
                </h3>
              </div>

              <div className="flex flex-wrap gap-1 items-center">
                {product.category_name && (
                  <span className="text-[10px] font-medium text-slate-500 bg-slate-100/80 px-1.5 py-0.5 rounded-[2px] border border-slate-200/50">
                    {product.category_name}
                  </span>
                )}
                {product.brand_name && (
                  <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 border border-indigo-100 px-1.5 py-0.5 rounded-[2px] uppercase">
                    {product.brand_name}
                  </span>
                )}
                {product.fragrance_name && (
                  <span className="text-[10px] font-black text-fuchsia-600 bg-fuchsia-50 border border-fuchsia-100 px-1.5 py-0.5 rounded-[2px] uppercase">
                    {product.fragrance_name}
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between text-[10px] font-mono font-bold text-slate-400 pt-1">
                <span>#{product.code || 'NO CODE'}</span>
                <span className="text-[9px] text-muted-foreground/60 uppercase">
                  {product.base_unit} ({product.unit_category})
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-border/40 grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-[0.1em] text-muted-foreground/50">Stock Info</p>
                <div className="flex items-baseline gap-1">
                  <p className={`text-sm font-black ${Number(product.stock) <= 0 ? 'text-destructive' : 'text-slate-800'}`}>
                    {product.stock}
                  </p>
                  <span className="text-[10px] font-bold text-muted-foreground/60 uppercase">{product.base_unit}</span>
                </div>
              </div>

              <div className="space-y-1 text-right border-l border-border/40 pl-2">
                <p className="text-[10px] font-black uppercase tracking-[0.1em] text-muted-foreground/50">Price Guide</p>
                <div className="flex flex-col">
                  <div className="flex justify-between items-center gap-1">
                    <span className="text-[9px] font-bold text-muted-foreground/60">CP:</span>
                    <span className="text-[11px] font-bold font-mono text-slate-600">₹{product.cost_price?.toLocaleString() || 0}</span>
                  </div>
                  <div className="flex justify-between items-center gap-1">
                    <span className="text-[9px] font-black text-primary/60">SP:</span>
                    <span className="text-xs font-black font-mono text-primary">₹{product.selling_price?.toLocaleString() || 0}</span>
                  </div>
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
