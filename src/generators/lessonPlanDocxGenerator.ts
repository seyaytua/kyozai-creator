/**
 * 指導案Word出力ジェネレーター
 * YAMLコンテンツからWord形式の指導案を生成する
 */

import yaml from 'js-yaml';
import {
    Document,
    Paragraph,
    Table,
    TableRow,
    TableCell,
    TextRun,
    HeadingLevel,
    WidthType,
    AlignmentType,
    BorderStyle,
    Packer,
    ShadingType,
} from 'docx';

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

class LessonPlanDocxGenerator {
    private data: LessonPlanData;

    constructor(yamlContent: string) {
        this.data = yaml.load(yamlContent) as LessonPlanData;
    }

    async generateDocx(): Promise<Blob> {
        const doc = this.buildDocument();
        return await Packer.toBlob(doc);
    }

    private buildDocument(): Document {
        const d = this.data;
        const subject = d.教科 || '';

        const children: (Paragraph | Table)[] = [];

        // タイトル
        children.push(
            new Paragraph({
                text: `${subject}科 学習指導案`,
                heading: HeadingLevel.TITLE,
                alignment: AlignmentType.CENTER,
            })
        );

        // ヘッダー表
        children.push(this.createHeaderTable());

        // 単元名
        children.push(this.createHeading('１　単元名'));
        children.push(
            new Paragraph({
                children: [
                    new TextRun({ text: d.単元名 || '', bold: true }),
                    new TextRun({ text: d.使用教科書 ? `（${d.使用教科書}）` : '' }),
                ],
            })
        );

        // 生徒の実態
        const studentChars = this.createListSection('２　生徒の実態', d.生徒の実態);
        if (studentChars) children.push(...studentChars);

        // 本時の目標
        const goals = d.本時の目標 || d.目標 || [];
        const goalsSection = this.createListSection('３　本時の目標', Array.isArray(goals) ? goals : []);
        if (goalsSection) children.push(...goalsSection);

        // 準備物
        const materialsSection = this.createMaterialsSection();
        if (materialsSection) children.push(...materialsSection);

        // 本時の展開
        const flowSection = this.createFlowSection();
        if (flowSection) children.push(...flowSection);

        // 評価
        const evalSection = this.createEvaluationSection();
        if (evalSection) children.push(...evalSection);

        // 板書計画
        if (d.板書計画) {
            children.push(this.createHeading('７　板書計画'));
            children.push(new Paragraph({ text: d.板書計画 }));
        }

        // デジタル教科書活用
        const digitalSection = this.createListSection('８　デジタル教科書活用', d.デジタル教科書活用);
        if (digitalSection) children.push(...digitalSection);

        // 配慮事項
        const considerationsSection = this.createListSection('９　配慮事項', d.配慮事項);
        if (considerationsSection) children.push(...considerationsSection);

        return new Document({
            sections: [{
                properties: {},
                children,
            }],
        });
    }

