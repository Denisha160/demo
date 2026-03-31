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

  // No pre-filling lead_id for new quotations as per request
  const initialData = quotationId ? undefined : ({ status: "DRAFT" } as any);

  return (
    <div className="flex flex-col h-[calc(100vh-theme(spacing.16))] mx-auto w-full animate-fade-in  ">
      {/* Navigation & Header */}
      <div className="sticky top-0 z-30 border-b border-border mb-4">
        <div className=" pb-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="h-8 w-8 rounded-sm"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-foreground flex items-center">
                {quotationId ? "Edit Quotation" : "Create New Quotation"}
              </h1>
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
      <div className="flex-1 overflow-y-auto">
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
