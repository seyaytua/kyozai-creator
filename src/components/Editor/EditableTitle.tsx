import { useState, useRef, useEffect } from 'react';
import { Pencil, Check, X } from 'lucide-react';

interface EditableTitleProps {
    value: string;
    onChange: (newValue: string) => void;
    label: string;
}

export function EditableTitle({ value, onChange, label }: EditableTitleProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [editValue, setEditValue] = useState(value);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setEditValue(value);
    }, [value]);

    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [isEditing]);

    const handleSave = () => {
        if (editValue.trim()) {
            // 拡張子を確保
            let newFilename = editValue.trim();
            if (!newFilename.endsWith('.yaml') && !newFilename.endsWith('.yml')) {
                newFilename += '.yaml';
            }
            onChange(newFilename);
        }
        setIsEditing(false);
    };

    const handleCancel = () => {
        setEditValue(value);
        setIsEditing(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSave();
        } else if (e.key === 'Escape') {
            handleCancel();
        }
    };

    if (isEditing) {
        return (
            <div>
                <h1 className="font-semibold">{label}</h1>
                <div className="flex items-center gap-2 mt-1">
                    <input
                        ref={inputRef}
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        onBlur={handleSave}
                        className="px-2 py-1 text-sm rounded bg-[var(--color-bg)] border border-[var(--color-primary)] focus:outline-none"
                    />
                    <button
                        onClick={handleSave}
                        className="p-1 rounded hover:bg-green-500/20 text-green-400"
                    >
                        <Check size={14} />
                    </button>
                    <button
                        onClick={handleCancel}
                        className="p-1 rounded hover:bg-red-500/20 text-red-400"
                    >
                        <X size={14} />
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div>
            <h1 className="font-semibold">{label}</h1>
            <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-1 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors group"
            >
                <span>{value}</span>
                <Pencil size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
        </div>
    );
}
