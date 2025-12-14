/**
 * プリント作成ジェネレーター（TypeScript版）
 * YAMLコンテンツからHTML形式のプリント（ワークシート）を生成する
 */

import yaml from 'js-yaml';
import { marked } from 'marked';

interface SubProblem {
    番号?: string;
    本文?: string;
}

interface WorksheetProblem {
    type?: 'header';
    text?: string;
    番号?: number | string;
    本文?: string;
    配点?: number;
    スペース?: number;
    小問?: (string | SubProblem)[];
    解答?: string | string[];
    解説?: string;
    改ページ?: boolean;
}

interface WorksheetData {
    タイトル?: string;
    サブタイトル?: string;
    解答を作成?: boolean;
    問題?: WorksheetProblem[];
}

class WorksheetGenerator {
    private data: WorksheetData;

    constructor(yamlContent: string) {
        this.data = yaml.load(yamlContent) as WorksheetData;
    }

    generateHtml(): string {
        return this.buildHtml();
    }

    private buildHtml(): string {
        const title = this.data.タイトル || 'プリント';
        const showAnswers = this.data.解答を作成 !== false;

        return `<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <script>
        MathJax = {
            tex: {
                inlineMath: [['$', '$']],
                displayMath: [['$$', '$$']],
                processEscapes: true,
                packages: {'[+]': ['ams']},
                macros: {
                    leqq: '\\\\leqslant',
                    geqq: '\\\\geqslant',
                    lneqq: '\\\\lneqq',
                    gneqq: '\\\\gneqq'
                }
            },
            loader: {load: ['[tex]/ams']},
            chtml: {
                scale: 1.0,
                matchFontHeight: true
            }
        };
    </script>
    <script id="MathJax-script" async src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-chtml.js"></script>
    <style>
        @media print {
            @page { size: A4; margin: 20mm; }
            .page-break { page-break-after: always; }
            body {
                width: 100% !important;
                max-width: none !important;
                margin: 0 !important;
                padding: 0 !important;
            }
        }

        /* 画面プレビュー用：改ページ位置を可視化 */
        @media screen {
            .page-break, [style*="break-before: page"], [style*="break-after: page"] {
                border-top: 4px dashed #ddd !important;
                margin-top: 40px !important;
                padding-top: 40px !important;
                position: relative;
                display: block;
            }
            .page-break::before, [style*="break-before: page"]::before, [style*="break-after: page"]::before {
                content: "--- 改ページ ---";
                display: block;
                position: absolute;
                top: -24px;
                left: 50%;
                transform: translateX(-50%);
                color: #aaa;
                font-size: 12px;
                font-weight: bold;
                background: #fff;
                padding: 0 10px;
            }
        }
        body { 
            font-family: 'Hiragino Mincho ProN', 'Yu Mincho', serif; 
            line-height: 1.8; 
            max-width: 210mm; 
            margin: 0 auto; 
            padding: 20px;
            color: #333;
        }
        
        /* ヘッダー */
        .header {
            display: flex;
            justify-content: flex-end;
            margin-bottom: 20px;
            font-size: 12pt;
        }
        .header-field {
            margin-left: 20px;
        }
        .header-field .label {
            margin-right: 5px;
        }
        .header-field .underline {
            display: inline-block;
            border-bottom: 1px solid #333;
            min-width: 80px;
        }
        .header-field.name .underline {
            min-width: 200px;
        }
        
        /* タイトル */
        .title {
            text-align: center;
            font-size: 20pt;
            font-weight: bold;
            margin: 30px 0 10px;
        }
        .subtitle {
            text-align: center;
            font-size: 14pt;
            color: #555;
            margin-bottom: 30px;
        }
        
        /* セクション */
        .section-header {
            font-size: 14pt;
            font-weight: bold;
            text-align: center;
            margin: 30px 0 20px;
            padding: 10px;
            background: #f5f5f5;
            border-radius: 5px;
        }
        
        /* 問題 */
        .problem {
            margin: 25px 0;
        }
        .problem-header {
            display: flex;
            align-items: baseline;
            margin-bottom: 10px;
        }
        .problem-number {
            font-weight: bold;
            font-size: 14pt;
            margin-right: 15px;
        }
        .problem-text {
            font-size: 11pt;
            flex: 1;
        }
        .problem-score {
            font-size: 10pt;
            color: #666;
            margin-left: 10px;
        }
        .sub-problems {
            margin-left: 30px;
            margin-top: 10px;
        }
        .sub-problem {
            margin: 8px 0;
        }
        .answer-space {
            height: 100px;
            margin: 15px 0;
        }
        
        /* 解答ページ */
        .answer-page {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 3px double #333;
        }
        .answer-page h2 {
            text-align: center;
            margin-bottom: 30px;
        }
        .answer-item {
            margin: 15px 0;
            padding: 10px;
            background: #fafafa;
            border-radius: 5px;
        }
        .answer-correct {
            font-weight: bold;
            color: #d00;
        }
        .answer-explanation {
            margin-top: 10px;
            font-size: 10pt;
            color: #555;
            padding: 10px;
            background: #fff;
            border-left: 3px solid #3b82f6;
        }
    </style>
</head>
<body>
    ${this.createHeader()}
    ${this.createTitle()}
    ${this.createProblems()}
    ${showAnswers ? this.createAnswers() : ''}
</body>
</html>`;
    }

