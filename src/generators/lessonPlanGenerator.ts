/**
 * 指導案ジェネレーター（TypeScript版）
 * YAMLコンテンツからHTML形式の指導案を生成する
 */

import yaml from 'js-yaml';

interface Phase {
    時間?: number;
    学習内容?: string[];
    学習活動?: string[];
    留意点?: string[];
}

interface FlowData {
    [phaseName: string]: Phase;
}

interface EvaluationItem {
    規準?: string;
    [key: string]: unknown;
}

interface LessonPlanData {
    教科?: string;
    科目?: string;
    日時?: string;
    学校名?: string;
    対象?: string;
    会場?: string;
    授業者?: string;
    単元名?: string;
    使用教科書?: string;
    本時の目標?: string[];
    目標?: string[];
    展開?: FlowData;
    授業展開?: FlowData;
    評価?: (string | EvaluationItem)[];
    本時の評価?: (string | EvaluationItem)[];
}

class LessonPlanGenerator {
    private data: LessonPlanData;

    constructor(yamlContent: string) {
        this.data = yaml.load(yamlContent) as LessonPlanData;
    }

    generateHtml(): string {
        return this.buildHtml();
    }

    private buildHtml(): string {
        const d = this.data;
        const subject = d.教科 || '';

        return `<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${subject}科 学習指導案</title>
    <script id="MathJax-script" async src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"></script>
    <style>
        @media print {
            @page { size: A4; margin: 20mm; }
            .page-break { page-break-after: always; }
        }
        body { 
            font-family: 'Hiragino Mincho ProN', 'Yu Mincho', serif; 
            line-height: 1.6; 
            max-width: 210mm; 
            margin: 0 auto; 
            padding: 20px;
            color: #333;
        }
        
        h1 { text-align: center; font-size: 22pt; margin-bottom: 30px; border-bottom: 3px double #000; padding-bottom: 10px; }
        h2 { font-size: 14pt; margin-top: 25px; border-left: 4px solid #3b82f6; padding-left: 10px; background: #f0f8ff; padding: 8px 10px; }
        h3 { font-size: 12pt; margin-top: 15px; }
        
        .header-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        .header-table td, .header-table th { border: 1px solid #333; padding: 8px 12px; }
        .header-table th { background: #f5f5f5; width: 100px; text-align: left; }
        
        .section { margin: 20px 0; }
        .section ul { margin: 10px 0; padding-left: 25px; }
        .section li { margin: 5px 0; }
        
        .flow-table { width: 100%; border-collapse: collapse; margin: 15px 0; }
        .flow-table th, .flow-table td { border: 1px solid #333; padding: 10px; vertical-align: top; }
        .flow-table th { background: #e8e8e8; text-align: center; }
        .flow-table td:first-child { width: 80px; text-align: center; font-weight: bold; }
        
        .activity { margin: 5px 0; }
        .activity-content { color: #000; }
        .activity-action { color: #555; margin-left: 15px; }
        
        .goals { background: #fffde7; padding: 15px; border-radius: 5px; border-left: 4px solid #ffc107; }
        .evaluation { background: #e8f5e9; padding: 15px; border-radius: 5px; border-left: 4px solid #4caf50; }
    </style>
</head>
<body>
    <h1>${subject}科 学習指導案</h1>
    
    ${this.createHeader()}
    ${this.createUnitInfo()}
    ${this.createGoals()}
    ${this.createFlow()}
    ${this.createEvaluation()}
</body>
</html>`;
    }

    private createHeader(): string {
        const d = this.data;
        return `
    <table class="header-table">
        <tr><th>日　時</th><td>${d.日時 || ''}</td></tr>
        <tr><th>学校名</th><td>${d.学校名 || ''}</td></tr>
        <tr><th>対　象</th><td>${d.対象 || ''}</td></tr>
        <tr><th>会　場</th><td>${d.会場 || ''}</td></tr>
        <tr><th>授業者</th><td>${d.授業者 || ''}</td></tr>
    </table>`;
    }

    private createUnitInfo(): string {
        const d = this.data;
        return `
    <h2>１　単元名</h2>
    <div class="section">
        <strong>${d.単元名 || ''}</strong>
        （${d.使用教科書 || ''}）
    </div>`;
    }

    private createGoals(): string {
        const d = this.data;
        const goals = d.本時の目標 || d.目標 || [];
        const goalsHtml = goals.filter(g => g).map(g => `<li>${g}</li>`).join('\n');

        return `
    <h2>２　本時の目標</h2>
    <div class="section goals">
        <ul>${goalsHtml}</ul>
    </div>`;
    }

    private createFlow(): string {
        const d = this.data;
        const flow = d.展開 || d.授業展開 || {};

        if (Object.keys(flow).length === 0) {
            return '';
        }

        let rowsHtml = '';
        for (const [phaseName, phase] of Object.entries(flow)) {
            if (!phase) continue;

            const time = phase.時間 || '';

            // 学習内容・活動
            const activities: string[] = [];
            for (const c of (phase.学習内容 || [])) {
                if (c) {
                    activities.push(`<div class="activity"><span class="activity-content">○ ${c}</span></div>`);
                }
            }
            for (const a of (phase.学習活動 || [])) {
                if (a) {
                    activities.push(`<div class="activity"><span class="activity-action">・ ${a}</span></div>`);
                }
            }
            const activitiesHtml = activities.join('\n');

            // 留意点
            const notes = phase.留意点 || [];
            const notesHtml = notes.filter(n => n).map(n => `・${n}`).join('\n');

            rowsHtml += `
        <tr>
            <td>${phaseName}<br>(${time}分)</td>
            <td>${activitiesHtml}</td>
            <td>${notesHtml}</td>
        </tr>`;
        }

        return `
    <h2>３　本時の展開</h2>
    <table class="flow-table">
        <tr>
            <th>時間</th>
            <th>○学習内容　・学習活動</th>
            <th>指導上の留意点</th>
        </tr>
        ${rowsHtml}
    </table>`;
    }

    private createEvaluation(): string {
        const d = this.data;
        const evaluations = d.評価 || d.本時の評価 || [];

        if (!evaluations || evaluations.length === 0) {
            return '';
        }

        const evalsHtml = evaluations.filter(e => e).map(e => {
            const text = typeof e === 'object' && e !== null && '規準' in e
                ? (e as EvaluationItem).規準
                : String(e);
            return `<li>${text}</li>`;
        }).join('\n');

        return `
    <h2>４　本時の評価</h2>
    <div class="section evaluation">
        <ul>${evalsHtml}</ul>
    </div>`;
    }
}

/**
 * YAML文字列からHTML文字列を生成
 */
export function generateLessonPlanHtml(yamlContent: string): string {
    const generator = new LessonPlanGenerator(yamlContent);
    return generator.generateHtml();
}
