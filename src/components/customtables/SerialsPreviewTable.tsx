import { Input } from "../ui/input";
import DataTable, { Column } from "../DataTable";

interface SerialRow {
    id: string;
    serial_number: string;
    batch_number: string;
}

interface SerialsPreviewTableProps {
    data: SerialRow[];
    onUpdate: (id: string, newSerial: string) => void;
    isLoading?: boolean;
}

const SerialsPreviewTable = ({ data, onUpdate, isLoading }: SerialsPreviewTableProps) => {
    const columns: Column<SerialRow>[] = [
        {
            key: "index",
            header: "#",
            render: (_: SerialRow) => (
                <div className="text-center font-mono opacity-50">
                    {data.findIndex(item => item.id === _.id) + 1}
                </div>
            ),
            className: "w-[60px]"
        },
        {
            key: "serial_number",
            header: "Serial Number",
            render: (row: SerialRow) => (
                <Input
                    value={row.serial_number}
                    onChange={(e) => onUpdate(row.id, e.target.value)}
                    className="h-7 text-[11px] font-mono bg-transparent border-transparent hover:border-border focus:border-primary transition-colors focus-visible:ring-0"
                />
            )
        },
        {
            key: "batch_number",
            header: "Batch #",
            render: (row: SerialRow) => (
                <span className="font-mono text-muted-foreground">{row.batch_number}</span>
            )
        }
    ];

    return (
        <div className="space-y-4">
            <DataTable
                data={data}
                columns={columns}
                pageSize={10}
                isLoading={isLoading}
                idKey="id"
            />
        </div>
    );
};

export default SerialsPreviewTable;
