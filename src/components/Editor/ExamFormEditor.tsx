import { useState, useEffect } from 'react';
import { Plus, Trash2, GripVertical } from 'lucide-react';
import { MathInputButton } from './MathEditor';
import jsYaml from 'js-yaml';

interface ExamData {
    タイトル: string;
    科目: string;
    学校名: string;
    試験時間: number;
    配点合計: number;
    サブタイトル: string;
    注意事項: string[];
    大問: Question[];
}

interface Question {
    番号: number;
    タイトル: string;
    必須: boolean;
    配点: number;
    改ページ?: boolean;
    小問: SubQuestion[];
}

interface SubQuestion {
    番号: string;
    本文: string;
    配点: number;
    解答: string;
    解説: string;
    改ページ?: boolean;
}

interface ExamFormEditorProps {
    onYamlChange: (yaml: string) => void;
    yamlValue?: string;
}

export function ExamFormEditor({ onYamlChange, yamlValue }: ExamFormEditorProps) {
    const [data, setData] = useState<ExamData>({
        タイトル: '第1回定期考査',
        科目: '',
        学校名: '',
        試験時間: 50,
        配点合計: 100,
        サブタイトル: '',
        注意事項: ['問題は全部で4問あります。', '計算用紙として裏面を使用してもよい。'],
        大問: [{
            番号: 1,
            タイトル: '',
            必須: true,
            配点: 25,
            小問: [{ 番号: '(1)', 本文: '', 配点: 10, 解答: '', 解説: '' }]
        }],
    });

    const [initialized, setInitialized] = useState(false);

    // YAMLからフォームデータをパース
    useEffect(() => {
        if (yamlValue && !initialized) {
            try {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const parsed = jsYaml.load(yamlValue) as any;
                if (parsed && typeof parsed === 'object') {
                    setData({
                        タイトル: parsed.タイトル || '第1回定期考査',
                        科目: parsed.科目 || '',
                        学校名: parsed.学校名 || '',
                        試験時間: parsed.試験時間 || 50,
                        配点合計: parsed.配点合計 || 100,
                        サブタイトル: parsed.サブタイトル || '',
                        注意事項: parsed.注意事項 || [],
                        大問: (parsed.大問 || []).map((q: unknown, i: number) => {
                            const qData = q as Record<string, unknown>;
                            return {
                                番号: qData.番号 || i + 1,
                                タイトル: qData.タイトル || '',
                                必須: qData.必須 ?? true,
                                配点: qData.配点 || 25,
                                改ページ: qData.改ページ || false,
                                小問: ((qData.小問 || []) as unknown[]).map((sq: unknown, j: number) => {
                                    if (typeof sq === 'object' && sq !== null) {
                                        const sqData = sq as Record<string, unknown>;
                                        return {
                                            番号: sqData.番号 || `(${j + 1})`,
                                            本文: sqData.本文 || '',
                                            配点: sqData.配点 || 10,
                                            解答: sqData.解答 || '',
                                            解説: sqData.解説 || '',
                                            改ページ: sqData.改ページ || false,
                                        };
                                    }
                                    return { 番号: `(${j + 1})`, 本文: String(sq), 配点: 10, 解答: '', 解説: '' };
                                }),
                            };
                        }),
                    });
                    setInitialized(true);
                }
            } catch (e) {
                console.error('YAML parse error:', e);
            }
        }
    }, [yamlValue, initialized]);


    const updateField = <K extends keyof ExamData>(field: K, value: ExamData[K]) => {
        setData(prev => {
            const newData = { ...prev, [field]: value };
            generateAndEmitYaml(newData);
            return newData;
        });
    };

    const addNote = () => {
        updateField('注意事項', [...data.注意事項, '']);
    };

    const updateNote = (index: number, value: string) => {
        const notes = [...data.注意事項];
        notes[index] = value;
        updateField('注意事項', notes);
    };

    const removeNote = (index: number) => {
        updateField('注意事項', data.注意事項.filter((_, i) => i !== index));
    };

    const addQuestion = () => {
        updateField('大問', [...data.大問, {
            番号: data.大問.length + 1,
            タイトル: '',
            必須: true,
            配点: 25,
            小問: [{ 番号: '(1)', 本文: '', 配点: 10, 解答: '', 解説: '' }]
        }]);
    };

    const updateQuestion = (qIndex: number, field: keyof Question, value: unknown) => {
        const questions = [...data.大問];
        questions[qIndex] = { ...questions[qIndex], [field]: value };
        updateField('大問', questions);
    };

    const removeQuestion = (qIndex: number) => {
        updateField('大問', data.大問.filter((_, i) => i !== qIndex));
    };

    const addSubQuestion = (qIndex: number) => {
        const questions = [...data.大問];
        const subCount = questions[qIndex].小問.length;
        questions[qIndex].小問.push({
            番号: `(${subCount + 1})`,
            本文: '',
            配点: 10,
            解答: '',
            解説: ''
        });
        updateField('大問', questions);
    };

    const updateSubQuestion = (qIndex: number, sIndex: number, field: keyof SubQuestion, value: unknown) => {
        const questions = [...data.大問];
        questions[qIndex].小問[sIndex] = { ...questions[qIndex].小問[sIndex], [field]: value };
        updateField('大問', questions);
    };

    const removeSubQuestion = (qIndex: number, sIndex: number) => {
        const questions = [...data.大問];
        questions[qIndex].小問 = questions[qIndex].小問.filter((_, i) => i !== sIndex);
        updateField('大問', questions);
    };

    const generateAndEmitYaml = (d: ExamData) => {
        const yaml = generateYaml(d);
        onYamlChange(yaml);
    };

    const generateYaml = (d: ExamData): string => {
        const escape = (str: string) => {
            return str.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
        };

        let yaml = `タイトル: "${escape(d.タイトル)}"\n`;
        yaml += `科目: "${escape(d.科目)}"\n`;
        yaml += `学校名: "${escape(d.学校名)}"\n`;
        yaml += `試験時間: ${d.試験時間}\n`;
        yaml += `配点合計: ${d.配点合計}\n`;
        yaml += `サブタイトル: "${escape(d.サブタイトル)}"\n\n`;

        yaml += `注意事項:\n`;
        d.注意事項.forEach(note => {
            yaml += `  - "${escape(note)}"\n`;
        });

        yaml += `\n大問:\n`;
        d.大問.forEach(q => {
            yaml += `  - 番号: ${q.番号}\n`;
            yaml += `    タイトル: "${escape(q.タイトル)}"\n`;
            yaml += `    必須: ${q.必須}\n`;
            yaml += `    配点: ${q.配点}\n`;
            if (q.改ページ) yaml += `    改ページ: true\n`;
            yaml += `    小問:\n`;
            q.小問.forEach(sq => {
                yaml += `      - 番号: "${escape(sq.番号)}"\n`;
                yaml += `        本文: "${escape(sq.本文)}"\n`;
                yaml += `        配点: ${sq.配点}\n`;
                if (sq.改ページ) yaml += `        改ページ: true\n`;
                if (sq.解答) yaml += `        解答: "${escape(sq.解答)}"\n`;
                if (sq.解説) yaml += `        解説: "${escape(sq.解説)}"\n`;
            });
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
                            placeholder="例: 第4章 式と曲線"
                        />
                    </div>
                    <div>
                        <label className="block text-xs text-[var(--color-text-muted)] mb-1">科目</label>
                        <input
                            type="text"
                            value={data.科目}
                            onChange={(e) => updateField('科目', e.target.value)}
                            className="w-full px-3 py-2 rounded-lg bg-[var(--color-bg)] border border-[var(--color-border)] focus:border-[var(--color-primary)] focus:outline-none text-sm"
                            placeholder="例: 数学C"
                        />
                    </div>
                    <div>
                        <label className="block text-xs text-[var(--color-text-muted)] mb-1">学校名</label>
                        <input
                            type="text"
                            value={data.学校名}
                            onChange={(e) => updateField('学校名', e.target.value)}
                            className="w-full px-3 py-2 rounded-lg bg-[var(--color-bg)] border border-[var(--color-border)] focus:border-[var(--color-primary)] focus:outline-none text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-xs text-[var(--color-text-muted)] mb-1">試験時間（分）</label>
                        <input
                            type="number"
                            value={data.試験時間}
                            onChange={(e) => updateField('試験時間', Number(e.target.value))}
                            className="w-full px-3 py-2 rounded-lg bg-[var(--color-bg)] border border-[var(--color-border)] focus:border-[var(--color-primary)] focus:outline-none text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-xs text-[var(--color-text-muted)] mb-1">配点合計</label>
                        <input
                            type="number"
                            value={data.配点合計}
                            onChange={(e) => updateField('配点合計', Number(e.target.value))}
                            className="w-full px-3 py-2 rounded-lg bg-[var(--color-bg)] border border-[var(--color-border)] focus:border-[var(--color-primary)] focus:outline-none text-sm"
                        />
                    </div>
                </div>
            </section>

            {/* 注意事項 */}
            <section className="space-y-3">
                <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-sm text-[var(--color-text-muted)] uppercase tracking-wide">注意事項</h3>
                    <button
                        onClick={addNote}
                        className="flex items-center gap-1 text-xs text-[var(--color-primary)] hover:underline"
                    >
                        <Plus size={14} /> 追加
                    </button>
                </div>
                <div className="space-y-2">
                    {data.注意事項.map((note, i) => (
                        <div key={i} className="flex items-center gap-2">
                            <GripVertical size={16} className="text-[var(--color-text-muted)] cursor-grab" />
                            <input
                                type="text"
                                value={note}
                                onChange={(e) => updateNote(i, e.target.value)}
                                className="flex-1 px-3 py-2 rounded-lg bg-[var(--color-bg)] border border-[var(--color-border)] focus:border-[var(--color-primary)] focus:outline-none text-sm"
                            />
                            <button
                                onClick={() => removeNote(i)}
                                className="p-1 rounded hover:bg-red-500/10 text-[var(--color-text-muted)] hover:text-red-400"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    ))}
                </div>
            </section>

            {/* 大問 */}
            <section className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-sm text-[var(--color-text-muted)] uppercase tracking-wide">大問</h3>
                    <button
                        onClick={addQuestion}
                        className="flex items-center gap-1 text-xs text-[var(--color-primary)] hover:underline"
                    >
                        <Plus size={14} /> 大問を追加
                    </button>
                </div>

                {data.大問.map((q, qIndex) => (
                    <div key={qIndex} className="bg-[var(--color-surface-hover)] rounded-xl p-4 space-y-3">
                        <div className="flex items-center justify-between">
                            <h4 className="font-medium">大問 {q.番号}</h4>
                            <button
                                onClick={() => removeQuestion(qIndex)}
                                className="p-1 rounded hover:bg-red-500/10 text-[var(--color-text-muted)] hover:text-red-400"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                            <div>
                                <label className="block text-xs text-[var(--color-text-muted)] mb-1">タイトル</label>
                                <input
                                    type="text"
                                    value={q.タイトル}
                                    onChange={(e) => updateQuestion(qIndex, 'タイトル', e.target.value)}
                                    className="w-full px-3 py-2 rounded-lg bg-[var(--color-bg)] border border-[var(--color-border)] focus:border-[var(--color-primary)] focus:outline-none text-sm"
                                    placeholder="例: 媒介変数表示"
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-[var(--color-text-muted)] mb-1">配点</label>
                                <input
                                    type="number"
                                    value={q.配点}
                                    onChange={(e) => updateQuestion(qIndex, '配点', Number(e.target.value))}
                                    className="w-full px-3 py-2 rounded-lg bg-[var(--color-bg)] border border-[var(--color-border)] focus:border-[var(--color-primary)] focus:outline-none text-sm"
                                />
                            </div>
                            <div className="flex items-end pb-1 gap-4">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={q.必須}
                                        onChange={(e) => updateQuestion(qIndex, '必須', e.target.checked)}
                                        className="w-4 h-4"
                                    />
                                    <span className="text-sm">必須</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={q.改ページ || false}
                                        onChange={(e) => updateQuestion(qIndex, '改ページ', e.target.checked)}
                                        className="w-4 h-4 accent-orange-500"
                                    />
                                    <span className="text-sm text-orange-400">改ページ</span>
                                </label>
                            </div>
                        </div>

                        {/* 小問 */}
                        <div className="mt-4 ml-4 space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-[var(--color-text-muted)]">小問</span>
                                <button
                                    onClick={() => addSubQuestion(qIndex)}
                                    className="flex items-center gap-1 text-xs text-[var(--color-primary)] hover:underline"
                                >
                                    <Plus size={12} /> 小問を追加
                                </button>
                            </div>

                            {q.小問.map((sq, sIndex) => (
                                <div key={sIndex} className="bg-[var(--color-bg)] rounded-lg p-3 space-y-2">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <span className="text-sm font-medium">{sq.番号}</span>
                                            <label className="flex items-center gap-1 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={sq.改ページ || false}
                                                    onChange={(e) => updateSubQuestion(qIndex, sIndex, '改ページ', e.target.checked)}
                                                    className="w-3 h-3 accent-orange-500"
                                                />
                                                <span className="text-xs text-orange-400">改ページ</span>
                                            </label>
                                        </div>
                                        <button
                                            onClick={() => removeSubQuestion(qIndex, sIndex)}
                                            className="p-1 rounded hover:bg-red-500/10 text-[var(--color-text-muted)] hover:text-red-400"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                    <div>
                                        <div className="flex items-center justify-between mb-1">
                                            <label className="text-xs text-[var(--color-text-muted)]">問題文</label>
                                            <MathInputButton onInsert={(latex) => updateSubQuestion(qIndex, sIndex, '本文', sq.本文 + latex)} />
                                        </div>
                                        <textarea
                                            value={sq.本文}
                                            onChange={(e) => updateSubQuestion(qIndex, sIndex, '本文', e.target.value)}
                                            rows={2}
                                            className="w-full px-3 py-2 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] focus:border-[var(--color-primary)] focus:outline-none text-sm resize-none"
                                            placeholder="問題文を入力... (数式は $...$ で囲む)"
                                        />
                                    </div>
                                    <div className="grid grid-cols-3 gap-2">
                                        <div>
                                            <label className="block text-xs text-[var(--color-text-muted)] mb-1">配点</label>
                                            <input
                                                type="number"
                                                value={sq.配点}
                                                onChange={(e) => updateSubQuestion(qIndex, sIndex, '配点', Number(e.target.value))}
                                                className="w-full px-2 py-1 rounded bg-[var(--color-surface)] border border-[var(--color-border)] focus:border-[var(--color-primary)] focus:outline-none text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs text-[var(--color-text-muted)] mb-1">解答</label>
                                            <input
                                                type="text"
                                                value={sq.解答}
                                                onChange={(e) => updateSubQuestion(qIndex, sIndex, '解答', e.target.value)}
                                                className="w-full px-2 py-1 rounded bg-[var(--color-surface)] border border-[var(--color-border)] focus:border-[var(--color-primary)] focus:outline-none text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs text-[var(--color-text-muted)] mb-1">解説</label>
                                            <input
                                                type="text"
                                                value={sq.解説}
                                                onChange={(e) => updateSubQuestion(qIndex, sIndex, '解説', e.target.value)}
                                                className="w-full px-2 py-1 rounded bg-[var(--color-surface)] border border-[var(--color-border)] focus:border-[var(--color-primary)] focus:outline-none text-sm"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </section>
        </div>
    );
}