    private createHeader(): string {
        return `
    <div class="header">
        <span class="header-field"><span class="label">年</span><span class="underline"></span></span>
        <span class="header-field"><span class="label">組</span><span class="underline"></span></span>
        <span class="header-field"><span class="label">番</span><span class="underline"></span></span>
        <span class="header-field name"><span class="label">名前</span><span class="underline"></span></span>
    </div>`;
    }

    private createTitle(): string {
        const title = this.data.タイトル || '';
        const subtitle = this.data.サブタイトル || '';

        let html = `<h1 class="title">${title}</h1>`;
        if (subtitle) {
            html += `<div class="subtitle">〜 ${subtitle} 〜</div>`;
        }
        return html;
    }

    private createProblems(): string {
        const problems = this.data.問題 || [];
        let html = '';

        for (let i = 0; i < problems.length; i++) {
            const prob = problems[i];

            // セクションヘッダー
            if (prob.type === 'header') {
                const hbStyle = prob.改ページ
                    ? ' style="page-break-before: always; break-before: page;"'
                    : '';
                html += `<div class="section-header"${hbStyle}>${prob.text || ''}</div>`;
                continue;
            }

            // 問題の改ページチェック
            const pbStyle = prob.改ページ
                ? ' style="page-break-before: always; break-before: page;"'
                : '';

            const num = prob.番号 ?? (i + 1);
            const text = prob.本文 || '';
            const score = prob.配点;
            const subProblems = prob.小問 || [];
            const spaces = prob.スペース ?? 5;

            const scoreHtml = score ? `<span class="problem-score">[${score}点]</span>` : '';
            const textHtml = text ? marked.parse(text) : '';

            html += `
    <div class="problem"${pbStyle}>
        <div class="problem-header">
            <span class="problem-number">${num}</span>
            <span class="problem-text">${textHtml}</span>
            ${scoreHtml}
        </div>`;

            if (subProblems.length > 0) {
                html += '<div class="sub-problems">';
                for (const sub of subProblems) {
                    if (typeof sub === 'string') {
                        html += `<div class="sub-problem">${sub}</div>`;
                    } else {
                        const subText = sub.本文 || '';
                        const subNum = sub.番号 || '';
                        html += `<div class="sub-problem">${subNum} ${subText}</div>`;
                    }
                }
                html += '</div>';
            }

            // 解答スペース
            const spaceHeight = spaces * 20;
            html += `<div class="answer-space" style="height: ${spaceHeight}px;"></div>`;
            html += '</div>';
        }

        return html;
    }

    private createAnswers(): string {
        const problems = this.data.問題 || [];
        let html = `
    <div class="page-break"></div>
    <div class="answer-page">
        <h2>解答・解説</h2>`;

        for (let i = 0; i < problems.length; i++) {
            const prob = problems[i];

            if (prob.type === 'header') continue;

            const num = prob.番号 ?? (i + 1);
            const answers = prob.解答;
            const explanation = prob.解説 || '';

            if (!answers && !explanation) continue;

            html += `<div class="answer-item"><strong>${num}</strong>`;

            if (answers) {
                if (Array.isArray(answers)) {
                    for (const ans of answers) {
                        html += ` <span class="answer-correct">答: ${ans}</span>`;
                    }
                } else {
                    html += ` <span class="answer-correct">答: ${answers}</span>`;
                }
            }

            if (explanation) {
                const expHtml = marked.parse(String(explanation));
                html += `<div class="answer-explanation">【解説】${expHtml}</div>`;
            }

            html += '</div>';
        }

        html += '</div>';
        return html;
    }
}

/**
 * YAML文字列からHTML文字列を生成
 */
export function generateWorksheetHtml(yamlContent: string): string {
    const generator = new WorksheetGenerator(yamlContent);
    return generator.generateHtml();
}
