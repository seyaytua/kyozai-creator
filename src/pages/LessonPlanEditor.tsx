import { useState, useEffect, useCallback, useRef } from 'react';
import { Save, FileDown, Printer, ArrowLeft, RefreshCw, AlertCircle, CheckCircle, FolderOpen, FileText } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { YamlEditor, EditableTitle } from '../components/Editor';
import { ExamPreview } from '../components/Preview';
import { CopilotHelper } from '../components/CopilotHelper';
import { generateLessonPlanHtml, generateLessonPlanDocx, checkApiHealth } from '../services/api';
import { saveYamlFile, openYamlFile, printHtml, exportHtml } from '../utils/fileUtils';
import { addRecentProject } from '../utils/recentProjects';
import { useUnsavedChanges, UnsavedChangesDialog } from '../hooks/useUnsavedChanges';

const emptyYaml = `教科: ""
科目: ""
日時: ""
学校名: ""
対象: ""
会場: ""
授業者: ""

単元名: ""
使用教科書: ""

本時の目標:
  - ""

展開:
  導入:
    時間: 10
    学習内容:
      - ""
    学習活動:
      - ""
    留意点:
      - ""

  展開:
    時間: 30
    学習内容:
      - ""
    学習活動:
      - ""
    留意点:
      - ""

  まとめ:
    時間: 10
    学習内容:
      - ""
    学習活動:
      - ""
    留意点:
      - ""

評価:
  - ""
`;

export function LessonPlanEditor() {
    const [searchParams] = useSearchParams();
    const urlFilename = searchParams.get('filename');

    const [yaml, setYaml] = useState(emptyYaml);
    const [previewHtml, setPreviewHtml] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [apiConnected, setApiConnected] = useState<boolean | null>(null);
    const [filename, setFilename] = useState<string>(urlFilename || '新規指導案.yaml');
    const [saved, setSaved] = useState(false);
    const initialYamlRef = useRef(emptyYaml);
    const hasChanges = yaml !== initialYamlRef.current;

    // Navigation blocking for unsaved changes
    const blocker = useUnsavedChanges({ hasChanges });

    useEffect(() => {
        checkApiHealth().then(setApiConnected);
    }, []);

    const generatePreview = useCallback(async () => {
        if (!yaml.trim()) return;

        setLoading(true);
        setError(null);

        const result = await generateLessonPlanHtml(yaml);

        if (result.success) {
            setPreviewHtml(result.html);
        } else {
            setError(result.error || 'プレビュー生成に失敗しました');
        }

        setLoading(false);
    }, [yaml]);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (apiConnected) {
                generatePreview();
            }
        }, 1000);

        return () => clearTimeout(timer);
    }, [yaml, apiConnected, generatePreview]);

    const handleSave = () => {
        saveYamlFile(yaml, filename);
        addRecentProject({ filename, type: 'lesson-plan', lastOpened: new Date().toISOString() });
        initialYamlRef.current = yaml; // Reset change tracking
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    const handleOpen = async () => {
        const result = await openYamlFile();
        if (result) {
            setYaml(result.content);
            setFilename(result.filename);
            addRecentProject({ filename: result.filename, type: 'lesson-plan', lastOpened: new Date().toISOString() });
        }
    };

    const handlePrint = () => {
        if (previewHtml) {
            printHtml(previewHtml, filename.replace('.yaml', ''));
        }
    };

    const handleExportHtml = () => {
        if (previewHtml) {
            exportHtml(previewHtml, filename.replace('.yaml', '.html'));
        }
    };

    const handleExportDocx = async () => {
        setLoading(true);
        setError(null);

        const result = await generateLessonPlanDocx(yaml);

        if (result.success && result.docx_base64) {
            const binaryString = atob(result.docx_base64);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }
            const blob = new Blob([bytes], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = filename.replace('.yaml', '.docx');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } else {
            setError(result.error || 'Word出力に失敗しました');
        }

        setLoading(false);
    };

    return (
        <div className="h-full flex flex-col">
            <header className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)] bg-[var(--color-surface)]">
                <div className="flex items-center gap-4">
                    <Link
                        to="/"
                        className="p-2 rounded-lg hover:bg-[var(--color-surface-hover)] transition-colors"
                    >
                        <ArrowLeft size={20} />
                    </Link>
                    <EditableTitle
                        value={filename}
                        onChange={setFilename}
                        label="📋 指導案作成"
                    />

                    <div className="flex items-center gap-2 ml-4">
                        {apiConnected === null ? (
                            <span className="text-xs text-[var(--color-text-muted)]">接続確認中...</span>
                        ) : apiConnected ? (
                            <span className="flex items-center gap-1 text-xs text-green-400">
                                <CheckCircle size={14} />
                                API接続済み
                            </span>
                        ) : (
                            <span className="flex items-center gap-1 text-xs text-red-400">
                                <AlertCircle size={14} />
                                API未接続
                            </span>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleOpen}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--color-surface-hover)] hover:bg-[var(--color-border)] transition-colors"
                    >
                        <FolderOpen size={18} />
                        <span>開く</span>
                    </button>
                    <button
                        onClick={generatePreview}
                        disabled={loading}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--color-surface-hover)] hover:bg-[var(--color-border)] transition-colors disabled:opacity-50"
                    >
                        <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                        <span>更新</span>
                    </button>
                    <button
                        onClick={handleSave}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${saved
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-[var(--color-surface-hover)] hover:bg-[var(--color-border)]'
                            }`}
                    >
                        {saved ? <CheckCircle size={18} /> : <Save size={18} />}
                        <span>{saved ? '保存完了' : '保存'}</span>
                    </button>
                    <button
                        onClick={handlePrint}
                        disabled={!previewHtml}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--color-surface-hover)] hover:bg-[var(--color-border)] transition-colors disabled:opacity-50"
                    >
                        <Printer size={18} />
                        <span>印刷</span>
                    </button>
                    <button
                        onClick={handleExportDocx}
                        disabled={loading}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors disabled:opacity-50"
                    >
                        <FileText size={18} />
                        <span>Word</span>
                    </button>
                    <button
                        onClick={handleExportHtml}
                        disabled={!previewHtml}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white transition-colors disabled:opacity-50"
                    >
                        <FileDown size={18} />
                        <span>HTML</span>
                    </button>
                </div>
            </header>

            {error && (
                <div className="flex items-center gap-2 px-6 py-3 bg-red-500/10 border-b border-red-500/20 text-red-400">
                    <AlertCircle size={18} />
                    <span>{error}</span>
                </div>
            )}

            <div className="flex-1 flex overflow-hidden">
                <div className="w-1/2 flex flex-col border-r border-[var(--color-border)] overflow-hidden">
                    <div className="p-4 border-b border-[var(--color-border)]">
                        <CopilotHelper type="lesson-plan" />
                    </div>

                    <div className="flex-1 p-4 overflow-hidden">
                        <YamlEditor
                            value={yaml}
                            onChange={setYaml}
                            placeholder="Copilotで生成したYAMLを貼り付けてください"
                        />
                    </div>
                </div>

                <div className="w-1/2 p-4 bg-gray-800">
                    <ExamPreview html={previewHtml} loading={loading} />
                </div>
            </div>

            {/* Confirmation Dialog */}
            <UnsavedChangesDialog blocker={blocker} onSave={handleSave} />
        </div>
    );
}
