import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Clock, ChevronRight, Trash2 } from 'lucide-react';
import { getRecentProjects, removeRecentProject, getTypeEmoji } from '../utils/recentProjects';
import type { RecentProject } from '../utils/recentProjects';

const createOptions = [
    {
        to: '/exam/new',
        title: '📝 テスト',
        subtitle: '定期考査',
        color: 'from-blue-500 to-blue-600',
    },
    {
        to: '/worksheet/new',
        title: '📄 プリント',
        subtitle: '演習用',
        color: 'from-emerald-500 to-emerald-600',
    },
    {
        to: '/lesson-plan/new',
        title: '📋 指導案',
        subtitle: '学習指導案',
        color: 'from-purple-500 to-purple-600',
    },
];

export function Home() {
    const [recentProjects, setRecentProjects] = useState<RecentProject[]>([]);
    const navigate = useNavigate();

    useEffect(() => {
        setRecentProjects(getRecentProjects());
    }, []);

    const handleRemove = (e: React.MouseEvent, filename: string) => {
        e.stopPropagation();
        removeRecentProject(filename);
        setRecentProjects(getRecentProjects());
    };

    const handleOpenRecent = (project: RecentProject) => {
        // Navigate to the appropriate editor
        navigate(`/${project.type}`);
    };

    const formatDate = (isoString: string) => {
        const date = new Date(isoString);
        const month = date.getMonth() + 1;
        const day = date.getDate();
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${month}/${day} ${hours}:${minutes}`;
    };

    return (
        <div className="p-8 max-w-5xl mx-auto">
            {/* Header */}
            <div className="mb-10">
                <h1 className="text-3xl font-bold mb-2">ようこそ！</h1>
                <p className="text-[var(--color-text-muted)]">
                    教材を選んで作成を開始しましょう
                </p>
            </div>

            {/* Create New Section */}
            <section className="mb-12">
                <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                    ✨ 新規作成
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {createOptions.map(({ to, title, subtitle, color }) => (
                        <Link
                            key={to}
                            to={to}
                            className="group relative overflow-hidden rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] p-6 transition-all duration-300 hover:border-[var(--color-primary)] hover:shadow-lg hover:shadow-blue-500/10 hover:-translate-y-1"
                        >
                            <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                            <div className="relative">
                                <div className="text-4xl mb-4">{title.split(' ')[0]}</div>
                                <h3 className="text-lg font-semibold mb-1">{title.split(' ')[1]}</h3>
                                <p className="text-sm text-[var(--color-text-muted)]">{subtitle}</p>
                                <div className="mt-4 flex items-center text-[var(--color-primary)] opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <span className="text-sm">作成開始</span>
                                    <ChevronRight size={16} className="ml-1" />
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </section>

            {/* Recent Projects Section */}
            <section>
                <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                    <Clock size={20} />
                    最近のプロジェクト
                </h2>
                <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] overflow-hidden">
                    {recentProjects.length > 0 ? (
                        <ul className="divide-y divide-[var(--color-border)]">
                            {recentProjects.map((project, index) => (
                                <li key={index}>
                                    <div
                                        onClick={() => handleOpenRecent(project)}
                                        className="w-full flex items-center justify-between px-5 py-4 hover:bg-[var(--color-surface-hover)] transition-colors duration-200 cursor-pointer"
                                    >
                                        <div className="flex items-center gap-4">
                                            <span className="text-2xl">
                                                {getTypeEmoji(project.type)}
                                            </span>
                                            <div className="text-left">
                                                <p className="font-medium">{project.filename}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className="text-sm text-[var(--color-text-muted)]">
                                                {formatDate(project.lastOpened)}
                                            </span>
                                            <button
                                                onClick={(e) => handleRemove(e, project.filename)}
                                                className="p-1 rounded hover:bg-red-500/10 text-[var(--color-text-muted)] hover:text-red-400 transition-colors"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="p-8 text-center text-[var(--color-text-muted)]">
                            まだプロジェクトがありません
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}
