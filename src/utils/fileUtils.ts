/**
 * ファイル操作ユーティリティ
 */

/**
 * YAMLファイルとして保存（ブラウザAPI）
 */
export function saveYamlFile(content: string, filename: string): void {
    const blob = new Blob([content], { type: 'text/yaml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename.endsWith('.yaml') ? filename : `${filename}.yaml`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

/**
 * YAMLファイルを開く（ブラウザAPI）
 */
export function openYamlFile(): Promise<{ content: string; filename: string } | null> {
    return new Promise((resolve) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.yaml,.yml';

        input.onchange = async (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (!file) {
                resolve(null);
                return;
            }

            const content = await file.text();
            resolve({ content, filename: file.name });
        };

        input.click();
    });
}

/**
 * HTMLをPDFとして印刷（ブラウザの印刷ダイアログを使用）
 */
export function printHtml(html: string, title: string): void {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
        alert('ポップアップがブロックされました。ポップアップを許可してください。');
        return;
    }

    printWindow.document.write(html);
    printWindow.document.title = title;
    printWindow.document.close();

    // MathJaxの読み込みを待つ
    setTimeout(() => {
        printWindow.print();
    }, 1500);
}

/**
 * HTMLファイルとしてエクスポート
 */
export function exportHtml(html: string, filename: string): void {
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename.endsWith('.html') ? filename : `${filename}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}
