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

interface Materials {
    教師?: string[];
    生徒?: string[];
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
    生徒の実態?: string[];
    本時の目標?: string[];
    目標?: string[];
    準備物?: Materials;
    展開?: FlowData;
    授業展開?: FlowData;
    評価?: Record<string, string> | string[];
    本時の評価?: Record<string, string> | string[];
    板書計画?: string;
    デジタル教科書活用?: string[];
    配慮事項?: string[];
    [key: string]: unknown;
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
            @page { size: A4; margin: 15mm; }
            .page-break { page-break-after: always; }
        }
        body { 
            font-family: 'Hiragino Mincho ProN', 'Yu Mincho', serif; 
            line-height: 1.6; 
            max-width: 210mm; 
            margin: 0 auto; 
            padding: 20px;
            color: #333;
            font-size: 10.5pt;
        }
        
        h1 { text-align: center; font-size: 18pt; margin-bottom: 20px; border-bottom: 3px double #000; padding-bottom: 10px; }
        h2 { font-size: 12pt; margin-top: 20px; margin-bottom: 10px; border-left: 4px solid #3b82f6; padding-left: 10px; background: #f0f8ff; padding: 6px 10px; }
        h3 { font-size: 11pt; margin-top: 15px; }
        
        .header-table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
        .header-table td, .header-table th { border: 1px solid #333; padding: 6px 10px; }
        .header-table th { background: #f5f5f5; width: 80px; text-align: left; }
        
        .section { margin: 15px 0; }
        .section ul { margin: 8px 0; padding-left: 20px; }
        .section li { margin: 3px 0; }
        
        .flow-table { width: 100%; border-collapse: collapse; margin: 10px 0; font-size: 10pt; }
        .flow-table th, .flow-table td { border: 1px solid #333; padding: 8px; vertical-align: top; }
        .flow-table th { background: #e8e8e8; text-align: center; }
        .flow-table td:first-child { width: 70px; text-align: center; font-weight: bold; }
        
        .activity { margin: 3px 0; }
        .activity-content { color: #000; }
        .activity-action { color: #555; margin-left: 10px; }
        
        .goals { background: #fffde7; padding: 12px; border-radius: 5px; border-left: 4px solid #ffc107; }
        .evaluation { background: #e8f5e9; padding: 12px; border-radius: 5px; border-left: 4px solid #4caf50; }
        .materials { background: #e3f2fd; padding: 12px; border-radius: 5px; border-left: 4px solid #2196f3; }
        .board-plan { background: #f5f5f5; padding: 12px; border-radius: 5px; border: 1px solid #ddd; white-space: pre-wrap; font-family: monospace; }
        .digital { background: #fff3e0; padding: 12px; border-radius: 5px; border-left: 4px solid #ff9800; }
        .considerations { background: #fce4ec; padding: 12px; border-radius: 5px; border-left: 4px solid #e91e63; }
        .students { background: #f3e5f5; padding: 12px; border-radius: 5px; border-left: 4px solid #9c27b0; }
        
        .two-column { display: flex; gap: 20px; }
        .two-column > div { flex: 1; }
    </style>
</head>
<body>
    <h1>${subject}科 学習指導案</h1>
    
    ${this.createHeader()}
    ${this.createUnitInfo()}
    ${this.createStudentCharacteristics()}
    ${this.createGoals()}
    ${this.createMaterials()}
    ${this.createFlow()}
    ${this.createEvaluation()}
    ${this.createBoardPlan()}
    ${this.createDigitalUsage()}
    ${this.createConsiderations()}
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
        ${d.使用教科書 ? `（${d.使用教科書}）` : ''}
    </div>`;
    }

    private createStudentCharacteristics(): string {
        const d = this.data;
        let characteristics = d.生徒の実態 || [];

        if (!characteristics || (Array.isArray(characteristics) && characteristics.length === 0)) {
            return '';
        }

        if (!Array.isArray(characteristics)) {
            characteristics = Object.values(characteristics as Record<string, string>);
        }

        const html = characteristics.filter(c => c).map(c => `<li>${c}</li>`).join('\n');

        return `
    <h2>２　生徒の実態</h2>
    <div class="section students">
        <ul>${html}</ul>
    </div>`;
    }

    private createGoals(): string {
        const d = this.data;
        let goals = d.本時の目標 || d.目標 || [];

        if (goals && !Array.isArray(goals)) {
            goals = Object.values(goals as Record<string, string>);
        }

        const goalsArray = Array.isArray(goals) ? goals : [];
        const goalsHtml = goalsArray.filter(g => g).map(g => `<li>${g}</li>`).join('\n');

        return `
    <h2>３　本時の目標</h2>
    <div class="section goals">
        <ul>${goalsHtml}</ul>
    </div>`;
    }

    private createMaterials(): string {
        const d = this.data;
        const materials = d.準備物;

        if (!materials) {
            return '';
        }

        const teacherItems = Array.isArray(materials.教師)
            ? materials.教師.filter(m => m).map(m => `<li>${m}</li>`).join('\n')
            : '';
        const studentItems = Array.isArray(materials.生徒)
            ? materials.生徒.filter(m => m).map(m => `<li>${m}</li>`).join('\n')
            : '';

        if (!teacherItems && !studentItems) {
            return '';
        }

        return `
    <h2>４　準備物</h2>
    <div class="section materials two-column">
        <div>
            <strong>【教師】</strong>
            <ul>${teacherItems}</ul>
        </div>
        <div>
            <strong>【生徒】</strong>
            <ul>${studentItems}</ul>
        </div>
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
            const contents = Array.isArray(phase.学習内容) ? phase.学習内容 : [];
            for (const c of contents) {
                if (c) {
                    activities.push(`<div class="activity"><span class="activity-content">○ ${c}</span></div>`);
                }
            }
            const actions = Array.isArray(phase.学習活動) ? phase.学習活動 : [];
            for (const a of actions) {
                if (a) {
                    activities.push(`<div class="activity"><span class="activity-action">・ ${a}</span></div>`);
                }
            }
            const activitiesHtml = activities.join('\n');

            // 留意点
            const notes = Array.isArray(phase.留意点) ? phase.留意点 : [];
            const notesHtml = notes.filter(n => n).map(n => `・${n}`).join('<br>');

            rowsHtml += `
        <tr>
            <td>${phaseName}<br>(${time}分)</td>
            <td>${activitiesHtml}</td>
            <td>${notesHtml}</td>
        </tr>`;
        }

        return `
    <h2>５　本時の展開</h2>
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
        const evaluations = d.評価 || d.本時の評価;

        if (!evaluations) {
            return '';
        }

        let evalsHtml = '';

        // オブジェクト形式の場合（知識・技能: "..." など）
        if (evaluations && typeof evaluations === 'object' && !Array.isArray(evaluations)) {
            const entries = Object.entries(evaluations as Record<string, string>);
            evalsHtml = entries.map(([key, value]) => `<li><strong>${key}：</strong>${value}</li>`).join('\n');
        }
        // 配列形式の場合
        else if (Array.isArray(evaluations)) {
            evalsHtml = evaluations.filter(e => e).map(e => {
                const text = typeof e === 'object' && e !== null && '規準' in e
                    ? String((e as Record<string, unknown>).規準)
                    : String(e);
                return `<li>${text}</li>`;
            }).join('\n');
        }

        if (!evalsHtml) {
            return '';
        }

        return `
    <h2>６　本時の評価</h2>
    <div class="section evaluation">
        <ul>${evalsHtml}</ul>
    </div>`;
    }

    private createBoardPlan(): string {
        const d = this.data;
        const plan = d.板書計画;

        if (!plan) {
            return '';
        }

        return `
    <h2>７　板書計画</h2>
    <div class="section board-plan">${plan}</div>`;
    }

    private createDigitalUsage(): string {
        const d = this.data;
        let items = d.デジタル教科書活用;

        if (!items || (Array.isArray(items) && items.length === 0)) {
            return '';
        }

        if (!Array.isArray(items)) {
            items = Object.values(items as Record<string, string>);
        }

        const html = items.filter(i => i).map(i => `<li>${i}</li>`).join('\n');

        return `
    <h2>８　デジタル教科書活用</h2>
    <div class="section digital">
        <ul>${html}</ul>
    </div>`;
    }

    private createConsiderations(): string {
        const d = this.data;
        let items = d.配慮事項;

        if (!items || (Array.isArray(items) && items.length === 0)) {
            return '';
        }

        if (!Array.isArray(items)) {
            items = Object.values(items as Record<string, string>);
        }

        const html = items.filter(i => i).map(i => `<li>${i}</li>`).join('\n');

        return `
    <h2>９　配慮事項</h2>
    <div class="section considerations">
        <ul>${html}</ul>
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
