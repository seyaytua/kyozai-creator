import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Home, FileText, ClipboardList, BookOpen, Settings, Plus, HelpCircle } from 'lucide-react';
import { NewFileDialog } from '../NewFileDialog';

type FileType = 'exam' | 'worksheet' | 'lesson-plan';

const navItems: { to: string; icon: React.ComponentType<{ size?: number }>; label: string; type?: FileType }[] = [
    { to: '/', icon: Home, label: 'ホーム' },
    { to: '/exam', icon: FileText, label: 'テスト', type: 'exam' },
    { to: '/worksheet', icon: ClipboardList, label: 'プリント', type: 'worksheet' },
    { to: '/lesson-plan', icon: BookOpen, label: '指導案', type: 'lesson-plan' },
];

export function Sidebar() {
    const navigate = useNavigate();
    const [dialogOpen, setDialogOpen] = useState(false);
    const [dialogType, setDialogType] = useState<FileType>('exam');

    const handleNewFile = (type: FileType) => {
        setDialogType(type);
        setDialogOpen(true);
    };

    const handleConfirmNewFile = (filename: string) => {
        navigate(`/${dialogType}/new?filename=${encodeURIComponent(filename)}`);
    };

    return (
        <>
            <aside className="w-56 bg-[var(--color-surface)] border-r border-[var(--color-border)] flex flex-col">
                {/* Logo */}
                <div className="p-4 border-b border-[var(--color-border)]">
                    <h1 className="text-lg font-bold flex items-center gap-2">
                        📚 教材作成ツール
                    </h1>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-2 space-y-1">
                    {navItems.map(({ to, icon: Icon, label, type }) => (
                        <div key={to} className="flex items-center gap-1">
                            <NavLink
                                to={to}
                                className={({ isActive }) =>
                                    `flex-1 flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${isActive
                                        ? 'bg-[var(--color-primary)] text-white'
                                        : 'text-[var(--color-text-muted)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text)]'
                                    }`
                                }
                            >
                                <Icon size={20} />
                                <span>{label}</span>
                            </NavLink>
                            {type && (
                                <button
                                    onClick={() => handleNewFile(type)}
                                    className="p-2 rounded-lg text-[var(--color-text-muted)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-primary)] transition-all"
                                    title={`新規${label}を作成`}
                                >
                                    <Plus size={16} />
                                </button>
                            )}
                        </div>
                    ))}

                    <div className="pt-4 mt-4 border-t border-[var(--color-border)]">
                        <NavLink
                            to="/help"
                            className={({ isActive }) =>
                                `w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${isActive
                                    ? 'bg-[var(--color-primary)] text-white'
                                    : 'text-[var(--color-text-muted)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text)]'
                                }`
                            }
                        >
                            <HelpCircle size={20} />
                            <span>使い方</span>
                        </NavLink>
                    </div>
                </nav>

                {/* Settings */}
                <div className="p-2 border-t border-[var(--color-border)]">
                    <NavLink
                        to="/settings"
                        className={({ isActive }) =>
                            `w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${isActive
                                ? 'bg-[var(--color-primary)] text-white'
                                : 'text-[var(--color-text-muted)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text)]'
                            }`
                        }
                    >
                        <Settings size={20} />
                        <span>設定</span>
                    </NavLink>
                </div>
            </aside>

            {/* New File Dialog */}
            <NewFileDialog
                isOpen={dialogOpen}
                onClose={() => setDialogOpen(false)}
                onConfirm={handleConfirmNewFile}
                type={dialogType}
            />
        </>
    );
}
