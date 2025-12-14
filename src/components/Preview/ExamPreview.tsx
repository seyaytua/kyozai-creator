import { useEffect, useRef } from 'react';
import { Loader2 } from 'lucide-react';

interface ExamPreviewProps {
    html: string;
    loading?: boolean;
}

export function ExamPreview({ html, loading }: ExamPreviewProps) {
    const iframeRef = useRef<HTMLIFrameElement>(null);

    useEffect(() => {
        if (iframeRef.current && html) {
            const doc = iframeRef.current.contentDocument;
            if (doc) {
                doc.open();
                doc.write(html);
                doc.close();
            }
        }
    }, [html]);

    return (
        <div className="h-full bg-white rounded-xl overflow-hidden shadow-lg relative">
            {/* Header */}
            <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-gray-100 to-transparent h-8 z-10 flex items-center px-4">
                <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    <div className="w-3 h-3 rounded-full bg-yellow-400" />
                    <div className="w-3 h-3 rounded-full bg-green-400" />
                </div>
                <span className="ml-4 text-xs text-gray-500">プレビュー</span>
            </div>

            {loading ? (
                <div className="h-full flex items-center justify-center text-gray-400">
                    <Loader2 className="animate-spin mr-2" size={24} />
                    <span>生成中...</span>
                </div>
            ) : html ? (
                <iframe
                    ref={iframeRef}
                    className="w-full h-full border-0 pt-8"
                    title="Preview"
                    sandbox="allow-same-origin"
                />
            ) : (
                <div className="h-full flex items-center justify-center text-gray-400 pt-8">
                    <div className="text-center">
                        <p className="text-4xl mb-4">📄</p>
                        <p>YAMLを入力するとプレビューが表示されます</p>
                    </div>
                </div>
            )}
        </div>
    );
}
