/**
 * テスト作成ジェネレーター（TypeScript版）
 * YAMLコンテンツからHTML形式の定期考査問題を生成する
 */

import yaml from 'js-yaml';
import { marked } from 'marked';

interface SubProblem {
    番号?: string;
    本文?: string;
    配点?: number;
    改ページ?: boolean;
    解答?: string;
    解説?: string;
}

interface Question {
    番号?: number | string;
    タイトル?: string;
    必須?: boolean;
    区分?: string;
    配点?: number;
    改ページ?: boolean;
    小問?: SubProblem[];
    問題?: SubProblem[];
}

interface ExamData {
    タイトル?: string;
    試験名?: string;
    サブタイトル?: string;
    学校名?: string;
    科目?: string;
    試験時間?: number;
    配点合計?: number;
    注意事項?: string[];
    大問?: Question[];
}

class ExamGenerator {
    private data: ExamData;

    constructor(yamlContent: string) {
        this.data = yaml.load(yamlContent) as ExamData;
    }

    generateHtml(): string {
        return this.buildHtml();
    }

    private buildHtml(): string {
        const title = this.data.タイトル || this.data.試験名 || '定期考査';

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
                    leqq: '\\\\text{≦}',
                    geqq: '\\\\text{≧}',
                    frac: ['\\\\dfrac{#1}{#2}', 2],
                    int: '\\\\displaystyle\\\\intop',
                    lim: '\\\\displaystyle\\\\mathop{\\\\rm lim}'
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
            .page-break { 
                display: block;
                height: 0;
                page-break-before: always; 
                break-before: page;
                clear: both;
            }
            body {
                width: 100% !important;
                max-width: none !important;
                margin: 0 !important;
                padding: 0 !important;
            }
            @page { size: A4; margin: 15mm; }
        }
        
