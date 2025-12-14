import { useState, useRef } from 'react';
import { X } from 'lucide-react';

interface MathEditorProps {
    value: string;
    onChange: (value: string) => void;
    onClose: () => void;
}

// よく使う数式シンボル
const symbolGroups = [
    {
        name: '基本演算',
        symbols: [
            { display: '+', latex: '+', desc: '加算' },
            { display: '−', latex: '-', desc: '減算' },
            { display: '×', latex: '\\times', desc: '乗算' },
            { display: '÷', latex: '\\div', desc: '除算' },
            { display: '±', latex: '\\pm', desc: 'プラスマイナス' },
            { display: '=', latex: '=', desc: '等号' },
            { display: '≠', latex: '\\neq', desc: '等しくない' },
            { display: '<', latex: '<', desc: '小なり' },
            { display: '>', latex: '>', desc: '大なり' },
            { display: '≤', latex: '\\leq', desc: '以下' },
            { display: '≥', latex: '\\geq', desc: '以上' },
        ],
    },
    {
        name: '分数・べき乗',
        symbols: [
            { display: 'a/b', latex: '\\frac{□}{□}', desc: '分数' },
            { display: 'x²', latex: '^{□}', desc: 'べき乗' },
            { display: 'x₂', latex: '_{□}', desc: '添字' },
            { display: '√', latex: '\\sqrt{□}', desc: '平方根' },
            { display: '∛', latex: '\\sqrt[3]{□}', desc: '立方根' },
            { display: 'ⁿ√', latex: '\\sqrt[n]{□}', desc: 'n乗根' },
        ],
    },
    {
        name: 'ギリシャ文字',
        symbols: [
            { display: 'α', latex: '\\alpha', desc: 'アルファ' },
            { display: 'β', latex: '\\beta', desc: 'ベータ' },
            { display: 'γ', latex: '\\gamma', desc: 'ガンマ' },
            { display: 'δ', latex: '\\delta', desc: 'デルタ' },
            { display: 'θ', latex: '\\theta', desc: 'シータ' },
            { display: 'λ', latex: '\\lambda', desc: 'ラムダ' },
            { display: 'μ', latex: '\\mu', desc: 'ミュー' },
            { display: 'π', latex: '\\pi', desc: 'パイ' },
            { display: 'σ', latex: '\\sigma', desc: 'シグマ' },
            { display: 'φ', latex: '\\phi', desc: 'ファイ' },
            { display: 'ω', latex: '\\omega', desc: 'オメガ' },
        ],
    },
    {
        name: '三角関数',
        symbols: [
            { display: 'sin', latex: '\\sin', desc: 'サイン' },
            { display: 'cos', latex: '\\cos', desc: 'コサイン' },
            { display: 'tan', latex: '\\tan', desc: 'タンジェント' },
            { display: 'sin⁻¹', latex: '\\arcsin', desc: 'アークサイン' },
            { display: 'cos⁻¹', latex: '\\arccos', desc: 'アークコサイン' },
            { display: 'tan⁻¹', latex: '\\arctan', desc: 'アークタンジェント' },
        ],
    },
    {
        name: '総和・積分',
        symbols: [
            { display: 'Σ', latex: '\\sum_{□}^{□}', desc: '総和' },
            { display: '∏', latex: '\\prod_{□}^{□}', desc: '総乗' },
            { display: '∫', latex: '\\int_{□}^{□}', desc: '積分' },
            { display: 'lim', latex: '\\lim_{□ \\to □}', desc: '極限' },
            { display: '∞', latex: '\\infty', desc: '無限大' },
            { display: '∂', latex: '\\partial', desc: '偏微分' },
        ],
    },
    {
        name: '括弧・その他',
        symbols: [
            { display: '( )', latex: '\\left( □ \\right)', desc: '丸括弧' },
            { display: '[ ]', latex: '\\left[ □ \\right]', desc: '角括弧' },
            { display: '{ }', latex: '\\left\\{ □ \\right\\}', desc: '波括弧' },
            { display: '| |', latex: '\\left| □ \\right|', desc: '絶対値' },
            { display: '→', latex: '\\to', desc: '矢印' },
            { display: '⇒', latex: '\\Rightarrow', desc: '二重矢印' },
            { display: '∈', latex: '\\in', desc: '属する' },
            { display: '∀', latex: '\\forall', desc: '任意の' },
            { display: '∃', latex: '\\exists', desc: '存在する' },
        ],
    },
];

// よく使うテンプレート
const templates = [
    { name: '2次方程式', latex: 'ax^2 + bx + c = 0' },
    { name: '解の公式', latex: 'x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}' },
    { name: '三角関数の定義', latex: '\\sin \\theta = \\frac{y}{r}, \\cos \\theta = \\frac{x}{r}' },
    { name: '微分', latex: '\\frac{d}{dx} f(x)' },
    { name: '積分', latex: '\\int_a^b f(x) \\, dx' },
    { name: 'ベクトル', latex: '\\vec{a} = (a_1, a_2, a_3)' },
    { name: '行列', latex: '\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}' },
];

