/**
 * 最近のプロジェクト管理
 */

export interface RecentProject {
    filename: string;
    type: 'exam' | 'worksheet' | 'lesson-plan';
    lastOpened: string; // ISO date string
    path?: string;
}

const STORAGE_KEY = 'kyozai-recent-projects';
const MAX_RECENT = 10;

/**
 * 最近のプロジェクトを取得
 */
export function getRecentProjects(): RecentProject[] {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) return [];
        return JSON.parse(stored);
    } catch {
        return [];
    }
}

/**
 * プロジェクトを最近リストに追加
 */
export function addRecentProject(project: RecentProject): void {
    try {
        const projects = getRecentProjects();

        // 同じファイル名を削除
        const filtered = projects.filter(p => p.filename !== project.filename);

        // 先頭に追加
        filtered.unshift({
            ...project,
            lastOpened: new Date().toISOString(),
        });

        // 最大数に制限
        const limited = filtered.slice(0, MAX_RECENT);

        localStorage.setItem(STORAGE_KEY, JSON.stringify(limited));
    } catch {
        console.error('Failed to save recent project');
    }
}

/**
 * プロジェクトを最近リストから削除
 */
export function removeRecentProject(filename: string): void {
    try {
        const projects = getRecentProjects();
        const filtered = projects.filter(p => p.filename !== filename);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    } catch {
        console.error('Failed to remove recent project');
    }
}

/**
 * 最近リストをクリア
 */
export function clearRecentProjects(): void {
    localStorage.removeItem(STORAGE_KEY);
}

/**
 * プロジェクトタイプの表示名を取得
 */
export function getTypeLabel(type: RecentProject['type']): string {
    switch (type) {
        case 'exam': return 'テスト';
        case 'worksheet': return 'プリント';
        case 'lesson-plan': return '指導案';
    }
}

/**
 * プロジェクトタイプのアイコンを取得
 */
export function getTypeEmoji(type: RecentProject['type']): string {
    switch (type) {
        case 'exam': return '📝';
        case 'worksheet': return '📄';
        case 'lesson-plan': return '📋';
    }
}
