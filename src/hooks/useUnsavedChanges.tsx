import { useEffect } from 'react';
import { useBlocker } from 'react-router-dom';

interface UseUnsavedChangesOptions {
    hasChanges: boolean;
    message?: string;
}

export function useUnsavedChanges({ hasChanges, message = 'データが保存されていません。ページを離れてもよろしいですか？' }: UseUnsavedChangesOptions) {
    // Block navigation when there are unsaved changes
    const blocker = useBlocker(
        ({ currentLocation, nextLocation }) =>
            hasChanges && currentLocation.pathname !== nextLocation.pathname
    );

    // Handle browser refresh/close
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (hasChanges) {
                e.preventDefault();
                e.returnValue = message;
                return message;
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [hasChanges, message]);

    return blocker;
}

// Confirmation Dialog Component
interface UnsavedChangesDialogProps {
    blocker: ReturnType<typeof useBlocker>;
    onSave?: () => void;
}

export function UnsavedChangesDialog({ blocker, onSave }: UnsavedChangesDialogProps) {
    if (blocker.state !== 'blocked') {
        return null;
    }

    const handleSaveAndLeave = () => {
        if (onSave) {
            onSave();
        }
        blocker.proceed();
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-[var(--color-surface)] rounded-2xl shadow-2xl w-[400px] p-6">
                <h2 className="text-lg font-semibold mb-3">⚠️ 未保存のデータがあります</h2>
                <p className="text-[var(--color-text-muted)] mb-6">
                    このページを離れると、編集中のデータが失われます。
                </p>
                <div className="flex justify-end gap-3">
                    <button
                        onClick={() => blocker.reset()}
                        className="px-4 py-2 rounded-lg bg-[var(--color-surface-hover)] hover:bg-[var(--color-border)] transition-colors"
                    >
                        キャンセル
                    </button>
                    {onSave && (
                        <button
                            onClick={handleSaveAndLeave}
                            className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors"
                        >
                            保存して移動
                        </button>
                    )}
                    <button
                        onClick={() => blocker.proceed()}
                        className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors"
                    >
                        保存せずに移動
                    </button>
                </div>
            </div>
        </div>
    );
}
