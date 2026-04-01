import { useParams, useNavigate } from "react-router-dom";
import { useQuotation } from "@/hooks/useQuotations";
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
  BadgeInfo
} from "lucide-react";
import { getStatusColor } from "./QuotationsTab";

const QuotationViewPage = () => {
  const { quotationId } = useParams();
  const navigate = useNavigate();
  const { data: quotation, isLoading } = useQuotation(quotationId);

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
        <p className="text-muted-foreground mb-6">The quotation you are looking for might have been removed or renamed.</p>
        <Button onClick={() => navigate(-1)}>Go Back</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-theme(spacing.16))] mx-auto w-full animate-in fade-in duration-700 bg-slate-50/30">
      {/* Premium Header */}
      <div className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-md px-6 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="h-9 w-9 rounded-full bg-muted/50 hover:bg-muted transition-all"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl font-black text-foreground tracking-tight">
                  Quotation #{quotation.quotation_number}
                </h1>
                <Badge variant="outline" className={`${getStatusColor(quotation.status)} px-3 py-0.5 text-[10px] font-bold uppercase tracking-widest border-2`}>
                  {quotation.status}
                </Badge>
              </div>
              <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1.5 font-mono">
                ID: {quotation.id}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="h-9 gap-2 shadow-sm font-bold text-[11px] uppercase tracking-wider border-border/60">
              <Printer className="h-3.5 w-3.5" />
              Print
            </Button>
            <Button variant="outline" size="sm" className="h-9 gap-2 shadow-sm font-bold text-[11px] uppercase tracking-wider border-border/60">
              <Download className="h-3.5 w-3.5" />
              Download
            </Button>
            <Button size="sm" className="h-9 gap-2 shadow-sm font-bold text-[11px] uppercase tracking-wider ml-1">
              <Mail className="h-3.5 w-3.5" />
              Send to Email
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
        <div className="max-w-[1200px] mx-auto space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Column: Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Customer Info Card */}
              <Card className="border-border/40 shadow-sm overflow-hidden group">
                <div className="absolute top-0 left-0 w-1 h-full bg-primary/40 group-hover:bg-primary transition-all" />
                <CardHeader className="pb-4 bg-muted/10 border-b border-border/10">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                      <User className="h-4 w-4 text-primary" />
                      Client Details
                    </CardTitle>
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Customer Name</span>
                        <p className="text-sm font-bold text-foreground bg-primary/5 px-2 py-1 rounded-sm border border-primary/10 inline-block w-fit">
                          {quotation.lead_name || "—"}
                        </p>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest underline decoration-primary/20">Company</span>
                        <p className="text-sm font-medium flex items-center gap-1.5">
                          <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                          {quotation.company_name || "Self / Individual"}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Email Address</span>
                        <p className="text-sm font-medium flex items-center gap-1.5 text-blue-600 hover:underline cursor-pointer">
                          <MailIcon className="h-3.5 w-3.5 text-blue-500/60" />
                          {(quotation as any).lead_email || "—"}
                        </p>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-bold text-emerald-600/80 uppercase tracking-widest">Phone Number</span>
                        <p className="text-sm font-medium flex items-center gap-1.5">
                          <PhoneCall className="h-3.5 w-3.5 text-emerald-500/60" />
                          {(quotation as any).lead_phone || "—"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-border/10">
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">GST Number</span>
                      <p className="text-xs font-mono font-bold bg-slate-100 px-2 py-1 rounded-sm w-fit uppercase border border-slate-200">
                        {(quotation as any).gst_number || "NOT SPECIFIED"}
                      </p>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">PAN Number</span>
                      <p className="text-xs font-mono font-bold bg-slate-100 px-2 py-1 rounded-sm w-fit uppercase border border-slate-200">
                        {(quotation as any).pan_number || "NOT SPECIFIED"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Items Table Card */}
              <Card className="border-border/40 shadow-sm overflow-hidden">
                <CardHeader className="pb-4 bg-muted/10 border-b border-border/10">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                      <FileText className="h-4 w-4 text-primary" />
                      Invoiced Items
                    </CardTitle>
                    <span className="text-[10px] font-bold text-muted-foreground bg-white px-2 py-0.5 rounded-full border border-border/20 uppercase tracking-tighter">
                      {quotation.items?.length || 0} Products
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="w-full overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead className="bg-muted/5 border-b border-border/10">
                        <tr className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                          <th className="px-6 py-4">Item Details</th>
                          <th className="px-4 py-4 text-center">Qty</th>
                          <th className="px-4 py-4 text-right">Price</th>
                          <th className="px-4 py-4 text-right">GST</th>
                          <th className="px-6 py-4 text-right">Row Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/10">
                        {quotation.items?.map((item, idx) => (
                          <tr key={idx} className="hover:bg-muted/5 transition-colors group">
                            <td className="px-6 py-5">
                              <div className="flex flex-col gap-1">
                                <span className="text-sm font-bold text-foreground">
                                  {item.item_name}
                                </span>
                                <span className="text-[10px] font-mono text-muted-foreground uppercase font-bold bg-muted/30 px-1.5 py-0.5 rounded-sm w-fit">
                                  {item.item_code || "N/A"}
                                </span>
                                {item.item_description && (
                                  <p className="text-[11px] text-muted-foreground/80 mt-1 max-w-[200px] leading-relaxed">
                                    {item.item_description}
                                  </p>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-5 text-center">
                              <span className="text-sm font-bold px-2 py-1 bg-muted rounded-md min-w-[32px] inline-block">
                                {item.quantity}
                              </span>
                            </td>
                            <td className="px-4 py-5 text-right font-mono text-sm font-medium">
                              ₹{(item.unit_price || 0).toLocaleString()}
                            </td>
                            <td className="px-4 py-5 text-right">
                              <div className="flex flex-col items-end gap-0.5">
                                <Badge variant="secondary" className="px-1 py-0 h-4 text-[9px] font-black uppercase tracking-tighter">
                                  {(item as any).gst_percentage}% GST
                                </Badge>
                                <span className="text-[11px] font-mono font-bold text-emerald-600">
                                  +₹{((item as any).gst_amount || 0).toLocaleString()}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-5 text-right">
                              <span className="text-sm font-black text-foreground font-mono">
                                ₹{((item as any).amount + ((item as any).gst_amount || 0)).toLocaleString()}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              {/* Notes Card */}
              {quotation.notes && (
                <Card className="border-border/40 shadow-sm">
                  <CardHeader className="pb-3 flex-row items-center justify-between space-y-0">
                    <CardTitle className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                       <BadgeInfo className="h-4 w-4" />
                       Terms & Notes
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground leading-relaxed italic bg-blue-50/20 p-4 rounded-md border border-blue-500/10">
                      "{quotation.notes}"
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Right Column: Financial Summary */}
            <div className="lg:col-span-1 space-y-6">
              {/* Summary Card */}
              <Card className="border-border/40 shadow-md bg-slate-900 text-white overflow-hidden sticky top-24">
                <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full -mr-12 -mt-12 blur-3xl" />
                <CardHeader className="border-b border-white/10">
                  <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-primary-foreground/60">
                    Financial Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-8 pb-8 space-y-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center group">
                      <span className="text-sm font-medium text-white/50 group-hover:text-white transition-colors">Untaxed Subtotal</span>
                      <span className="text-base font-mono font-bold">₹{quotation.sub_total?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center group text-emerald-400">
                      <span className="text-sm font-medium opacity-60 group-hover:opacity-100 transition-colors">Total Tax (GST)</span>
                      <span className="text-base font-mono font-bold">+₹{quotation.tax_total?.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-white/10 mt-6 h-fit bg-white/5 -mx-6 p-6 rounded-b-xl border-b-primary/40 border-b-2">
                    <div className="flex flex-col gap-2">
                      <div className="flex justify-between items-baseline mb-2">
                        <span className="text-[10px] font-black uppercase tracking-widest text-primary-foreground/40">Grand Total Payable</span>
                        <Badge className="bg-primary/20 text-primary-foreground border-primary/20 text-[9px] font-bold uppercase tracking-widest h-5">INR</Badge>
                      </div>
                      <span className="text-4xl font-black tracking-tighter text-white font-mono">
                        ₹{quotation.grand_total?.toLocaleString()}
                      </span>
                      <p className="text-[10px] font-bold text-white/40 uppercase tracking-wide mt-2 italic leading-relaxed">
                        {quotation.amount_in_words}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Status Timeline / History Placeholder */}
              <Card className="border-border/40 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Quotation History</CardTitle>
                </CardHeader>
                <CardContent className="pt-4 space-y-4">
                  <div className="flex items-start gap-3 relative pb-4">
                    <div className="absolute left-1.5 top-3 w-0.5 h-full bg-border/40" />
                    <div className="h-3 w-3 rounded-full bg-primary mt-1 z-10 shrink-0" />
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-foreground">Quotation Created</span>
                      <span className="text-[10px] text-muted-foreground">{formatDate(quotation.created_at)}</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="h-3 w-3 rounded-full bg-slate-300 mt-1 z-10 shrink-0" />
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-muted-foreground">Pending Approval</span>
                      <span className="text-[10px] text-muted-foreground/50">Initial Draft Stage</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default QuotationViewPage;