        /* 画面プレビュー用：改ページ位置を可視化 */
        @media screen {
            [style*="break-before: page"] {
                border-top: 4px dashed #ddd !important;
                margin-top: 40px !important;
                padding-top: 40px !important;
                position: relative;
            }
            [style*="break-before: page"]::before {
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

        body { font-family: 'Hiragino Mincho ProN', 'Yu Mincho', serif; line-height: 1.6; max-width: 210mm; margin: 0 auto; padding: 20px; }
        
        /* 表紙スタイル */
        .cover-wrapper { min-height: 270mm; display: flex; align-items: flex-start; justify-content: center; padding-top: 15mm; }
        .cover-page { width: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; border: 3px solid #000; padding: 40px; box-sizing: border-box; }
        .exam-title { font-size: 28pt; font-weight: bold; margin: 20px 0; }
        .exam-subtitle { font-size: 18pt; margin-bottom: 40px; }
        
        /* 情報欄 */
        .exam-info { width: 100%; margin: 30px 0; text-align: center; }
        .exam-info p { margin: 10px 0; font-size: 14pt; }
        
        /* 注意事項 */
        .exam-notes { border: 2px solid #000; padding: 20px; width: 80%; margin: 30px auto; text-align: left; font-size: 11pt; background-color: #fafafa; }
        .exam-notes h3 { margin-top: 0; text-align: center; text-decoration: underline; }
        .exam-notes ul { padding-left: 20px; }
        .exam-notes li { margin-bottom: 10px; }

        /* 生徒記入欄 */
        .student-box { width: 90%; margin: 60px auto 0; border: 2px solid #000; padding: 20px; }
        .input-row { display: flex; justify-content: space-between; align-items: baseline; font-size: 14pt; }
        .input-group { display: flex; gap: 20px; }
        .input-label { font-weight: bold; }
        .input-line { border-bottom: 1px solid #000; min-width: 300px; display: inline-block; }
        
        /* 問題ページ */
        .problem-page { padding: 10px; }
        .problem-header { border-bottom: 2px solid #000; margin-bottom: 25px; padding-bottom: 10px; display: flex; justify-content: space-between; align-items: baseline; }
        .problem-title { font-size: 16pt; font-weight: bold; }
        .problem-type { font-size: 12pt; border: 1px solid #000; padding: 2px 10px; border-radius: 4px; margin-left: 10px; }
        .problem-score { font-weight: bold; }
        
        .problem-content { font-size: 11pt; }
        .problem-item { margin-bottom: 30px; }
        .problem-item-num { float: left; font-weight: bold; margin-right: 10px; font-size: 12pt; }
        .problem-item-body { overflow: hidden; }

        /* 解答解説ページ */
        .answer-page h2 { border-bottom: 3px double #000; padding-bottom: 10px; }
        .answer-item { margin-bottom: 20px; border-bottom: 1px dashed #ccc; padding-bottom: 10px; }
        .answer-correct { font-weight: bold; font-size: 12pt; color: #d00; }
        .answer-explanation { margin-top: 10px; font-size: 10pt; color: #555; background: #f9f9f9; padding: 10px; border-radius: 5px; }
    </style>
</head>
<body>
    ${this.createCover()}
    <div class="page-break"></div>
    ${this.createProblems()}
    <div class="page-break"></div>
    ${this.createAnswers()}
</body>
</html>`;
    }

    private createCover(): string {
        const notes = this.data.注意事項 || [];
        const notesHtml = notes.map(note => `<li>${note}</li>`).join('\n');

        // 注意事項の行数に応じてスタイルを調整
        const notesCount = notes.length;
        let notesStyle: string;
        let liStyle: string;

        if (notesCount >= 10) {
            notesStyle = "font-size: 9pt; line-height: 1.2;";
            liStyle = "margin-bottom: 2px;";
        } else if (notesCount >= 8) {
            notesStyle = "font-size: 9.5pt; line-height: 1.3;";
            liStyle = "margin-bottom: 3px;";
        } else if (notesCount >= 6) {
            notesStyle = "font-size: 10pt; line-height: 1.4;";
            liStyle = "margin-bottom: 5px;";
        } else {
            notesStyle = "font-size: 11pt; line-height: 1.6;";
            liStyle = "margin-bottom: 10px;";
        }

        const title = this.data.タイトル || this.data.試験名 || '';
        const subtitle = this.data.サブタイトル || '';
        const styledNotesHtml = notesHtml.replace(/<li>/g, `<li style="${liStyle}">`);

        return `
    <div class="cover-wrapper">
    <div class="cover-page">
        <h1 class="exam-title">${title}</h1>
        <div class="exam-subtitle">${subtitle}</div>
        
        <div class="exam-info">
            <p><strong>学校名：</strong> ${this.data.学校名 || ''}</p>
            <p><strong>科目：</strong> ${this.data.科目 || ''}</p>
            <p><strong>試験時間：</strong> ${this.data.試験時間 || ''}分</p>
        </div>

        <div class="exam-notes" style="${notesStyle}">
            <h3>注意事項</h3>
            <ul style="margin: 0;">${styledNotesHtml}</ul>
            <div style="text-align:center; margin-top:10px; font-weight:bold;">
                ※ 試験終了までこの表紙を開かないこと
            </div>
        </div>

        <div class="student-box">
            <div class="input-row">
                <div class="input-group">
                    <span>　　年</span>
                    <span>　　組</span>
                    <span>　　番</span>
                </div>
                <div class="input-group" style="flex-grow: 1; justify-content: flex-end;">
                    <span class="input-label">氏名</span>
                    <span class="input-line"></span>
                </div>
            </div>
        </div>
    </div>
    </div>`;
    }

    private createProblems(): string {
        let html = '';
        const questions = this.data.大問 || [];

        for (const q of questions) {
            // 改ページチェック（大問の前）
            const qbStyle = q.改ページ ? ' style="page-break-before: always; break-before: page;"' : '';

            // 区分（必答/選択/なし）
            let qType = '';
            if (q.必須) {
                qType = '必答';
            } else if (q.区分) {
                qType = q.区分;
            }
            const typeHtml = qType && qType !== '記載なし'
                ? `<span class="problem-type">${qType}</span>`
                : '';

            // 配点
            const scoreHtml = q.配点
                ? `<span class="problem-score">（配点 ${q.配点}点）</span>`
                : '';

            // 大問タイトル
            const title = q.タイトル || q.番号 || '';
            const number = q.番号 || '';

            html += `
    <div class="problem-page"${qbStyle}>
        <div class="problem-header">
            <div>
                <span class="problem-title">${number}. ${title}</span>
                ${typeHtml}
            </div>
            ${scoreHtml}
        </div>
        <div class="problem-content">`;

            // 小問
            const subProblems = q.小問 || q.問題 || [];
            for (const sub of subProblems) {
                let sbStyle = '';
                let body = '';
                let num = '';

                if (typeof sub === 'object' && sub !== null) {
                    // 改ページチェック（小問の前）
                    if (sub.改ページ) {
                        sbStyle = ' style="page-break-before: always; break-before: page;"';
                    }
                    body = sub.本文 || '';
                    num = sub.番号 || '';
                } else {
                    body = String(sub);
                }

                // リテラルの \n を実際の改行に変換
                body = body.replace(/\\n/g, '\n');

                const bodyHtml = marked.parse(body) as string;
                html += `
            <div class="problem-item"${sbStyle}>
                <div class="problem-item-num">${num}</div>
                <div class="problem-item-body">${bodyHtml}</div>
            </div>`;
            }

            html += `
        </div>
    </div>`;
        }

        return html;
    }

    private createAnswers(): string {
        let html = `
    <div class="answer-page">
        <h2>解答・解説</h2>`;

        const questions = this.data.大問 || [];
        for (const q of questions) {
            const title = q.タイトル || q.番号 || '';
            const number = q.番号 || '';
            html += `<h3>${number}. ${title}</h3>`;

            const subProblems = q.小問 || q.問題 || [];
            for (const sub of subProblems) {
                if (typeof sub !== 'object' || sub === null) continue;

                const num = sub.番号 || '';
                // リテラルの \n を実際の改行に変換
                const ans = (sub.解答 || '（解答なし）').replace(/\\n/g, '\n');
                const exp = (sub.解説 || '').replace(/\\n/g, '\n');

                const expHtml = exp
                    ? `<div class="answer-explanation"><strong>【解説】</strong><br>${marked.parse(exp)}</div>`
                    : '';

                html += `
            <div class="answer-item">
                <div><strong>${num}</strong> <span class="answer-correct">${ans}</span></div>
                ${expHtml}
            </div>`;
            }
        }

        html += '</div>';
        return html;
    }
}

/**
 * YAML文字列からHTML文字列を生成
 */
export function generateExamHtml(yamlContent: string): string {
    const generator = new ExamGenerator(yamlContent);
    return generator.generateHtml();
}