export function MathEditor({ value, onChange, onClose }: MathEditorProps) {
    const [activeGroup, setActiveGroup] = useState(0);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const insertSymbol = (latex: string) => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const newValue = value.substring(0, start) + latex + value.substring(end);
        onChange(newValue);

        // カーソルを挿入位置の後に移動
        setTimeout(() => {
            const cursorPos = start + latex.indexOf('□');
            if (cursorPos >= start) {
                textarea.setSelectionRange(cursorPos, cursorPos + 1);
            } else {
                textarea.setSelectionRange(start + latex.length, start + latex.length);
            }
            textarea.focus();
        }, 0);
    };

    const insertTemplate = (latex: string) => {
        onChange(value + (value ? '\n' : '') + '$$' + latex + '$$');
    };

    const wrapWithMath = () => {
        if (value && !value.includes('$')) {
            onChange('$' + value + '$');
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-[var(--color-surface)] rounded-2xl shadow-2xl w-[800px] max-h-[80vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-[var(--color-border)]">
                    <h2 className="font-semibold text-lg">数式エディタ</h2>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg hover:bg-[var(--color-surface-hover)] transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="flex flex-1 overflow-hidden">
                    {/* Symbol Panel */}
                    <div className="w-1/2 border-r border-[var(--color-border)] flex flex-col">
                        {/* Symbol Group Tabs */}
                        <div className="flex overflow-x-auto border-b border-[var(--color-border)] bg-[var(--color-bg)]">
                            {symbolGroups.map((group, i) => (
                                <button
                                    key={i}
                                    onClick={() => setActiveGroup(i)}
                                    className={`px-3 py-2 text-xs font-medium whitespace-nowrap transition-colors ${activeGroup === i
                                        ? 'bg-[var(--color-primary)] text-white'
                                        : 'text-[var(--color-text-muted)] hover:bg-[var(--color-surface-hover)]'
                                        }`}
                                >
                                    {group.name}
                                </button>
                            ))}
                        </div>

                        {/* Symbol Grid */}
                        <div className="flex-1 p-3 overflow-y-auto">
                            <div className="grid grid-cols-6 gap-2">
                                {symbolGroups[activeGroup].symbols.map((sym, i) => (
                                    <button
                                        key={i}
                                        onClick={() => insertSymbol(sym.latex)}
                                        className="aspect-square flex items-center justify-center rounded-lg bg-[var(--color-bg)] hover:bg-[var(--color-primary)] hover:text-white transition-colors text-lg font-serif"
                                        title={sym.desc}
                                    >
                                        {sym.display}
                                    </button>
                                ))}
                            </div>

                            {/* Templates */}
                            <div className="mt-4 pt-4 border-t border-[var(--color-border)]">
                                <h3 className="text-xs font-medium text-[var(--color-text-muted)] mb-2">テンプレート</h3>
                                <div className="space-y-1">
                                    {templates.map((t, i) => (
                                        <button
                                            key={i}
                                            onClick={() => insertTemplate(t.latex)}
                                            className="w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-[var(--color-surface-hover)] transition-colors"
                                        >
                                            {t.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Editor Panel */}
                    <div className="w-1/2 flex flex-col">
                        <div className="p-3 border-b border-[var(--color-border)] bg-[var(--color-bg)]">
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={wrapWithMath}
                                    className="px-3 py-1 text-xs rounded bg-[var(--color-surface-hover)] hover:bg-[var(--color-border)] transition-colors"
                                >
                                    $...$で囲む
                                </button>
                                <span className="text-xs text-[var(--color-text-muted)]">
                                    インライン: $...$ / ディスプレイ: $$...$$
                                </span>
                            </div>
                        </div>

                        <div className="flex-1 p-3">
                            <textarea
                                ref={textareaRef}
                                value={value}
                                onChange={(e) => onChange(e.target.value)}
                                className="w-full h-full p-3 rounded-lg bg-[var(--color-bg)] border border-[var(--color-border)] focus:border-[var(--color-primary)] focus:outline-none font-mono text-sm resize-none"
                                placeholder="LaTeX数式を入力...&#10;例: $x^2 + y^2 = r^2$"
                            />
                        </div>

                        {/* Preview (if MathJax available) */}
                        <div className="p-3 border-t border-[var(--color-border)] bg-[var(--color-bg)]">
                            <p className="text-xs text-[var(--color-text-muted)] mb-2">プレビュー（保存後に反映）</p>
                            <div className="p-3 rounded-lg bg-white text-black min-h-[60px] font-serif">
                                {value || <span className="text-gray-400">数式がここに表示されます</span>}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-2 p-4 border-t border-[var(--color-border)]">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-lg bg-[var(--color-surface-hover)] hover:bg-[var(--color-border)] transition-colors"
                    >
                        キャンセル
                    </button>
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-lg bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-dark)] transition-colors"
                    >
                        挿入して閉じる
                    </button>
                </div>
            </div>
        </div>
    );
}

// 小さなボタン版（フォーム内で使用）
interface MathInputButtonProps {
    onInsert: (latex: string) => void;
}

export function MathInputButton({ onInsert }: MathInputButtonProps) {
    const [open, setOpen] = useState(false);
    const [latex, setLatex] = useState('');

    const handleInsert = () => {
        if (latex.trim()) {
            onInsert('$' + latex + '$');
            setLatex('');
            setOpen(false);
        }
    };

    if (!open) {
        return (
            <button
                onClick={() => setOpen(true)}
                className="px-2 py-1 text-xs rounded bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 transition-colors"
                title="数式を挿入"
            >
                ƒ(x)
            </button>
        );
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setOpen(false)}>
            <div onClick={(e) => e.stopPropagation()} className="bg-[var(--color-surface)] rounded-xl p-4 w-[500px] shadow-2xl">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium">数式を入力</h3>
                    <button onClick={() => setOpen(false)} className="p-1 hover:bg-[var(--color-surface-hover)] rounded">
                        <X size={16} />
                    </button>
                </div>

                {/* Quick symbols */}
                <div className="flex flex-wrap gap-1 mb-3">
                    {[
                        { display: 'a/b', latex: '\\frac{}{}' },
                        { display: 'x²', latex: '^{2}' },
                        { display: 'xₙ', latex: '_{n}' },
                        { display: '√', latex: '\\sqrt{}' },
                        { display: 'vec', latex: '\\vec{}' },
                        { display: 'bar', latex: '\\overline{}' },
                        { display: 'hat', latex: '\\hat{}' },
                        { display: '·', latex: '\\cdot ' },
                        { display: '∂', latex: '\\partial ' },
                        { display: 'π', latex: '\\pi' },
                        { display: 'θ', latex: '\\theta' },
                        { display: '∑', latex: '\\sum' },
                        { display: '∫', latex: '\\int' },
                        { display: 'sin', latex: '\\sin ' },
                        { display: 'cos', latex: '\\cos ' },
                        { display: 'tan', latex: '\\tan ' },
                        { display: 'log', latex: '\\log ' },
                        { display: 'α', latex: '\\alpha' },
                        { display: 'β', latex: '\\beta' },
                        { display: '×', latex: '\\times ' },
                        { display: '÷', latex: '\\div ' },
                        { display: '±', latex: '\\pm ' },
                        { display: '≦', latex: '\\leqq ' },
                        { display: '≧', latex: '\\geqq ' },
                        { display: '≤', latex: '\\leq ' },
                        { display: '≥', latex: '\\geq ' },
                        { display: '≠', latex: '\\neq ' },
                        { display: '≢', latex: '\\not\\equiv ' },
                        { display: '∽', latex: '\\backsim ' },
                        { display: '∼', latex: '\\sim ' },
                        { display: '≃', latex: '\\simeq ' },
                        { display: '≅', latex: '\\cong ' },
                        { display: '∞', latex: '\\infty' },
                        { display: '→', latex: '\\to ' },
                        { display: '∈', latex: '\\in ' },
                        { display: '∉', latex: '\\notin ' },
                        { display: '⊂', latex: '\\subset ' },
                        { display: '⊃', latex: '\\supset ' },
                        { display: '∪', latex: '\\cup ' },
                        { display: '∩', latex: '\\cap ' },
                        { display: '∅', latex: '\\emptyset' },
                        { display: 'ℕ', latex: '\\mathbb{N}' },
                        { display: 'ℤ', latex: '\\mathbb{Z}' },
                        { display: 'ℝ', latex: '\\mathbb{R}' },
                    ].map((s, i) => (
                        <button
                            key={i}
                            onClick={() => setLatex(latex + s.latex)}
                            className="px-2 py-1 text-sm rounded bg-[var(--color-bg)] hover:bg-[var(--color-primary)] hover:text-white transition-colors"
                        >
                            {s.display}
                        </button>
                    ))}
                </div>

                <input
                    type="text"
                    value={latex}
                    onChange={(e) => setLatex(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleInsert()}
                    placeholder="x^2 + y^2 = r^2"
                    className="w-full px-3 py-2 rounded-lg bg-[var(--color-bg)] border border-[var(--color-border)] focus:border-[var(--color-primary)] focus:outline-none font-mono text-sm mb-3"
                    autoFocus
                />

                <div className="flex justify-end gap-2">
                    <button
                        onClick={() => setOpen(false)}
                        className="px-3 py-1.5 text-sm rounded-lg bg-[var(--color-surface-hover)] hover:bg-[var(--color-border)]"
                    >
                        キャンセル
                    </button>
                    <button
                        onClick={handleInsert}
                        className="px-3 py-1.5 text-sm rounded-lg bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-dark)]"
                    >
                        挿入
                    </button>
                </div>
            </div>
        </div>
    );
}
