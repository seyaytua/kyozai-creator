import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Home, FileText, ClipboardList, BookOpen, FolderOpen, Settings, Plus } from 'lucide-react';
import { openYamlFile } from '../../utils/fileUtils';
import { addRecentProject } from '../../utils/recentProjects';
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

    const handleOpenFile = async () => {
        const result = await openYamlFile();
        if (result) {
            // ファイル内容からタイプを推測
            const content = result.content.toLowerCase();
            let type: FileType = 'exam';

            if (content.includes('大問') || content.includes('試験時間') || content.includes('定期考査')) {
                type = 'exam';
            } else if (content.includes('問題:') && !content.includes('大問')) {
                type = 'worksheet';
            } else if (content.includes('展開:') || content.includes('本時の目標') || content.includes('指導案')) {
                type = 'lesson-plan';
            }

            // 最近のプロジェクトに追加
            addRecentProject({
                filename: result.filename,
                type,
                lastOpened: new Date().toISOString()
            });

            navigate(`/${type}`);
        }
    };

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
                        <button
                            onClick={handleOpenFile}
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[var(--color-text-muted)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text)] transition-all duration-200"
                        >
                            <FolderOpen size={20} />
                            <span>開く</span>
                        </button>
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
