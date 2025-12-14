import { BookOpen, FileText, ClipboardList, Copy, MessageSquare, Download, Printer } from 'lucide-react';

export function HelpPage() {
    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-8 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                使い方ガイド
            </h1>

            {/* 概要 */}
            <section className="mb-10">
                <div className="bg-[var(--color-surface)] rounded-xl p-6 border border-[var(--color-border)]">
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        📚 概要
                    </h2>
                    <p className="text-[var(--color-text-muted)] leading-relaxed">
                        このアプリは、AIアシスタント（Copilot/ChatGPT等）と連携して教材を作成するツールです。
                        AIにYAML形式で教材データを生成してもらい、このアプリで美しいHTML/Word/PDF形式に変換できます。
                    </p>
                </div>
            </section>

            {/* 基本的な流れ */}
            <section className="mb-10">
                <h2 className="text-xl font-semibold mb-4">🚀 基本的な流れ</h2>
                <div className="space-y-4">
                    {[
                        {
                            step: 1,
                            title: 'プロンプトをコピー',
                            icon: Copy,
                            desc: '各エディターページの「Copilotで作成」セクションで条件を入力し、プロンプトをコピーします。',
                        },
                        {
                            step: 2,
                            title: 'AIで生成',
                            icon: MessageSquare,
                            desc: 'Copilot/ChatGPT等にペーストして、教材のYAMLを生成してもらいます。',
                        },
                        {
                            step: 3,
                            title: 'YAMLを貼り付け',
                            icon: FileText,
                            desc: '生成されたYAMLをエディターに貼り付けると、プレビューが表示されます。',
                        },
                        {
                            step: 4,
                            title: '出力・印刷',
                            icon: Printer,
                            desc: 'HTML出力やPDF印刷（ブラウザ印刷）でファイルを保存できます。',
                        },
                    ].map(({ step, title, icon: Icon, desc }) => (
                        <div key={step} className="flex gap-4 bg-[var(--color-surface)] rounded-xl p-5 border border-[var(--color-border)]">
                            <div className="w-10 h-10 rounded-full bg-[var(--color-primary)] flex items-center justify-center text-white font-bold shrink-0">
                                {step}
                            </div>
                            <div>
                                <h3 className="font-semibold flex items-center gap-2">
                                    <Icon size={18} className="text-[var(--color-primary)]" />
                                    {title}
                                </h3>
                                <p className="text-[var(--color-text-muted)] text-sm mt-1">{desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* 各機能の説明 */}
            <section className="mb-10">
                <h2 className="text-xl font-semibold mb-4">📝 作成できる教材</h2>
                <div className="grid md:grid-cols-3 gap-4">
                    {[
                        {
                            icon: FileText,
                            title: '定期考査',
                            color: 'text-blue-400',
                            features: ['表紙ページ', '問題ページ', '解答・解説ページ', 'PDF印刷対応'],
                        },
                        {
                            icon: ClipboardList,
                            title: 'プリント',
                            color: 'text-green-400',
                            features: ['問題シート', '解答欄', '難易度表示', 'フォーム編集'],
                        },
                        {
                            icon: BookOpen,
                            title: '指導案',
                            color: 'text-purple-400',
                            features: ['展開表', '評価規準', '板書計画', 'Word出力'],
                        },
                    ].map(({ icon: Icon, title, color, features }) => (
                        <div key={title} className="bg-[var(--color-surface)] rounded-xl p-5 border border-[var(--color-border)]">
                            <div className={`flex items-center gap-2 mb-3 ${color}`}>
                                <Icon size={24} />
                                <h3 className="font-semibold text-white">{title}</h3>
                            </div>
                            <ul className="text-sm text-[var(--color-text-muted)] space-y-1">
                                {features.map(f => (
                                    <li key={f}>• {f}</li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </section>

            {/* 数式について */}
            <section className="mb-10">
                <h2 className="text-xl font-semibold mb-4">🔢 数式の書き方</h2>
                <div className="bg-[var(--color-surface)] rounded-xl p-6 border border-[var(--color-border)]">
                    <p className="text-[var(--color-text-muted)] mb-4">
                        LaTeX形式の数式に対応しています。AIに数式を含む問題を生成させる際は、以下の形式を使用してください。
                    </p>
                    <div className="bg-[#1a1a2e] rounded-lg p-4 font-mono text-sm">
                        <div className="mb-3">
                            <span className="text-green-400">インライン数式：</span>
                            <code className="text-yellow-300 ml-2">$x^2 + y^2 = r^2$</code>
                        </div>
                        <div>
                            <span className="text-green-400">ブロック数式：</span>
                            <code className="text-yellow-300 ml-2">$$\int_0^\infty e^{'{-x}'} dx = 1$$</code>
                        </div>
                    </div>
                </div>
            </section>

            {/* 出力形式 */}
            <section className="mb-10">
                <h2 className="text-xl font-semibold mb-4">💾 出力形式</h2>
                <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-[var(--color-surface)] rounded-xl p-5 border border-[var(--color-border)]">
                        <h3 className="font-semibold mb-2 flex items-center gap-2">
                            <Download size={18} className="text-blue-400" />
                            HTML出力
                        </h3>
                        <p className="text-sm text-[var(--color-text-muted)]">
                            ブラウザで開けるHTMLファイルとして保存。そのまま印刷もできます。
                        </p>
                    </div>
                    <div className="bg-[var(--color-surface)] rounded-xl p-5 border border-[var(--color-border)]">
                        <h3 className="font-semibold mb-2 flex items-center gap-2">
                            <Printer size={18} className="text-green-400" />
                            PDF印刷
                        </h3>
                        <p className="text-sm text-[var(--color-text-muted)]">
                            ブラウザの印刷機能で「PDFに保存」を選択すると、PDFファイルとして保存できます。
                        </p>
                    </div>
                </div>
            </section>

            {/* Tips */}
            <section>
                <h2 className="text-xl font-semibold mb-4">💡 Tips</h2>
                <div className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 rounded-xl p-6 border border-yellow-500/30">
                    <ul className="text-[var(--color-text-muted)] space-y-2">
                        <li>• <strong>YAMLのみ</strong>：AIには「YAMLコードブロックのみを出力」するよう指示されています</li>
                        <li>• <strong>プレビュー</strong>：右側のプレビューで印刷イメージを確認できます</li>
                        <li>• <strong>フォーム編集</strong>：プリントは「フォーム」タブで個別に問題を編集できます</li>
                        <li>• <strong>改ページ</strong>：YAMLで「改ページ: true」を指定すると、その位置でページが分かれます</li>
                    </ul>
                </div>
            </section>
        </div>
    );
}
