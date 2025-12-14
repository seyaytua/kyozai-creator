/**
 * 教材作成API クライアント（静的サイト版）
 * TypeScript generatorを使用してローカルでHTML生成
 */

import {
    generateExamHtml as examGenerator,
    generateWorksheetHtml as worksheetGenerator,
    generateLessonPlanHtml as lessonPlanGenerator
} from '../generators';

export interface GenerateResponse {
    html: string;
    success: boolean;
    error?: string;
}

/**
 * YAMLコンテンツからテスト(定期考査)HTMLを生成
 */
export async function generateExamHtml(yamlContent: string): Promise<GenerateResponse> {
    try {
        const html = examGenerator(yamlContent);
        return {
            html,
            success: true,
        };
    } catch (error) {
        return {
            html: '',
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        };
    }
}

/**
 * YAMLコンテンツからプリント(ワークシート)HTMLを生成
 */
export async function generateWorksheetHtml(yamlContent: string): Promise<GenerateResponse> {
    try {
        const html = worksheetGenerator(yamlContent);
        return {
            html,
            success: true,
        };
    } catch (error) {
        return {
            html: '',
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        };
    }
}

/**
 * YAMLコンテンツから指導案HTMLを生成
 */
export async function generateLessonPlanHtml(yamlContent: string): Promise<GenerateResponse> {
    try {
        const html = lessonPlanGenerator(yamlContent);
        return {
            html,
            success: true,
        };
    } catch (error) {
        return {
            html: '',
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        };
    }
}

export interface DocxResponse {
    docx_base64: string;
    success: boolean;
    error?: string;
}

/**
 * YAMLコンテンツから指導案Word文書を生成
 * TODO: docxライブラリを使って実装
 */
export async function generateLessonPlanDocx(_yamlContent: string): Promise<DocxResponse> {
    return {
        docx_base64: '',
        success: false,
        error: 'Word出力機能は現在準備中です。HTML出力をご利用ください。',
    };
}

/**
 * APIサーバーのヘルスチェック
 * 静的サイト版では常にtrueを返す
 */
export async function checkApiHealth(): Promise<boolean> {
    return true;
}
