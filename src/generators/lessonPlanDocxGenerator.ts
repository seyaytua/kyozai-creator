/**
 * 指導案Word出力ジェネレーター（改良版）
 * YAMLコンテンツからWord形式の指導案を生成する
 * Python版と同等の品質を目指す
 */

import yaml from 'js-yaml';
import {
    Document,
    Paragraph,
    Table,
    TableRow,
    TableCell,
    TextRun,
    WidthType,
    AlignmentType,
    BorderStyle,
    Packer,
    ShadingType,
    convertInchesToTwip,
    PageOrientation,
    TableLayoutType,
    VerticalAlign,
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

// 共通のテーブルスタイル
const tableBorders = {
    top: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
    bottom: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
    left: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
    right: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
    insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
    insideVertical: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
};

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
                children: [
                    new TextRun({
                        text: `${subject}科 学習指導案`,
                        bold: true,
                        size: 36, // 18pt
                    }),
                ],
                alignment: AlignmentType.CENTER,
                spacing: { after: 400 },
                border: {
                    bottom: { style: BorderStyle.DOUBLE, size: 6, color: '000000' },
                },
            })
        );

        children.push(new Paragraph({ text: '' }));

        // ヘッダー表
        children.push(this.createHeaderTable());
        children.push(new Paragraph({ text: '' }));

        // 単元名
        children.push(this.createSectionHeading('１　単元名'));
        children.push(
            new Paragraph({
                children: [
                    new TextRun({ text: d.単元名 || '', bold: true, size: 24 }),
                    new TextRun({ text: d.使用教科書 ? `（${d.使用教科書}）` : '', size: 24 }),
                ],
                spacing: { after: 200 },
            })
        );

        // 生徒の実態
        const studentSection = this.createBulletSection('２　生徒の実態', d.生徒の実態);
        if (studentSection) children.push(...studentSection);

        // 本時の目標
        const goals = d.本時の目標 || d.目標 || [];
        const goalsSection = this.createBulletSection('３　本時の目標', Array.isArray(goals) ? goals : []);
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
            children.push(this.createSectionHeading('７　板書計画'));
            children.push(new Paragraph({
                text: d.板書計画,
                spacing: { after: 200 },
            }));
        }

        // デジタル教科書活用
        const digitalSection = this.createBulletSection('８　デジタル教科書活用', d.デジタル教科書活用);
        if (digitalSection) children.push(...digitalSection);

        // 配慮事項
        const considerationsSection = this.createBulletSection('９　配慮事項', d.配慮事項);
        if (considerationsSection) children.push(...considerationsSection);

        return new Document({
            sections: [{
                properties: {
                    page: {
                        size: {
                            orientation: PageOrientation.PORTRAIT,
                            width: convertInchesToTwip(8.27), // A4 width
                            height: convertInchesToTwip(11.69), // A4 height
                        },
                        margin: {
                            top: convertInchesToTwip(1),
                            bottom: convertInchesToTwip(1),
                            left: convertInchesToTwip(1),
                            right: convertInchesToTwip(1),
                        },
                    },
                },
                children,
            }],
        });
    }

    private createSectionHeading(text: string): Paragraph {
        return new Paragraph({
            children: [
                new TextRun({
                    text,
                    bold: true,
                    size: 26, // 13pt
                }),
            ],
            spacing: { before: 300, after: 150 },
            shading: {
                type: ShadingType.SOLID,
                color: 'F0F8FF',
            },
            border: {
                left: { style: BorderStyle.SINGLE, size: 24, color: '3B82F6' },
            },
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
            borders: tableBorders,
            rows: rows.map(([label, value]) =>
                new TableRow({
                    children: [
                        new TableCell({
                            width: { size: 15, type: WidthType.PERCENTAGE },
                            shading: { type: ShadingType.SOLID, color: 'F5F5F5' },
                            verticalAlign: VerticalAlign.CENTER,
                            children: [new Paragraph({
                                children: [new TextRun({ text: label, size: 22 })],
                                alignment: AlignmentType.CENTER,
                            })],
                        }),
                        new TableCell({
                            width: { size: 85, type: WidthType.PERCENTAGE },
                            verticalAlign: VerticalAlign.CENTER,
                            children: [new Paragraph({
                                children: [new TextRun({ text: value, size: 22 })],
                            })],
                        }),
                    ],
                })
            ),
        });
    }

    private createBulletSection(title: string, items?: string[]): (Paragraph | Table)[] | null {
        if (!items || !Array.isArray(items) || items.length === 0) {
            return null;
        }

        const validItems = items.filter(i => i);
        if (validItems.length === 0) return null;

        const result: Paragraph[] = [this.createSectionHeading(title)];
        validItems.forEach(item => {
            result.push(new Paragraph({
                children: [new TextRun({ text: `• ${item}`, size: 22 })],
                spacing: { before: 60, after: 60 },
                indent: { left: convertInchesToTwip(0.25) },
            }));
        });

        return result;
    }

    private createMaterialsSection(): (Paragraph | Table)[] | null {
        const materials = this.data.準備物;
        if (!materials) return null;

        const teacherItems = Array.isArray(materials.教師) ? materials.教師.filter(i => i) : [];
        const studentItems = Array.isArray(materials.生徒) ? materials.生徒.filter(i => i) : [];

        if (teacherItems.length === 0 && studentItems.length === 0) return null;

        const result: (Paragraph | Table)[] = [this.createSectionHeading('４　準備物')];

        // 準備物を表形式で表示
        const rows: TableRow[] = [];

        // ヘッダー行
        rows.push(new TableRow({
            children: [
                new TableCell({
                    width: { size: 50, type: WidthType.PERCENTAGE },
                    shading: { type: ShadingType.SOLID, color: 'E8E8E8' },
                    children: [new Paragraph({
                        children: [new TextRun({ text: '【教師】', bold: true, size: 22 })],
                        alignment: AlignmentType.CENTER,
                    })],
                }),
                new TableCell({
                    width: { size: 50, type: WidthType.PERCENTAGE },
                    shading: { type: ShadingType.SOLID, color: 'E8E8E8' },
                    children: [new Paragraph({
                        children: [new TextRun({ text: '【生徒】', bold: true, size: 22 })],
                        alignment: AlignmentType.CENTER,
                    })],
                }),
            ],
        }));

        // 内容行
        const maxLen = Math.max(teacherItems.length, studentItems.length);
        for (let i = 0; i < maxLen; i++) {
            rows.push(new TableRow({
                children: [
                    new TableCell({
                        children: [new Paragraph({
                            children: [new TextRun({ text: teacherItems[i] ? `• ${teacherItems[i]}` : '', size: 22 })],
                        })],
                    }),
                    new TableCell({
                        children: [new Paragraph({
                            children: [new TextRun({ text: studentItems[i] ? `• ${studentItems[i]}` : '', size: 22 })],
                        })],
                    }),
                ],
            }));
        }

        result.push(new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: tableBorders,
            rows,
        }));

        return result;
    }

    private createFlowSection(): (Paragraph | Table)[] | null {
        const flow = this.data.展開 || this.data.授業展開 || {};
        if (Object.keys(flow).length === 0) return null;

        const result: (Paragraph | Table)[] = [this.createSectionHeading('５　本時の展開')];

        // ヘッダー行
        const headerRow = new TableRow({
            children: [
                new TableCell({
                    width: { size: 12, type: WidthType.PERCENTAGE },
                    shading: { type: ShadingType.SOLID, color: 'E8E8E8' },
                    verticalAlign: VerticalAlign.CENTER,
                    children: [new Paragraph({
                        children: [new TextRun({ text: '時間', bold: true, size: 22 })],
                        alignment: AlignmentType.CENTER,
                    })],
                }),
                new TableCell({
                    width: { size: 50, type: WidthType.PERCENTAGE },
                    shading: { type: ShadingType.SOLID, color: 'E8E8E8' },
                    verticalAlign: VerticalAlign.CENTER,
                    children: [new Paragraph({
                        children: [new TextRun({ text: '○学習内容　・学習活動', bold: true, size: 22 })],
                        alignment: AlignmentType.CENTER,
                    })],
                }),
                new TableCell({
                    width: { size: 38, type: WidthType.PERCENTAGE },
                    shading: { type: ShadingType.SOLID, color: 'E8E8E8' },
                    verticalAlign: VerticalAlign.CENTER,
                    children: [new Paragraph({
                        children: [new TextRun({ text: '指導上の留意点', bold: true, size: 22 })],
                        alignment: AlignmentType.CENTER,
                    })],
                }),
            ],
        });

        const dataRows = Object.entries(flow).map(([phaseName, phase]) => {
            if (!phase) return null;

            const time = phase.時間 || '';
            const contents = Array.isArray(phase.学習内容) ? phase.学習内容.filter(c => c) : [];
            const actions = Array.isArray(phase.学習活動) ? phase.学習活動.filter(a => a) : [];
            const notes = Array.isArray(phase.留意点) ? phase.留意点.filter(n => n) : [];

            // 学習内容・活動を結合
            const activitiesParagraphs: Paragraph[] = [];
            contents.forEach(c => {
                activitiesParagraphs.push(new Paragraph({
                    children: [new TextRun({ text: `○ ${c}`, size: 21 })],
                    spacing: { after: 40 },
                }));
            });
            actions.forEach(a => {
                activitiesParagraphs.push(new Paragraph({
                    children: [new TextRun({ text: `・ ${a}`, size: 21 })],
                    spacing: { after: 40 },
                    indent: { left: convertInchesToTwip(0.15) },
                }));
            });

            // 留意点
            const notesParagraphs = notes.map(n => new Paragraph({
                children: [new TextRun({ text: `・ ${n}`, size: 21 })],
                spacing: { after: 40 },
            }));

            return new TableRow({
                children: [
                    new TableCell({
                        verticalAlign: VerticalAlign.CENTER,
                        children: [
                            new Paragraph({
                                children: [new TextRun({ text: phaseName, bold: true, size: 21 })],
                                alignment: AlignmentType.CENTER,
                            }),
                            new Paragraph({
                                children: [new TextRun({ text: `(${time}分)`, size: 20 })],
                                alignment: AlignmentType.CENTER,
                            }),
                        ],
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
            layout: TableLayoutType.FIXED,
            borders: tableBorders,
            rows: [headerRow, ...dataRows],
        }));

        return result;
    }

    private createEvaluationSection(): (Paragraph | Table)[] | null {
        const evaluations = this.data.評価 || this.data.本時の評価;
        if (!evaluations) return null;

        const result: Paragraph[] = [this.createSectionHeading('６　本時の評価')];

        if (typeof evaluations === 'object' && !Array.isArray(evaluations)) {
            // オブジェクト形式（3観点）
            Object.entries(evaluations).forEach(([key, value]) => {
                result.push(new Paragraph({
                    children: [
                        new TextRun({ text: `【${key}】`, bold: true, size: 22 }),
                    ],
                    spacing: { before: 100 },
                }));
                result.push(new Paragraph({
                    children: [
                        new TextRun({ text: String(value), size: 22 }),
                    ],
                    spacing: { after: 100 },
                    indent: { left: convertInchesToTwip(0.25) },
                }));
            });
        } else if (Array.isArray(evaluations)) {
            evaluations.filter(e => e).forEach(e => {
                result.push(new Paragraph({
                    children: [new TextRun({ text: `• ${String(e)}`, size: 22 })],
                    spacing: { before: 60, after: 60 },
                    indent: { left: convertInchesToTwip(0.25) },
                }));
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
