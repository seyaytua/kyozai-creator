#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
教材作成API サーバー
React アプリからのリクエストを処理し、HTML/Word を生成する
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn

from exam_generator import generate_exam_html
from worksheet_generator import generate_worksheet_html
from lesson_plan_generator import generate_lesson_plan_html, generate_lesson_plan_docx_base64

app = FastAPI(
    title="教材作成API",
    description="YAMLからHTML/Word教材を生成するAPI",
    version="1.0.0"
)

# CORS設定（開発用）
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174", "tauri://localhost"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class GenerateRequest(BaseModel):
    yaml_content: str


class GenerateResponse(BaseModel):
    html: str
    success: bool
    error: str | None = None


class DocxResponse(BaseModel):
    docx_base64: str
    success: bool
    error: str | None = None


@app.get("/")
async def root():
    return {"message": "教材作成API", "status": "running"}


@app.get("/health")
async def health_check():
    return {"status": "healthy"}


# ========== テスト（定期考査）API ==========

@app.post("/api/exam/generate", response_model=GenerateResponse)
async def generate_exam(request: GenerateRequest):
    """YAMLコンテンツからHTML定期考査を生成"""
    try:
        html = generate_exam_html(request.yaml_content)
        return GenerateResponse(html=html, success=True)
    except Exception as e:
        return GenerateResponse(html="", success=False, error=str(e))


# ========== プリント（ワークシート）API ==========

@app.post("/api/worksheet/generate", response_model=GenerateResponse)
async def generate_worksheet(request: GenerateRequest):
    """YAMLコンテンツからHTMLプリントを生成"""
    try:
        html = generate_worksheet_html(request.yaml_content)
        return GenerateResponse(html=html, success=True)
    except Exception as e:
        return GenerateResponse(html="", success=False, error=str(e))


# ========== 指導案 API ==========

@app.post("/api/lesson-plan/generate", response_model=GenerateResponse)
async def generate_lesson_plan(request: GenerateRequest):
    """YAMLコンテンツからHTML指導案を生成"""
    try:
        html = generate_lesson_plan_html(request.yaml_content)
        return GenerateResponse(html=html, success=True)
    except Exception as e:
        return GenerateResponse(html="", success=False, error=str(e))


@app.post("/api/lesson-plan/generate-docx", response_model=DocxResponse)
async def generate_lesson_plan_docx(request: GenerateRequest):
    """YAMLコンテンツからWord指導案を生成"""
    try:
        docx_base64 = generate_lesson_plan_docx_base64(request.yaml_content)
        return DocxResponse(docx_base64=docx_base64, success=True)
    except Exception as e:
        return DocxResponse(docx_base64="", success=False, error=str(e))


if __name__ == "__main__":
    print("🚀 教材作成APIサーバーを起動中...")
    print("📍 http://localhost:8000")
    print("📚 ドキュメント: http://localhost:8000/docs")
    uvicorn.run("server:app", host="0.0.0.0", port=8000, reload=True)



