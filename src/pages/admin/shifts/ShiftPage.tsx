import { useMemo, useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import DataTable, { Column } from "@/components/DataTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import StatusBadge from "@/components/StatusBadge";
import { Plus, Search, Edit, Trash2 } from "lucide-react";
import ShiftModal from "./ShiftModal";
import {
  useShifts,
  useCreateShift,
  useUpdateShift,
  useDeleteShift,
} from "@/hooks/useShifts";
import { Shift } from "@/types/shift";
import { useDebounce } from "@/hooks/useDebounce";

const ShiftPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSearch = searchParams.get("search") || "";
  const [search, setSearch] = useState(initialSearch);
  const debouncedSearch = useDebounce(search, 400);

  useEffect(() => {
    const currentValue = searchParams.get("search") || "";
    if (currentValue === debouncedSearch) return;
    const nextParams = new URLSearchParams(searchParams);
    if (debouncedSearch) {
      nextParams.set("search", debouncedSearch);
    } else {
      nextParams.delete("search");
    }
    setSearchParams(nextParams, { replace: true });
  }, [debouncedSearch, searchParams, setSearchParams]);

  useEffect(() => {
    const param = searchParams.get("search") || "";
    setSearch(param);
  }, [searchParams]);

  const { data, isLoading } = useShifts({
    search: debouncedSearch || undefined,
  });
  const createShift = useCreateShift();
  const updateShift = useUpdateShift();
  const deleteShift = useDeleteShift();

  const shifts = useMemo<Shift[]>(() => {
    return data?.shifts || data?.items || [];
  }, [data]);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);
  const [shiftToDelete, setShiftToDelete] = useState<Shift | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleSave = async (payload: Partial<Shift>) => {
    try {
      if (selectedShift) {
        await updateShift.mutateAsync({ id: selectedShift.id, ...payload });
      } else {
        await createShift.mutateAsync(payload);
      }
      setModalOpen(false);
      setSelectedShift(null);
    } catch (error) {
      console.error(error);
    }
  };

  const handleEdit = (shift: Shift) => {
    setSelectedShift(shift);
    setModalOpen(true);
  };

  const handleDeleteConfirmation = async () => {
    if (!shiftToDelete) return;
    try {
      await deleteShift.mutateAsync(shiftToDelete.id);
      setShiftToDelete(null);
      setDeleteError(null);
    } catch (error: unknown) {
      console.error(error);
      const message =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || "Failed to delete shift";
      setDeleteError(message);
    }
  };

  const columns: Column<Shift>[] = [
    {
      key: "name",
      header: "Shift",
      className: "min-w-[220px]",
      render: (shift) => (
        <div>
          <p className="text-sm font-semibold text-foreground">{shift.name}</p>
        </div>
      ),
    },
    {
      key: "start_time",
      header: "Start Time",
      render: (shift) => (
        <p className="text-sm font-medium text-foreground">
          {shift.start_time}
        </p>
      ),
    },
    {
      key: "end_time",
      header: "End Time",
      render: (shift) => (
        <p className="text-sm font-medium text-foreground">{shift.end_time}</p>
      ),
    },
    {
      key: "is_active",
      header: "Status",
      render: (shift) => (
        <StatusBadge
          status={shift.is_active ? "Active" : "Inactive"}
          variant={shift.is_active ? "success" : "destructive"}
        />
      ),
    },
    {
      key: "actions",
      header: "",
      className: "w-[120px] text-right",
      render: (shift) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={(event) => {
              event.stopPropagation();
              handleEdit(shift);
            }}
            title="Edit shift"
          >
            <Edit className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={(event) => {
              event.stopPropagation();
              setShiftToDelete(shift);
            }}
            title="Delete shift"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  const rowClick = (shift: Shift) => {
    const searchQuery = debouncedSearch
      ? `?search=${encodeURIComponent(debouncedSearch)}`
      : "";
    navigate(`${shift.id}${searchQuery}`);
  };

  return (
    <div className="w-full mx-auto space-y-2 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-border pb-2">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search shifts..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8 pl-7 text-sm rounded-sm w-full sm:w-64"
            />
          </div>
        </div>
        <Button
          size="sm"
          className="h-8 text-xs rounded-sm gap-2 flex-1 sm:flex-none"
          onClick={() => {
            setSelectedShift(null);
            setModalOpen(true);
          }}
        >
          <Plus className="h-3.5 w-3.5" /> Add Shift
        </Button>
      </div>

      <div className="border border-border rounded-sm overflow-hidden bg-card shadow-sm">
        <DataTable
          data={shifts}
          columns={columns}
          isLoading={isLoading}
          onRowClick={rowClick}
        />
      </div>

      <ShiftModal
        open={modalOpen}
        shift={selectedShift}
        onClose={() => {
          setModalOpen(false);
          setSelectedShift(null);
        }}
        onSave={handleSave}
      />

      <AlertDialog
        open={Boolean(shiftToDelete)}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            setShiftToDelete(null);
            setDeleteError(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Shift</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this shift?
            </AlertDialogDescription>
            {deleteError && (
              <p className="text-xs text-destructive mt-2">{deleteError}</p>
            )}
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setShiftToDelete(null);
                setDeleteError(null);
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirmation}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ShiftPage;
