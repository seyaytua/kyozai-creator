import { useState, useEffect } from 'react';
import { Plus, Trash2, ChevronUp, ChevronDown } from 'lucide-react';
import { MathInputButton } from './MathEditor';
import jsYaml from 'js-yaml';

interface WorksheetData {
    タイトル: string;
    サブタイトル: string;
    解答を作成: boolean;
    問題: WorksheetItem[];
}

interface WorksheetItem {
    type?: 'header';
    text?: string;
    番号?: number;
    本文?: string;
    配点?: number;
    スペース?: number;
    小問?: string[];
    解答?: string | string[];
    解説?: string;
    改ページ?: boolean;
}

interface WorksheetFormEditorProps {
    yaml?: string;
    onYamlChange: (yaml: string) => void;
    initialData?: Partial<WorksheetData>;
}

export function WorksheetFormEditor({ yaml: yamlProp, onYamlChange }: WorksheetFormEditorProps) {
    const [data, setData] = useState<WorksheetData>({
        タイトル: '数学C 演習プリント',
        サブタイトル: '',
        解答を作成: true,
        問題: [
            { type: 'header', text: '基本問題' },
            { 番号: 1, 本文: '', 配点: 10, スペース: 6, 解答: '', 解説: '' }
        ],
    });

    const [initialized, setInitialized] = useState(false);

    // YAMLからフォームデータをパース (ExamFormEditorと同じパターン)
    useEffect(() => {
        if (yamlProp && !initialized) {
            try {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const parsed = jsYaml.load(yamlProp) as any;
                if (parsed && typeof parsed === 'object') {
                    setData({
                        タイトル: parsed.タイトル || '演習プリント',
                        サブタイトル: parsed.サブタイトル || '',
                        解答を作成: parsed.解答を作成 ?? true,
                        問題: (parsed.問題 || []).map((item: Record<string, unknown>) => ({
                            type: item.type,
                            text: item.text,
                            番号: item.番号,
                            本文: item.本文,
                            配点: item.配点,
                            スペース: item.スペース,
                            小問: Array.isArray(item.小問) ? item.小問.map(s => typeof s === 'string' ? s : String(s)) : undefined,
                            解答: item.解答,
                            解説: item.解説,
                            改ページ: item.改ページ,
                        })),
                    });
                    setInitialized(true);
                }
            } catch (e) {
                console.error('YAML parse error:', e);
            }
        }
    }, [yamlProp, initialized]);

    const updateField = <K extends keyof WorksheetData>(field: K, value: WorksheetData[K]) => {
        setData(prev => {
            const newData = { ...prev, [field]: value };
            generateAndEmitYaml(newData);
            return newData;
        });
    };

    const addHeader = () => {
        updateField('問題', [...data.問題, { type: 'header', text: '' }]);
    };

    const addQuestion = () => {
        const existingQuestions = data.問題.filter(item => item.番号);
        const nextNumber = existingQuestions.length + 1;
        updateField('問題', [...data.問題, {
            番号: nextNumber,
            本文: '',
            配点: 10,
            スペース: 6,
            解答: '',
            解説: ''
        }]);
    };

    const updateItem = (index: number, updates: Partial<WorksheetItem>) => {
        const items = [...data.問題];
        items[index] = { ...items[index], ...updates };
        updateField('問題', items);
    };

    const removeItem = (index: number) => {
        updateField('問題', data.問題.filter((_, i) => i !== index));
    };

    const moveItem = (index: number, direction: 'up' | 'down') => {
        const items = [...data.問題];
        const newIndex = direction === 'up' ? index - 1 : index + 1;
        if (newIndex < 0 || newIndex >= items.length) return;
        [items[index], items[newIndex]] = [items[newIndex], items[index]];
        updateField('問題', items);
    };

    const addSubQuestion = (index: number) => {
        const items = [...data.問題];
        const current = items[index].小問 || [];
        items[index].小問 = [...current, ''];
        updateField('問題', items);
    };

    const updateSubQuestion = (itemIndex: number, subIndex: number, value: string) => {
        const items = [...data.問題];
        if (items[itemIndex].小問) {
            items[itemIndex].小問![subIndex] = value;
            updateField('問題', items);
        }
    };

    const removeSubQuestion = (itemIndex: number, subIndex: number) => {
        const items = [...data.問題];
        if (items[itemIndex].小問) {
            items[itemIndex].小問 = items[itemIndex].小問!.filter((_, i) => i !== subIndex);
            updateField('問題', items);
        }
    };

    const generateAndEmitYaml = (d: WorksheetData) => {
        const generatedYaml = generateYaml(d);
        onYamlChange(generatedYaml);
    };

    const generateYaml = (d: WorksheetData): string => {
        const escape = (str: string) => {
            return str.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
        };

        let yaml = `タイトル: "${escape(d.タイトル)}"\n`;
        yaml += `サブタイトル: "${escape(d.サブタイトル)}"\n`;
        yaml += `解答を作成: ${d.解答を作成}\n\n`;

        yaml += `問題:\n`;
        d.問題.forEach(item => {
            if (item.type === 'header') {
                yaml += `  - type: header\n`;
                yaml += `    text: "${escape(item.text || '')}"\n`;
                if (item.改ページ) yaml += `    改ページ: true\n`;
            } else {
                yaml += `  - 番号: ${item.番号}\n`;
                yaml += `    本文: "${escape(item.本文 || '')}"\n`;
                if (item.配点) yaml += `    配点: ${item.配点}\n`;
                if (item.スペース) yaml += `    スペース: ${item.スペース}\n`;
                if (item.小問 && item.小問.length > 0) {
                    yaml += `    小問:\n`;
                    item.小問.forEach(sq => {
                        yaml += `      - "${escape(sq)}"\n`;
                    });
                }
                if (item.解答) {
                    if (Array.isArray(item.解答)) {
                        yaml += `    解答:\n`;
                        item.解答.forEach(a => {
                            yaml += `      - "${escape(a)}"\n`;
                        });
                    } else {
                        yaml += `    解答: "${escape(item.解答)}"\n`;
                    }
                }
                if (item.解説) yaml += `    解説: "${escape(item.解説)}"\n`;
                if (item.改ページ) yaml += `    改ページ: true\n`;
            }
        });

        return yaml;
    };

    return (
        <div className="h-full overflow-y-auto p-4 space-y-6">
            {/* 基本情報 */}
            <section className="space-y-3">
                <h3 className="font-semibold text-sm text-[var(--color-text-muted)] uppercase tracking-wide">基本情報</h3>
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="block text-xs text-[var(--color-text-muted)] mb-1">タイトル</label>
                        <input
                            type="text"
                            value={data.タイトル}
                            onChange={(e) => updateField('タイトル', e.target.value)}
                            className="w-full px-3 py-2 rounded-lg bg-[var(--color-bg)] border border-[var(--color-border)] focus:border-[var(--color-primary)] focus:outline-none text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-xs text-[var(--color-text-muted)] mb-1">サブタイトル</label>
                        <input
                            type="text"
                            value={data.サブタイトル}
                            onChange={(e) => updateField('サブタイトル', e.target.value)}
                            className="w-full px-3 py-2 rounded-lg bg-[var(--color-bg)] border border-[var(--color-border)] focus:border-[var(--color-primary)] focus:outline-none text-sm"
                            placeholder="例: 4-4 演習プリント"
                        />
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        id="createAnswer"
                        checked={data.解答を作成}
                        onChange={(e) => updateField('解答を作成', e.target.checked)}
                        className="w-4 h-4"
                    />
                    <label htmlFor="createAnswer" className="text-sm cursor-pointer">解答ページを作成する</label>
                </div>
            </section>

            {/* 問題リスト */}
            <section className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-sm text-[var(--color-text-muted)] uppercase tracking-wide">問題</h3>
                    <div className="flex gap-2">
                        <button
                            onClick={addHeader}
                            className="flex items-center gap-1 text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text)] px-2 py-1 rounded bg-[var(--color-surface-hover)]"
                        >
                            <Plus size={12} /> 見出し
                        </button>
                        <button
                            onClick={addQuestion}
                            className="flex items-center gap-1 text-xs text-[var(--color-primary)] hover:underline"
                        >
                            <Plus size={14} /> 問題を追加
                        </button>
                    </div>
                </div>

                {data.問題.map((item, index) => (
                    <div key={index} className="bg-[var(--color-surface-hover)] rounded-xl p-4 space-y-3">
                        {item.type === 'header' ? (
                            // ヘッダー項目
                            <div className="flex items-center gap-2">
                                <div className="flex flex-col">
                                    <button
                                        onClick={() => moveItem(index, 'up')}
                                        disabled={index === 0}
                                        className="p-0.5 rounded hover:bg-[var(--color-border)] text-[var(--color-text-muted)] disabled:opacity-30"
                                    >
                                        <ChevronUp size={14} />
                                    </button>
                                    <button
                                        onClick={() => moveItem(index, 'down')}
                                        disabled={index === data.問題.length - 1}
                                        className="p-0.5 rounded hover:bg-[var(--color-border)] text-[var(--color-text-muted)] disabled:opacity-30"
                                    >
                                        <ChevronDown size={14} />
                                    </button>
                                </div>
                                <span className="text-xs text-[var(--color-text-muted)]">見出し</span>
                                <input
                                    type="text"
                                    value={item.text || ''}
                                    onChange={(e) => updateItem(index, { text: e.target.value })}
                                    className="flex-1 px-3 py-2 rounded-lg bg-[var(--color-bg)] border border-[var(--color-border)] focus:border-[var(--color-primary)] focus:outline-none text-sm font-medium"
                                    placeholder="例: 基本問題"
                                />
                                <label className="flex items-center gap-1 text-xs text-orange-400 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={item.改ページ || false}
                                        onChange={(e) => updateItem(index, { 改ページ: e.target.checked })}
                                        className="rounded"
                                    />
                                    改ページ
                                </label>
                                <button
                                    onClick={() => removeItem(index)}
                                    className="p-1 rounded hover:bg-red-500/10 text-[var(--color-text-muted)] hover:text-red-400"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ) : (
                            // 問題項目
                            <>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="flex flex-col">
                                            <button
                                                onClick={() => moveItem(index, 'up')}
                                                disabled={index === 0}
                                                className="p-0.5 rounded hover:bg-[var(--color-border)] text-[var(--color-text-muted)] disabled:opacity-30"
                                            >
                                                <ChevronUp size={14} />
                                            </button>
                                            <button
                                                onClick={() => moveItem(index, 'down')}
                                                disabled={index === data.問題.length - 1}
                                                className="p-0.5 rounded hover:bg-[var(--color-border)] text-[var(--color-text-muted)] disabled:opacity-30"
                                            >
                                                <ChevronDown size={14} />
                                            </button>
                                        </div>
                                        <h4 className="font-medium">問題 {item.番号}</h4>
                                        <label className="flex items-center gap-1 text-xs text-orange-400 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={item.改ページ || false}
                                                onChange={(e) => updateItem(index, { 改ページ: e.target.checked })}
                                                className="rounded"
                                            />
                                            改ページ
                                        </label>
                                    </div>
                                    <button
                                        onClick={() => removeItem(index)}
                                        className="p-1 rounded hover:bg-red-500/10 text-[var(--color-text-muted)] hover:text-red-400"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>

                                <div>
                                    <div className="flex items-center justify-between mb-1">
                                        <label className="text-xs text-[var(--color-text-muted)]">問題文</label>
                                        <MathInputButton onInsert={(latex) => updateItem(index, { 本文: (item.本文 || '') + latex })} />
                                    </div>
                                    <textarea
                                        value={item.本文 || ''}
                                        onChange={(e) => updateItem(index, { 本文: e.target.value })}
                                        rows={2}
                                        className="w-full px-3 py-2 rounded-lg bg-[var(--color-bg)] border border-[var(--color-border)] focus:border-[var(--color-primary)] focus:outline-none text-sm resize-none"
                                        placeholder="問題文を入力... (数式は $...$ で囲む)"
                                    />
                                </div>

                                <div className="grid grid-cols-3 gap-3">
                                    <div>
                                        <label className="block text-xs text-[var(--color-text-muted)] mb-1">配点</label>
                                        <input
                                            type="number"
                                            value={item.配点 || 10}
                                            onChange={(e) => updateItem(index, { 配点: Number(e.target.value) })}
                                            className="w-full px-3 py-2 rounded-lg bg-[var(--color-bg)] border border-[var(--color-border)] focus:border-[var(--color-primary)] focus:outline-none text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-[var(--color-text-muted)] mb-1">解答スペース（行）</label>
                                        <input
                                            type="number"
                                            value={item.スペース || 6}
                                            onChange={(e) => updateItem(index, { スペース: Number(e.target.value) })}
                                            className="w-full px-3 py-2 rounded-lg bg-[var(--color-bg)] border border-[var(--color-border)] focus:border-[var(--color-primary)] focus:outline-none text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-[var(--color-text-muted)] mb-1">解答</label>
                                        <input
                                            type="text"
                                            value={typeof item.解答 === 'string' ? item.解答 : ''}
                                            onChange={(e) => updateItem(index, { 解答: e.target.value })}
                                            className="w-full px-3 py-2 rounded-lg bg-[var(--color-bg)] border border-[var(--color-border)] focus:border-[var(--color-primary)] focus:outline-none text-sm"
                                        />
                                    </div>
                                </div>

                                {/* 小問 */}
                                <div className="ml-4 space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-[var(--color-text-muted)]">小問（オプション）</span>
                                        <button
                                            onClick={() => addSubQuestion(index)}
                                            className="flex items-center gap-1 text-xs text-[var(--color-primary)] hover:underline"
                                        >
                                            <Plus size={12} /> 追加
                                        </button>
                                    </div>
                                    {(item.小問 || []).map((sq, sqIndex) => (
                                        <div key={sqIndex} className="flex items-center gap-2">
                                            <span className="text-xs text-[var(--color-text-muted)]">({sqIndex + 1})</span>
                                            <input
                                                type="text"
                                                value={sq}
                                                onChange={(e) => updateSubQuestion(index, sqIndex, e.target.value)}
                                                className="flex-1 px-2 py-1 rounded bg-[var(--color-bg)] border border-[var(--color-border)] focus:border-[var(--color-primary)] focus:outline-none text-sm"
                                                placeholder="小問の内容..."
                                            />
                                            <MathInputButton onInsert={(latex) => updateSubQuestion(index, sqIndex, sq + latex)} />
                                            <button
                                                onClick={() => removeSubQuestion(index, sqIndex)}
                                                className="p-1 rounded hover:bg-red-500/10 text-[var(--color-text-muted)] hover:text-red-400"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    ))}
                                </div>

                                <div>
                                    <label className="block text-xs text-[var(--color-text-muted)] mb-1">解説（オプション）</label>
                                    <input
                                        type="text"
                                        value={item.解説 || ''}
                                        onChange={(e) => updateItem(index, { 解説: e.target.value })}
                                        className="w-full px-3 py-2 rounded-lg bg-[var(--color-bg)] border border-[var(--color-border)] focus:border-[var(--color-primary)] focus:outline-none text-sm"
                                        placeholder="解説を入力..."
                                    />
                                </div>
                            </>
                        )}
                    </div>
                ))}
            </section>
        </div>
    );
}
