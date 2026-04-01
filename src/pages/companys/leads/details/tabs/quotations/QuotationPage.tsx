import { useState, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import QuotationForm, { QuotationFormData } from "./QuotationForm";
import { UseFormSetError } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { useCreateQuotation, useUpdateQuotation, useQuotation } from "@/hooks/useQuotations";
import { formatDate } from "@/utils/date";

const QuotationPage = () => {
  const { companyId, id: leadId, quotationId } = useParams();
  const navigate = useNavigate();
  
  const { data: quotationData, isLoading: isLoadingQuotation } = useQuotation(quotationId);
  const { mutate: createQuotation, isPending: isCreating } = useCreateQuotation();
  const { mutate: updateQuotation, isPending: isUpdating } = useUpdateQuotation();

  const isSubmitting = isCreating || isUpdating;

  const initialData = useMemo(() => {
    if (!quotationData) return undefined;
    
    // Map items from total_amount to amount if needed
    const mappedItems = quotationData.items?.map((item: any) => ({
      ...item,
      amount: item.total_amount || item.amount || 0,
      type: item.kit_id ? "kit" : "product"
    }));

    return {
      ...quotationData,
      items: mappedItems,
      quotation_date: formatDate(quotationData.quotation_date)
    };
  }, [quotationData]);

  const handleSave = useCallback((
    data: QuotationFormData,
    setError: UseFormSetError<QuotationFormData>,
  ) => {
    const cleanPayload = (obj: any): any => {
      if (Array.isArray(obj)) {
        return obj.map(cleanPayload);
      }
      if (obj !== null && typeof obj === "object") {
        return Object.keys(obj).reduce((acc, key) => {
          let value = obj[key];
          if (value === "" || value === undefined) {
            value = null;
          } else if (typeof value === "object") {
            value = cleanPayload(value);
          }
          acc[key] = value;
          return acc;
        }, {} as any);
      }
      return obj;
    };

    const payload = {
      ...cleanPayload(data),
      lead_id: leadId!,
    };

    if (quotationId) {
      updateQuotation(
        { id: quotationId, ...payload } as any,
        {
          onSuccess: () => {
            navigate(`/${companyId}/leads/${leadId}?tab=quotations`);
          },
        }
      );
    } else {
      createQuotation(
        payload as any,
        {
          onSuccess: () => {
            navigate(`/${companyId}/leads/${leadId}?tab=quotations`);
          },
        }
      );
    }
  }, [companyId, leadId, quotationId, createQuotation, updateQuotation, navigate]);

  const handleCancel = () => {
    navigate(`/${companyId}/leads/${leadId}?tab=quotations`);
  };

  if (quotationId && isLoadingQuotation) {
    return (
      <div className="flex h-[calc(100vh-theme(spacing.16))] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

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
