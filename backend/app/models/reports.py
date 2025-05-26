from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum
import uuid

class ReportFormat(str, Enum):
    """Formatos de exportação disponíveis"""
    CSV = "CSV"
    EXCEL = "EXCEL"
    PDF = "PDF"

class ReportStatus(str, Enum):
    """Status do relatório"""
    PENDING = "PENDING"
    PROCESSING = "PROCESSING"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"

class ReportType(str, Enum):
    """Tipos de relatório"""
    OBJECTIVES = "OBJECTIVES"
    KEY_RESULTS = "KEY_RESULTS"
    DASHBOARD = "DASHBOARD"
    COMPLETE = "COMPLETE"

class ReportFilters(BaseModel):
    """Filtros para aplicar na geração do relatório"""
    search: Optional[str] = None
    status: Optional[List[str]] = None
    owner_id: Optional[str] = None
    cycle_id: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    include_key_results: bool = True
    include_checkins: bool = False

class ReportRequest(BaseModel):
    """Solicitação de geração de relatório"""
    name: str = Field(..., min_length=1, max_length=200, description="Nome do relatório")
    report_type: ReportType = Field(..., description="Tipo do relatório")
    format: ReportFormat = Field(..., description="Formato de exportação")
    filters: Optional[ReportFilters] = Field(default_factory=ReportFilters, description="Filtros aplicados")
    include_charts: bool = Field(default=False, description="Incluir gráficos (apenas PDF)")

class ObjectiveReportData(BaseModel):
    """Dados de objetivo para relatório"""
    id: str
    title: str
    description: Optional[str] = None
    owner_name: Optional[str] = None
    cycle_name: str
    status: str
    progress: float
    created_at: datetime
    updated_at: datetime
    key_results_count: int
    key_results_completed: int
    key_results: Optional[List[Dict[str, Any]]] = None

class KeyResultReportData(BaseModel):
    """Dados de Key Result para relatório"""
    id: str
    title: str
    description: Optional[str] = None
    objective_title: str
    owner_name: Optional[str] = None
    target_value: float
    current_value: float
    start_value: float
    unit: str
    status: str
    progress: float
    confidence_level: Optional[float] = None
    created_at: datetime
    updated_at: datetime
    checkins_count: int
    last_checkin_date: Optional[datetime] = None

class DashboardReportData(BaseModel):
    """Dados consolidados do dashboard para relatório"""
    company_name: str
    report_period: str
    generation_date: datetime
    total_objectives: int
    total_key_results: int
    active_users: int
    active_cycle_name: Optional[str] = None
    overall_progress: float
    objectives_by_status: Dict[str, int]
    completion_rate: float
    on_track_rate: float

class ReportMetadata(BaseModel):
    """Metadados do relatório gerado"""
    id: str
    name: str
    report_type: ReportType
    format: ReportFormat
    status: ReportStatus
    file_size: Optional[int] = None
    file_path: Optional[str] = None
    download_url: Optional[str] = None
    filters_applied: Optional[ReportFilters] = None
    records_count: int = 0
    generation_started_at: datetime
    generation_completed_at: Optional[datetime] = None
    expires_at: Optional[datetime] = None
    error_message: Optional[str] = None

class ReportResponse(BaseModel):
    """Resposta da geração de relatório"""
    id: str
    message: str
    status: ReportStatus
    estimated_time: Optional[int] = None  # Em segundos
    download_url: Optional[str] = None

class ReportListResponse(BaseModel):
    """Lista de relatórios do usuário"""
    reports: List[ReportMetadata]
    total: int

class AvailableFormatsResponse(BaseModel):
    """Formatos disponíveis para exportação"""
    formats: List[Dict[str, Any]]

    class Config:
        schema_extra = {
            "example": {
                "formats": [
                    {
                        "format": "CSV",
                        "name": "CSV",
                        "description": "Arquivo CSV separado por vírgulas",
                        "extension": ".csv",
                        "supports_charts": False
                    },
                    {
                        "format": "EXCEL",
                        "name": "Excel",
                        "description": "Planilha do Microsoft Excel",
                        "extension": ".xlsx",
                        "supports_charts": False
                    },
                    {
                        "format": "PDF",
                        "name": "PDF",
                        "description": "Documento PDF com formatação completa",
                        "extension": ".pdf",
                        "supports_charts": True
                    }
                ]
            }
        }

class ReportContent(BaseModel):
    """Conteúdo completo do relatório"""
    metadata: ReportMetadata
    dashboard_data: Optional[DashboardReportData] = None
    objectives: Optional[List[ObjectiveReportData]] = None
    key_results: Optional[List[KeyResultReportData]] = None 