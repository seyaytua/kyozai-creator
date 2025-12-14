import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Moon, Sun, Palette, Folder, Info } from 'lucide-react';

export function Settings() {
    const [theme, setTheme] = useState<'dark' | 'light'>('dark');
    const [defaultSavePath, setDefaultSavePath] = useState('');

    const handleThemeChange = (newTheme: 'dark' | 'light') => {
        setTheme(newTheme);
        // 将来的にテーマを適用
    };

    return (
        <div className="h-full flex flex-col">
            <header className="flex items-center gap-4 px-6 py-4 border-b border-[var(--color-border)] bg-[var(--color-surface)]">
                <Link
                    to="/"
                    className="p-2 rounded-lg hover:bg-[var(--color-surface-hover)] transition-colors"
                >
                    <ArrowLeft size={20} />
                </Link>
                <h1 className="font-semibold text-lg">⚙️ 設定</h1>
            </header>

            <div className="flex-1 p-8 max-w-2xl mx-auto w-full overflow-y-auto">
                {/* テーマ設定 */}
                <section className="mb-8">
                    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Palette size={20} />
                        外観
                    </h2>
                    <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium">テーマ</p>
                                <p className="text-sm text-[var(--color-text-muted)]">アプリの表示モードを選択</p>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleThemeChange('dark')}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${theme === 'dark'
                                            ? 'bg-[var(--color-primary)] text-white'
                                            : 'bg-[var(--color-surface-hover)] hover:bg-[var(--color-border)]'
                                        }`}
                                >
                                    <Moon size={16} />
                                    ダーク
                                </button>
                                <button
                                    onClick={() => handleThemeChange('light')}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${theme === 'light'
                                            ? 'bg-[var(--color-primary)] text-white'
                                            : 'bg-[var(--color-surface-hover)] hover:bg-[var(--color-border)]'
                                        }`}
                                >
                                    <Sun size={16} />
                                    ライト
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ファイル設定 */}
                <section className="mb-8">
                    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Folder size={20} />
                        ファイル
                    </h2>
                    <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] p-4 space-y-4">
                        <div>
                            <label className="block font-medium mb-2">デフォルト保存先</label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={defaultSavePath}
                                    onChange={(e) => setDefaultSavePath(e.target.value)}
                                    placeholder="フォルダパスを入力..."
                                    className="flex-1 px-4 py-2 rounded-lg bg-[var(--color-bg)] border border-[var(--color-border)] focus:outline-none focus:border-[var(--color-primary)]"
                                />
                                <button className="px-4 py-2 rounded-lg bg-[var(--color-surface-hover)] hover:bg-[var(--color-border)] transition-colors">
                                    参照
                                </button>
                            </div>
                            <p className="text-sm text-[var(--color-text-muted)] mt-2">
                                ※ 現在、ブラウザのダウンロードフォルダに保存されます
                            </p>
                        </div>
                    </div>
                </section>

                {/* アプリ情報 */}
                <section>
                    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Info size={20} />
                        アプリ情報
                    </h2>
                    <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] p-4">
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-[var(--color-text-muted)]">バージョン</span>
                                <span>1.0.0</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-[var(--color-text-muted)]">ビルド</span>
                                <span>React + Tauri + FastAPI</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-[var(--color-text-muted)]">対象OS</span>
                                <span>Windows / macOS</span>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}
