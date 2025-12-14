import { useState } from 'react';
import { FileText, X } from 'lucide-react';

interface NewFileDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (filename: string) => void;
    type: 'exam' | 'worksheet' | 'lesson-plan';
}

const typeLabels = {
    'exam': 'テスト',
    'worksheet': 'プリント',
    'lesson-plan': '指導案',
};

const defaultNames = {
    'exam': '第1回定期考査',
    'worksheet': '演習プリント',
    'lesson-plan': '指導案',
};

export function NewFileDialog({ isOpen, onClose, onConfirm, type }: NewFileDialogProps) {
    const [filename, setFilename] = useState(defaultNames[type]);

    if (!isOpen) return null;

    const handleConfirm = () => {
        const name = filename.trim() || defaultNames[type];
        onConfirm(name.endsWith('.yaml') ? name : `${name}.yaml`);
        onClose();
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleConfirm();
        } else if (e.key === 'Escape') {
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-[var(--color-surface)] rounded-2xl shadow-2xl w-[400px] overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)]">
                    <div className="flex items-center gap-3">
                        <FileText size={20} className="text-[var(--color-primary)]" />
                        <h2 className="text-lg font-semibold">新規{typeLabels[type]}を作成</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-lg hover:bg-[var(--color-surface-hover)] text-[var(--color-text-muted)]"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    <label className="block text-sm text-[var(--color-text-muted)] mb-2">
                        ファイル名
                    </label>
                    <input
                        type="text"
                        value={filename}
                        onChange={(e) => setFilename(e.target.value)}
                        onKeyDown={handleKeyDown}
                        autoFocus
                        className="w-full px-4 py-3 rounded-lg bg-[var(--color-bg)] border border-[var(--color-border)] focus:border-[var(--color-primary)] focus:outline-none text-lg"
                        placeholder={defaultNames[type]}
                    />
                    <p className="mt-2 text-xs text-[var(--color-text-muted)]">
                        ※ 拡張子 .yaml は自動で付加されます
                    </p>
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-3 px-6 py-4 border-t border-[var(--color-border)] bg-[var(--color-surface-hover)]">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-lg hover:bg-[var(--color-border)] transition-colors"
                    >
                        キャンセル
                    </button>
                    <button
                        onClick={handleConfirm}
                        className="px-6 py-2 rounded-lg bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-dark)] transition-colors font-medium"
                    >
                        作成
                    </button>
                </div>
            </div>
        </div>
    );
}