    private createHeading(text: string): Paragraph {
        return new Paragraph({
            text,
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 200, after: 100 },
        });
    }

    private createHeaderTable(): Table {
        const d = this.data;
        const rows = [
            ['日　時', d.日時 || ''],
            ['学校名', d.学校名 || ''],
            ['対　象', d.対象 || ''],
            ['会　場', d.会場 || ''],
            ['授業者', d.授業者 || ''],
        ];

        return new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: rows.map(([label, value]) =>
                new TableRow({
                    children: [
                        new TableCell({
                            width: { size: 20, type: WidthType.PERCENTAGE },
                            shading: { type: ShadingType.SOLID, color: 'F5F5F5' },
                            children: [new Paragraph({ text: label })],
                        }),
                        new TableCell({
                            width: { size: 80, type: WidthType.PERCENTAGE },
                            children: [new Paragraph({ text: value })],
                        }),
                    ],
                })
            ),
        });
    }

    private createListSection(title: string, items?: string[]): (Paragraph | Table)[] | null {
        if (!items || !Array.isArray(items) || items.length === 0) {
            return null;
        }

        const result: Paragraph[] = [this.createHeading(title)];
        items.filter(i => i).forEach(item => {
            result.push(new Paragraph({
                text: `• ${item}`,
                spacing: { before: 50 },
            }));
        });

        return result;
    }

    private createMaterialsSection(): (Paragraph | Table)[] | null {
        const materials = this.data.準備物;
        if (!materials) return null;

        const teacherItems = Array.isArray(materials.教師) ? materials.教師 : [];
        const studentItems = Array.isArray(materials.生徒) ? materials.生徒 : [];

        if (teacherItems.length === 0 && studentItems.length === 0) return null;

        const result: (Paragraph | Table)[] = [this.createHeading('４　準備物')];

        if (teacherItems.length > 0) {
            result.push(new Paragraph({ text: '【教師】', spacing: { before: 100 } }));
            teacherItems.filter(i => i).forEach(item => {
                result.push(new Paragraph({ text: `• ${item}` }));
            });
        }

        if (studentItems.length > 0) {
            result.push(new Paragraph({ text: '【生徒】', spacing: { before: 100 } }));
            studentItems.filter(i => i).forEach(item => {
                result.push(new Paragraph({ text: `• ${item}` }));
            });
        }

        return result;
    }

    private createFlowSection(): (Paragraph | Table)[] | null {
        const flow = this.data.展開 || this.data.授業展開 || {};
        if (Object.keys(flow).length === 0) return null;

        const result: (Paragraph | Table)[] = [this.createHeading('５　本時の展開')];

        // ヘッダー行
        const headerRow = new TableRow({
            children: [
                new TableCell({
                    shading: { type: ShadingType.SOLID, color: 'E8E8E8' },
                    children: [new Paragraph({ text: '時間', alignment: AlignmentType.CENTER })],
                }),
                new TableCell({
                    shading: { type: ShadingType.SOLID, color: 'E8E8E8' },
                    children: [new Paragraph({ text: '○学習内容　・学習活動', alignment: AlignmentType.CENTER })],
                }),
                new TableCell({
                    shading: { type: ShadingType.SOLID, color: 'E8E8E8' },
                    children: [new Paragraph({ text: '指導上の留意点', alignment: AlignmentType.CENTER })],
                }),
            ],
        });

        const dataRows = Object.entries(flow).map(([phaseName, phase]) => {
            if (!phase) return null;

            const time = phase.時間 || '';
            const contents = Array.isArray(phase.学習内容) ? phase.学習内容 : [];
            const actions = Array.isArray(phase.学習活動) ? phase.学習活動 : [];
            const notes = Array.isArray(phase.留意点) ? phase.留意点 : [];

            const activitiesParagraphs: Paragraph[] = [];
            contents.filter(c => c).forEach(c => {
                activitiesParagraphs.push(new Paragraph({ text: `○ ${c}` }));
            });
            actions.filter(a => a).forEach(a => {
                activitiesParagraphs.push(new Paragraph({ text: `・ ${a}` }));
            });

            const notesParagraphs = notes.filter(n => n).map(n => new Paragraph({ text: `・ ${n}` }));

            return new TableRow({
                children: [
                    new TableCell({
                        children: [new Paragraph({ text: `${phaseName}\n(${time}分)`, alignment: AlignmentType.CENTER })],
                    }),
                    new TableCell({
                        children: activitiesParagraphs.length > 0 ? activitiesParagraphs : [new Paragraph({ text: '' })],
                    }),
                    new TableCell({
                        children: notesParagraphs.length > 0 ? notesParagraphs : [new Paragraph({ text: '' })],
                    }),
                ],
            });
        }).filter(row => row !== null) as TableRow[];

        result.push(new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: {
                top: { style: BorderStyle.SINGLE, size: 1 },
                bottom: { style: BorderStyle.SINGLE, size: 1 },
                left: { style: BorderStyle.SINGLE, size: 1 },
                right: { style: BorderStyle.SINGLE, size: 1 },
                insideHorizontal: { style: BorderStyle.SINGLE, size: 1 },
                insideVertical: { style: BorderStyle.SINGLE, size: 1 },
            },
            rows: [headerRow, ...dataRows],
        }));

        return result;
    }

    private createEvaluationSection(): (Paragraph | Table)[] | null {
        const evaluations = this.data.評価 || this.data.本時の評価;
        if (!evaluations) return null;

        const result: Paragraph[] = [this.createHeading('６　本時の評価')];

        if (typeof evaluations === 'object' && !Array.isArray(evaluations)) {
            Object.entries(evaluations).forEach(([key, value]) => {
                result.push(new Paragraph({
                    children: [
                        new TextRun({ text: `${key}：`, bold: true }),
                        new TextRun({ text: String(value) }),
                    ],
                    spacing: { before: 50 },
                }));
            });
        } else if (Array.isArray(evaluations)) {
            evaluations.filter(e => e).forEach(e => {
                result.push(new Paragraph({ text: `• ${String(e)}`, spacing: { before: 50 } }));
            });
        }

        return result;
    }
}

/**
 * YAML文字列からWord Blobを生成
 */
export async function generateLessonPlanDocx(yamlContent: string): Promise<Blob> {
    const generator = new LessonPlanDocxGenerator(yamlContent);
    return await generator.generateDocx();
}
