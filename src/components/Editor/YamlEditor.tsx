import { useEffect, useRef, useState } from 'react';
import { EditorView, basicSetup } from 'codemirror';
import { yaml } from '@codemirror/lang-yaml';
import { EditorState } from '@codemirror/state';
import { AlertCircle } from 'lucide-react';
import jsYaml from 'js-yaml';

interface YamlEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

export function YamlEditor({ value, onChange, placeholder }: YamlEditorProps) {
    const editorRef = useRef<HTMLDivElement>(null);
    const viewRef = useRef<EditorView | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Validate YAML
    useEffect(() => {
        try {
            if (value.trim()) {
                jsYaml.load(value);
                setError(null);
            }
        } catch (e) {
            if (e instanceof Error) {
                setError(e.message);
            }
        }
    }, [value]);

    // Initialize CodeMirror
    useEffect(() => {
        if (!editorRef.current) return;

        const theme = EditorView.theme({
            '&': {
                height: '100%',
                fontSize: '14px',
            },
            '.cm-content': {
                fontFamily: 'Monaco, Menlo, monospace',
                padding: '16px',
            },
            '.cm-gutters': {
                backgroundColor: 'var(--color-surface)',
                color: 'var(--color-text-muted)',
                border: 'none',
            },
            '.cm-activeLineGutter': {
                backgroundColor: 'var(--color-surface-hover)',
            },
            '.cm-activeLine': {
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
            },
            '&.cm-focused': {
                outline: 'none',
            },
        });

        const state = EditorState.create({
            doc: value,
            extensions: [
                basicSetup,
                yaml(),
                theme,
                EditorView.updateListener.of((update) => {
                    if (update.docChanged) {
                        onChange(update.state.doc.toString());
                    }
                }),
                EditorView.theme({
                    '&': { backgroundColor: 'var(--color-surface)' },
                }),
            ],
        });

        const view = new EditorView({
            state,
            parent: editorRef.current,
        });

        viewRef.current = view;

        return () => {
            view.destroy();
            viewRef.current = null;
        };
    }, []);

    // Update editor content when value changes externally
    useEffect(() => {
        if (viewRef.current) {
            const currentContent = viewRef.current.state.doc.toString();
            if (currentContent !== value) {
                viewRef.current.dispatch({
                    changes: { from: 0, to: currentContent.length, insert: value },
                });
            }
        }
    }, [value]);

    return (
        <div className="flex flex-col h-full bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] overflow-hidden">
            {/* Error Banner */}
            {error && (
                <div className="flex items-center gap-2 px-4 py-2 bg-red-500/10 border-b border-red-500/20 text-red-400 text-sm">
                    <AlertCircle size={16} />
                    <span>YAML構文エラー: {error.split('\n')[0]}</span>
                </div>
            )}

            {/* Editor Area */}
            <div className="flex-1 overflow-hidden">
                <div ref={editorRef} className="h-full" />
            </div>

            {/* Placeholder */}
            {!value && placeholder && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <p className="text-[var(--color-text-muted)]">{placeholder}</p>
                </div>
            )}
        </div>
    );
}
