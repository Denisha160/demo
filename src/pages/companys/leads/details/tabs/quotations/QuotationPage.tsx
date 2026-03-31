import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import QuotationForm, { QuotationFormData } from "./QuotationForm";
import { UseFormSetError } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, Save } from "lucide-react";

const QuotationPage = () => {
  const { companyId, id: leadId, quotationId } = useParams();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSave = async (
    data: QuotationFormData,
    setError: UseFormSetError<QuotationFormData>,
  ) => {
    setIsSubmitting(true);
    try {
      console.log("Saving quotation for lead:", leadId, data);
      // Mock API delay
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success(
        quotationId
          ? "Quotation updated successfully"
          : "Quotation created successfully",
      );
      navigate(`/${companyId}/leads/${leadId}?tab=quotations`);
    } catch (error) {
      console.error("Save error:", error);
      toast.error("Failed to save quotation");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate(`/${companyId}/leads/${leadId}?tab=quotations`);
  };

  // Pre-fill lead_id for new quotations
  const initialData = quotationId
    ? undefined
    : ({ lead_id: leadId, status: "DRAFT" } as any);

  return (
    <div className="flex flex-col h-[calc(100vh-theme(spacing.16))] mx-auto w-full animate-fade-in  ">
      {/* Navigation & Header */}
      <div className="sticky top-0 z-30 border-b border-border mb-6">
        <div className=" py-1 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="h-8 w-8 rounded-sm"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-foreground flex items-center gap-2">
                {quotationId ? "Edit Quotation" : "Create New Quotation"}
              </h1>
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
                Lead Details / {quotationId ? "Edit" : "New"} Quotation
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              form="quotation-form"
              type="submit"
              size="sm"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              {quotationId ? "Update Quotation" : "Save Quotation"}
            </Button>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="px-2 flex-1 overflow-y-auto">
        <QuotationForm
          onSave={handleSave}
          onCancel={handleCancel}
          quotationData={initialData}
          isSubmitting={isSubmitting}
        />
      </div>
    </div>
  );
};

export default QuotationPage;
