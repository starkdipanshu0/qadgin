"use client";

import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Plus, X } from "lucide-react";
import { useState, useEffect } from "react";

interface AttributeEditorProps {
    value: Record<string, string[]>;
    onChange: (value: Record<string, string[]>) => void;
}

export const AttributeEditor = ({ value, onChange }: AttributeEditorProps) => {
    // Internal state: Array of { key, valuesString } for easier editing
    const [rows, setRows] = useState<{ key: string; values: string }[]>([]);

    // Sync internal state with external value on mount (or if external changes strictly)
    useEffect(() => {
        if (!value) {
            setRows([]);
            return;
        }
        const newRows = Object.entries(value).map(([k, v]) => ({
            key: k,
            values: Array.isArray(v) ? v.join(", ") : "",
        }));
        // Only update if different to avoid cursor jumping loops (rough check)
        if (JSON.stringify(newRows) !== JSON.stringify(rows)) {
            setRows(newRows);
        }
    }, [value]);

    const updateParent = (newRows: { key: string; values: string }[]) => {
        const newVal: Record<string, string[]> = {};
        newRows.forEach((row) => {
            if (row.key.trim()) {
                newVal[row.key] = row.values
                    .split(",")
                    .map((s) => s.trim())
                    .filter((s) => s.length > 0);
            }
        });
        onChange(newVal);
    };

    const handleRowChange = (index: number, field: "key" | "values", val: string) => {
        const newRows = [...rows];
        const oldRow = newRows[index];
        if (!oldRow) return;

        if (field === "key") {
            newRows[index] = { key: val, values: oldRow.values };
        } else {
            newRows[index] = { key: oldRow.key, values: val };
        }
        setRows(newRows);
        updateParent(newRows);
    };

    const addRow = () => {
        setRows([...rows, { key: "", values: "" }]);
    };

    const removeRow = (index: number) => {
        const newRows = rows.filter((_, i) => i !== index);
        setRows(newRows);
        updateParent(newRows);
    };

    return (
        <div className="space-y-3 border p-4 rounded-md bg-slate-50">
            <div className="flex justify-between items-center">
                <Label className="text-base font-semibold">Product Attributes</Label>
                <Button size="sm" variant="outline" onClick={(e) => { e.preventDefault(); addRow(); }}>
                    <Plus className="w-4 h-4 mr-2" /> Add Attribute
                </Button>
            </div>

            {rows.length === 0 && (
                <p className="text-sm text-muted-foreground italic">No attributes defined (e.g. Color, Size).</p>
            )}

            {rows.map((row, index) => (
                <div key={index} className="flex gap-2 items-end">
                    <div className="grid gap-1.5 flex-1">
                        {index === 0 && <Label className="text-xs">Attribute Name</Label>}
                        <Input
                            placeholder="e.g. Color"
                            value={row.key}
                            onChange={(e) => handleRowChange(index, 'key', e.target.value)}
                        />
                    </div>
                    <div className="grid gap-1.5 flex-[2]">
                        {index === 0 && <Label className="text-xs">Values (comma separated)</Label>}
                        <Input
                            placeholder="e.g. Red, Blue, Green"
                            value={row.values}
                            onChange={(e) => handleRowChange(index, 'values', e.target.value)}
                        />
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={(e) => { e.preventDefault(); removeRow(index); }}
                    >
                        <X className="w-4 h-4 text-red-500" />
                    </Button>
                </div>
            ))}
        </div>
    );
};
