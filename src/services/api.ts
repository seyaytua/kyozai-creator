/**
 * 教材作成API クライアント（静的サイト版）
 * TypeScript generatorを使用してローカルでHTML生成
 */

import {
    generateExamHtml as examGenerator,
    generateWorksheetHtml as worksheetGenerator,
    generateLessonPlanHtml as lessonPlanGenerator,
    generateLessonPlanDocx as lessonPlanDocxGenerator
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
    blob?: Blob;
    success: boolean;
    error?: string;
}

/**
 * YAMLコンテンツから指導案Word文書を生成
 */
export async function generateLessonPlanDocx(yamlContent: string): Promise<DocxResponse> {
    try {
        const blob = await lessonPlanDocxGenerator(yamlContent);
        return {
            blob,
            success: true,
        };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        };
    }
}

/**
 * APIサーバーのヘルスチェック
 * 静的サイト版では常にtrueを返す
 */
export async function checkApiHealth(): Promise<boolean> {
    return true;
}

