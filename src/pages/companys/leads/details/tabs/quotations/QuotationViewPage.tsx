import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";
import { useQuotation, useDownloadQuotation } from "@/hooks/useQuotations";
import { toast } from "react-toastify";
import { formatDate } from "@/utils/date";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Loader2,
  Printer,
  Mail,
  Download,
  Calendar,
  User,
  Building2,
  Mail as MailIcon,
  PhoneCall,
  FileText,
  BadgeInfo,
  Image as ImageIcon,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import DataTable, { Column } from "@/components/DataTable";
import { getStatusColor } from "./QuotationsTab";


const QuotationViewPage = () => {
  const { quotationId } = useParams();
  const navigate = useNavigate();
  const { data: quotation, isLoading } = useQuotation(quotationId);
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const { mutate: download, isPending: isDownloading } = useDownloadQuotation();

  const handleDownload = () => {
    if (!quotation?.id) {
      toast.error("Quotation details not found");
      return;
    }

    download({
      quotationId: quotation.id,
      quotationNumber: String(quotation.quotation_number),
    });
  };

  const nextImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (galleryImages.length === 0) return;
    setGalleryIndex((prev) => (prev + 1) % galleryImages.length);
  };

  const prevImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (galleryImages.length === 0) return;
    setGalleryIndex(
      (prev) => (prev - 1 + galleryImages.length) % galleryImages.length,
    );
  };

  const columns: Column<any>[] = [
    {
      key: "images",
      header: "Img",
      className: "px-2 py-2 w-[88px]",
      render: (item) => {
        const finalImages = ((item.images as string[] | undefined) || []).filter(
          Boolean,
        );

        return (
          <div
            className="h-16 w-16 rounded-sm bg-muted/20 border border-border/10 overflow-hidden flex items-center justify-center relative cursor-zoom-in"
            onClick={() => {
              if (finalImages.length > 0) {
                setGalleryImages(finalImages);
                setGalleryIndex(0);
              }
            }}
          >
            {finalImages.length > 0 ? (
              <>
                <div className="grid h-full w-full grid-cols-2 gap-px bg-border/10">
                  {finalImages.slice(0, 4).map((image, imageIdx) => (
                    <div
                      key={`${image}-${imageIdx}`}
                      className="relative overflow-hidden bg-muted/10"
                    >
                      <img
                        src={image}
                        alt={`Item ${imageIdx + 1}`}
                        className="h-full w-full object-cover"
                      />
                      {imageIdx === 3 && finalImages.length > 4 && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/55">
                          <span className="text-[10px] font-black tracking-widest text-white">
                            +{finalImages.length - 4}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                {finalImages.length > 1 && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <span className="text-white text-[10px] font-black tracking-widest">
                      {finalImages.length} IMAGES
                    </span>
                  </div>
                )}
              </>
            ) : (
              <ImageIcon className="h-4 w-4 text-muted-foreground/30" />
            )}
          </div>
        );
      },
    },
    {
      key: "item_name",
      header: "Item Details",
      className: "px-2 py-2",
      render: (item) => (
        <div className="flex flex-col gap-0.5">
          <span className="text-sm font-bold text-foreground tracking-tight">
            {item.item_name}
          </span>
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-mono font-black text-muted-foreground bg-slate-100 px-1 border border-border/40 rounded-[2px] uppercase">
              {item.item_code}
            </span>
            {item.fragrance_name && (
              <span className="text-[9px] font-black text-violet-600 bg-violet-50 px-1 border border-violet-100 rounded-[2px] uppercase">
                {item.fragrance_name}
              </span>
            )}
          </div>
          {item.item_description && (
            <p className="text-[11px] text-muted-foreground/70 mt-1.5 leading-relaxed bg-slate-50 p-2 rounded-sm border border-slate-100">
              {item.item_description}
            </p>
          )}
        </div>
      ),
    },
    {
      key: "quantity",
      header: "Qty",
      className: "px-2 py-2 w-20",
      render: (item) => (
        <span className="text-sm font-bold font-mono">{item.quantity}</span>
      ),
    },
    {
      key: "unit_price",
      header: "Unit Price",
      className: "px-2 py-2  w-32",
      render: (item) => (
        <span className="text-sm font-medium text-muted-foreground font-mono">
          ₹{(item.unit_price || 0).toLocaleString()}
        </span>
      ),
    },
    {
      key: "amount",
      header: "Amount",
      className: "px-2 py-2 w-40",
      render: (item) => (
        <span className="text-sm font-black text-foreground font-mono">
          ₹{(item.quantity * item.unit_price).toLocaleString()}
        </span>
      ),
    },
    {
      key: "gst_percentage",
      header: "GST %",
      className: "px-2 py-2 w-20",
      render: (item) => (
        <span className="text-xs font-bold text-muted-foreground">
          {item.gst_percentage || 0}%
        </span>
      ),
    },
    {
      key: "gst_amount",
      header: "GST Amt",
      className: "px-2 py-2 w-32",
      render: (item) => (
        <span className="text-sm font-bold text-primary font-mono tabular-nums">
          ₹{(item.gst_amount || 0).toLocaleString()}
        </span>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-theme(spacing.16))] items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-sm font-medium text-muted-foreground animate-pulse tracking-wide">
            Preparing your quotation view...
          </p>
        </div>
      </div>
    );
  }

  if (!quotation) {
    return (
      <div className="flex h-[calc(100vh-theme(spacing.16))] flex-col items-center justify-center bg-background">
        <FileText className="h-16 w-16 text-muted-foreground/20 mb-4" />
        <h2 className="text-xl font-bold">Quotation Not Found</h2>
        <p className="text-muted-foreground mb-6">
          The quotation you are looking for might have been removed or renamed.
        </p>
        <Button onClick={() => navigate(-1)}>Go Back</Button>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4 animate-fade-in pb-8">
      {" "}
      {/* Top Header - Following SalesMemberDetailPage style */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(-1)}
            className="p-1.5 hover:bg-muted rounded-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-foreground flex items-center gap-2">
              Quotation Details
              <Badge
                variant="outline"
                className={`${getStatusColor(quotation.status)} px-2 py-0 h-5 text-[9px] font-black uppercase tracking-widest border border-current/20`}
              >
                {quotation.status}
              </Badge>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-2 text-[10px] uppercase font-black tracking-widest bg-background"
          >
            <Printer className="h-3.5 w-3.5" />
            Print
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-2 text-[10px] uppercase font-black tracking-widest bg-background"
            onClick={handleDownload}
            disabled={isDownloading}
          >
            {isDownloading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Download className="h-3.5 w-3.5" />
            )}
            PDF
          </Button>
        </div>
      </div>
      <div className="w-full mx-auto space-y-2">
        {/* Customer Info Card - Profile Style */}
        <div className="bg-card border border-border rounded-sm p-2 shadow-sm">
          <div className="flex flex-col md:flex-row gap-2 items-start">
            <div
              className={`h-16 w-16 rounded-sm bg-primary/10 flex items-center justify-center text-primary text-xl font-black shrink-0 border border-primary/20 shadow-sm uppercase`}
            >
              {(quotation.lead_name || "?").charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-black text-foreground tracking-tight">
                    {quotation.lead_name}
                  </h2>
                  {quotation.company_name && (
                    <p className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
                      <Building2 className="h-3.5 w-3.5 text-primary/40" />
                      {quotation.company_name}
                    </p>
                  )}
                </div>
                <div className="flex flex-wrap gap-x-8 gap-y-2">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground/50">
                      Quotation Date
                    </span>
                    <span className="text-xs font-bold text-foreground bg-muted/50 px-2 py-0.5 rounded-sm border border-border/40 w-fit">
                      {formatDate(quotation.quotation_date)}
                    </span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground/50">
                      Quotation Number
                    </span>
                    <span className="text-xs font-bold text-foreground bg-muted/50 px-2 py-0.5 rounded-sm border border-border/40 w-fit">
                      #{quotation.quotation_number}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-x-8 gap-y-3 border-t border-border/10">
                {(quotation as any).lead_email && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground hover:underline cursor-pointer">
                    <MailIcon className="h-4 w-4 shrink-0 text-primary/60" />
                    <span className="font-medium">
                      {(quotation as any).lead_email}
                    </span>
                  </div>
                )}
                {(quotation as any).lead_phone && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <PhoneCall className="h-4 w-4 shrink-0 text-primary/60" />
                    <span className="font-bold tracking-tight">
                      {(quotation as any).lead_phone}
                    </span>
                  </div>
                )}
                {(quotation as any).gst_number && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="text-[10px] font-black bg-muted px-1.5 py-0.5 rounded-sm border border-border/40 uppercase">
                      GST
                    </span>
                    <span className="font-mono font-bold text-xs">
                      {(quotation as any).gst_number}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 pb-2">
          <div className="lg:col-span-2 space-y-2">
            {/* Bill Items Card */}
            <div className="border border-border rounded-sm shadow-sm overflow-hidden bg-card">
              <div className="py-3 px-4 bg-muted/5 border-b border-border/50 flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                  Line Items
                </span>
                <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-sm text-[10px] font-bold">
                  {quotation.items?.length || 0} TOTAL
                </span>
              </div>
              <DataTable
                columns={columns}
                data={quotation.items || []}
                enablePagination={false}
                pageSize={100}
              />
            </div>

            {/* Terms and Notes */}
            {quotation.notes && (
              <div className="bg-blue-50/30 border border-blue-500/10 rounded-sm p-4">
                <h4 className="text-[9px] font-black uppercase tracking-[0.2em] text-blue-600/60 mb-2 flex items-center gap-1.5">
                  <BadgeInfo className="h-3 w-3" />
                  Notes
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed italic">
                  "{quotation.notes}"
                </p>
              </div>
            )}
          </div>

          <div className="lg:col-span-1 space-y-2">
            {/* Financial Card - Enhanced Integration */}
            <Card className="border-border/40 shadow-sm bg-card border-l-4 border-l-primary overflow-hidden">
              <CardContent className="p-2 space-y-2">
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-muted-foreground">
                    <span className="text-[10px] font-black uppercase tracking-widest">
                      Base Amount
                    </span>
                    <span className="text-sm font-bold font-mono">
                      ₹
                      {(
                        quotation.sub_total ||
                        (quotation as any).subtotal ||
                        quotation.grand_total - (quotation.tax_total || 0)
                      ).toLocaleString()}
                    </span>
                  </div>
                  {(quotation.tax_total || 0) > 0 && (
                    <div className="flex justify-between items-center text-emerald-600">
                      <span className="text-[10px] font-black uppercase tracking-widest opacity-60">
                        Appl. Tax (GST)
                      </span>
                      <span className="text-sm font-bold font-mono tracking-tight">
                        +₹{quotation.tax_total?.toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-border/50 group">
                  <p className="text-[9px] font-black text-primary uppercase tracking-widest mb-1">
                    Final Payable
                  </p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-foreground tracking-tighter font-mono">
                      ₹{quotation.grand_total?.toLocaleString()}
                    </span>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase">
                      INR
                    </span>
                  </div>

                  <div className="mt-5 bg-muted/60 p-3 rounded-[2px] border border-border/50">
                    <p className="text-[9px] font-black text-muted-foreground/60 uppercase tracking-[0.1em] mb-1">
                      In Words
                    </p>
                    <p className="text-[10px] font-bold text-foreground leading-relaxed italic">
                      {quotation.amount_in_words}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      {galleryImages.length > 0 &&
        createPortal(
          <div
            className="fixed inset-0 top-0 left-0 z-[1000001] m-0 h-screen w-screen bg-black/95 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300 pointer-events-auto"
            onClick={() => setGalleryImages([])}
          >
            <button
              type="button"
              className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors z-[1000002]"
              onClick={() => setGalleryImages([])}
            >
              <X className="h-6 w-6" />
            </button>

            {galleryImages.length > 1 && (
              <>
                <button
                  type="button"
                  className="absolute left-6 top-1/2 -translate-y-1/2 p-4 bg-white/5 hover:bg-white/15 text-white rounded-full transition-all group scale-90 hover:scale-100 z-[1000002]"
                  onClick={prevImage}
                >
                  <ChevronLeft className="h-10 w-10 opacity-60 group-hover:opacity-100" />
                </button>
                <button
                  type="button"
                  className="absolute right-6 top-1/2 -translate-y-1/2 p-4 bg-white/5 hover:bg-white/15 text-white rounded-full transition-all group scale-90 hover:scale-100 z-[1000002]"
                  onClick={nextImage}
                >
                  <ChevronRight className="h-10 w-10 opacity-60 group-hover:opacity-100" />
                </button>

                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-white/10 text-white rounded-full text-xs font-black tracking-widest uppercase backdrop-blur-sm border border-white/10">
                  {galleryIndex + 1} / {galleryImages.length}
                </div>
              </>
            )}

            <div
              className="max-w-[70vw] max-h-[85vh] bg-white rounded-sm overflow-hidden shadow-2xl relative animate-in zoom-in duration-500 delay-150"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={galleryImages[galleryIndex]}
                alt={`Gallery Image ${galleryIndex + 1}`}
                className="max-w-full max-h-[80vh] object-contain"
              />
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
};

export default QuotationViewPage;
