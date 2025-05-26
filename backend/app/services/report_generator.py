import csv
import io
import os
import tempfile
from datetime import datetime
from typing import List, Dict, Any, Optional
from uuid import uuid4

try:
    import pandas as pd
    PANDAS_AVAILABLE = True
except ImportError:
    PANDAS_AVAILABLE = False

try:
    from reportlab.lib.pagesizes import letter, A4
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib.units import inch
    from reportlab.lib import colors
    from reportlab.lib.enums import TA_CENTER, TA_LEFT
    REPORTLAB_AVAILABLE = True
except ImportError:
    REPORTLAB_AVAILABLE = False

from ..models.reports import (
    ReportFormat, ReportContent, ObjectiveReportData, 
    KeyResultReportData, DashboardReportData
)

class ReportGenerator:
    """Gerador de relatórios em múltiplos formatos"""
    
    def __init__(self, output_dir: str = None):
        """
        Inicializar gerador de relatórios
        
        Args:
            output_dir: Diretório para salvar arquivos gerados
        """
        self.output_dir = output_dir or tempfile.gettempdir()
        
    def generate_report(self, content: ReportContent, format: ReportFormat) -> str:
        """
        Gerar relatório no formato especificado
        
        Args:
            content: Conteúdo do relatório
            format: Formato de saída
            
        Returns:
            Caminho do arquivo gerado
        """
        file_id = str(uuid4())
        
        if format == ReportFormat.CSV:
            return self._generate_csv(content, file_id)
        elif format == ReportFormat.EXCEL:
            return self._generate_excel(content, file_id)
        elif format == ReportFormat.PDF:
            return self._generate_pdf(content, file_id)
        else:
            raise ValueError(f"Formato não suportado: {format}")
    
    def _generate_csv(self, content: ReportContent, file_id: str) -> str:
        """Gerar relatório CSV"""
        filename = f"relatorio_{file_id}.csv"
        filepath = os.path.join(self.output_dir, filename)
        
        with open(filepath, 'w', newline='', encoding='utf-8') as csvfile:
            if content.metadata.report_type == "OBJECTIVES" and content.objectives:
                self._write_objectives_csv(csvfile, content.objectives)
            elif content.metadata.report_type == "KEY_RESULTS" and content.key_results:
                self._write_key_results_csv(csvfile, content.key_results)
            elif content.metadata.report_type == "COMPLETE":
                self._write_complete_csv(csvfile, content)
            else:
                # Dashboard ou tipo padrão
                self._write_dashboard_csv(csvfile, content)
        
        return filepath
    
    def _write_objectives_csv(self, csvfile, objectives: List[ObjectiveReportData]):
        """Escrever objetivos em CSV"""
        writer = csv.writer(csvfile, delimiter=';')
        
        # Cabeçalho
        headers = [
            'ID', 'Título', 'Descrição', 'Responsável', 'Ciclo', 
            'Status', 'Progresso (%)', 'Key Results Total', 'Key Results Concluídos',
            'Data Criação', 'Última Atualização'
        ]
        writer.writerow(headers)
        
        # Dados
        for obj in objectives:
            writer.writerow([
                obj.id,
                obj.title,
                obj.description or '',
                obj.owner_name or 'Não atribuído',
                obj.cycle_name,
                obj.status,
                f"{obj.progress:.1f}%",
                obj.key_results_count,
                obj.key_results_completed,
                obj.created_at.strftime('%d/%m/%Y %H:%M'),
                obj.updated_at.strftime('%d/%m/%Y %H:%M')
            ])
    
    def _write_key_results_csv(self, csvfile, key_results: List[KeyResultReportData]):
        """Escrever Key Results em CSV"""
        writer = csv.writer(csvfile, delimiter=';')
        
        # Cabeçalho
        headers = [
            'ID', 'Título', 'Descrição', 'Objetivo', 'Responsável',
            'Valor Inicial', 'Valor Atual', 'Valor Meta', 'Unidade',
            'Status', 'Progresso (%)', 'Confiança', 'Check-ins',
            'Último Check-in', 'Data Criação'
        ]
        writer.writerow(headers)
        
        # Dados
        for kr in key_results:
            writer.writerow([
                kr.id,
                kr.title,
                kr.description or '',
                kr.objective_title,
                kr.owner_name or 'Não atribuído',
                f"{kr.start_value:.2f}",
                f"{kr.current_value:.2f}",
                f"{kr.target_value:.2f}",
                kr.unit,
                kr.status,
                f"{kr.progress:.1f}%",
                f"{(kr.confidence_level or 0) * 100:.0f}%" if kr.confidence_level else '',
                kr.checkins_count,
                kr.last_checkin_date.strftime('%d/%m/%Y') if kr.last_checkin_date else 'Nunca',
                kr.created_at.strftime('%d/%m/%Y %H:%M')
            ])
    
    def _write_complete_csv(self, csvfile, content: ReportContent):
        """Escrever relatório completo em CSV"""
        writer = csv.writer(csvfile, delimiter=';')
        
        # Cabeçalho do relatório
        if content.dashboard_data:
            writer.writerow(['RELATÓRIO COMPLETO OKR'])
            writer.writerow(['Empresa:', content.dashboard_data.company_name])
            writer.writerow(['Período:', content.dashboard_data.report_period])
            writer.writerow(['Gerado em:', content.dashboard_data.generation_date.strftime('%d/%m/%Y %H:%M')])
            writer.writerow([])
            
            # Resumo executivo
            writer.writerow(['RESUMO EXECUTIVO'])
            writer.writerow(['Total de Objetivos:', content.dashboard_data.total_objectives])
            writer.writerow(['Total de Key Results:', content.dashboard_data.total_key_results])
            writer.writerow(['Usuários Ativos:', content.dashboard_data.active_users])
            writer.writerow(['Progresso Geral:', f"{content.dashboard_data.overall_progress:.1f}%"])
            writer.writerow(['Taxa de Conclusão:', f"{content.dashboard_data.completion_rate:.1f}%"])
            writer.writerow([])
        
        # Objetivos
        if content.objectives:
            writer.writerow(['OBJETIVOS'])
            self._write_objectives_csv(io.StringIO(), content.objectives)
            writer.writerow([])
        
        # Key Results
        if content.key_results:
            writer.writerow(['KEY RESULTS'])
            self._write_key_results_csv(io.StringIO(), content.key_results)
    
    def _write_dashboard_csv(self, csvfile, content: ReportContent):
        """Escrever dados do dashboard em CSV"""
        writer = csv.writer(csvfile, delimiter=';')
        
        if content.dashboard_data:
            data = content.dashboard_data
            writer.writerow(['DASHBOARD - RESUMO EXECUTIVO'])
            writer.writerow(['Empresa', data.company_name])
            writer.writerow(['Período', data.report_period])
            writer.writerow(['Total Objetivos', data.total_objectives])
            writer.writerow(['Total Key Results', data.total_key_results])
            writer.writerow(['Usuários Ativos', data.active_users])
            writer.writerow(['Progresso Geral (%)', f"{data.overall_progress:.1f}"])
            writer.writerow(['Taxa Conclusão (%)', f"{data.completion_rate:.1f}"])
            writer.writerow(['Taxa No Prazo (%)', f"{data.on_track_rate:.1f}"])
            
            # Objetivos por status
            writer.writerow([])
            writer.writerow(['OBJETIVOS POR STATUS'])
            for status, count in data.objectives_by_status.items():
                writer.writerow([status, count])
    
    def _generate_excel(self, content: ReportContent, file_id: str) -> str:
        """Gerar relatório Excel"""
        if not PANDAS_AVAILABLE:
            raise ValueError("Pandas não disponível para geração de Excel")
        
        filename = f"relatorio_{file_id}.xlsx"
        filepath = os.path.join(self.output_dir, filename)
        
        with pd.ExcelWriter(filepath, engine='openpyxl') as writer:
            # Dashboard
            if content.dashboard_data:
                self._write_dashboard_excel(writer, content.dashboard_data)
            
            # Objetivos
            if content.objectives:
                self._write_objectives_excel(writer, content.objectives)
            
            # Key Results
            if content.key_results:
                self._write_key_results_excel(writer, content.key_results)
        
        return filepath
    
    def _write_dashboard_excel(self, writer, dashboard_data: DashboardReportData):
        """Escrever dashboard no Excel"""
        # Resumo executivo
        summary_data = {
            'Métrica': ['Empresa', 'Período', 'Total Objetivos', 'Total Key Results', 
                       'Usuários Ativos', 'Progresso Geral (%)', 'Taxa Conclusão (%)', 'Taxa No Prazo (%)'],
            'Valor': [
                dashboard_data.company_name,
                dashboard_data.report_period,
                dashboard_data.total_objectives,
                dashboard_data.total_key_results,
                dashboard_data.active_users,
                f"{dashboard_data.overall_progress:.1f}",
                f"{dashboard_data.completion_rate:.1f}",
                f"{dashboard_data.on_track_rate:.1f}"
            ]
        }
        
        df_summary = pd.DataFrame(summary_data)
        df_summary.to_excel(writer, sheet_name='Resumo', index=False)
        
        # Objetivos por status
        status_data = {
            'Status': list(dashboard_data.objectives_by_status.keys()),
            'Quantidade': list(dashboard_data.objectives_by_status.values())
        }
        
        df_status = pd.DataFrame(status_data)
        df_status.to_excel(writer, sheet_name='Status', index=False)
    
    def _write_objectives_excel(self, writer, objectives: List[ObjectiveReportData]):
        """Escrever objetivos no Excel"""
        data = []
        for obj in objectives:
            data.append({
                'ID': obj.id,
                'Título': obj.title,
                'Descrição': obj.description or '',
                'Responsável': obj.owner_name or 'Não atribuído',
                'Ciclo': obj.cycle_name,
                'Status': obj.status,
                'Progresso (%)': f"{obj.progress:.1f}",
                'Key Results Total': obj.key_results_count,
                'Key Results Concluídos': obj.key_results_completed,
                'Data Criação': obj.created_at.strftime('%d/%m/%Y %H:%M'),
                'Última Atualização': obj.updated_at.strftime('%d/%m/%Y %H:%M')
            })
        
        df = pd.DataFrame(data)
        df.to_excel(writer, sheet_name='Objetivos', index=False)
    
    def _write_key_results_excel(self, writer, key_results: List[KeyResultReportData]):
        """Escrever Key Results no Excel"""
        data = []
        for kr in key_results:
            data.append({
                'ID': kr.id,
                'Título': kr.title,
                'Descrição': kr.description or '',
                'Objetivo': kr.objective_title,
                'Responsável': kr.owner_name or 'Não atribuído',
                'Valor Inicial': f"{kr.start_value:.2f}",
                'Valor Atual': f"{kr.current_value:.2f}",
                'Valor Meta': f"{kr.target_value:.2f}",
                'Unidade': kr.unit,
                'Status': kr.status,
                'Progresso (%)': f"{kr.progress:.1f}",
                'Confiança (%)': f"{(kr.confidence_level or 0) * 100:.0f}" if kr.confidence_level else '',
                'Check-ins': kr.checkins_count,
                'Último Check-in': kr.last_checkin_date.strftime('%d/%m/%Y') if kr.last_checkin_date else 'Nunca',
                'Data Criação': kr.created_at.strftime('%d/%m/%Y %H:%M')
            })
        
        df = pd.DataFrame(data)
        df.to_excel(writer, sheet_name='Key Results', index=False)
    
    def _generate_pdf(self, content: ReportContent, file_id: str) -> str:
        """Gerar relatório PDF"""
        if not REPORTLAB_AVAILABLE:
            raise ValueError("ReportLab não disponível para geração de PDF")
        
        filename = f"relatorio_{file_id}.pdf"
        filepath = os.path.join(self.output_dir, filename)
        
        doc = SimpleDocTemplate(filepath, pagesize=A4)
        styles = getSampleStyleSheet()
        story = []
        
        # Título
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontSize=18,
            spaceAfter=30,
            alignment=TA_CENTER
        )
        
        story.append(Paragraph("Relatório OKR", title_style))
        
        # Informações do relatório
        if content.dashboard_data:
            story.append(Paragraph(f"<b>Empresa:</b> {content.dashboard_data.company_name}", styles['Normal']))
            story.append(Paragraph(f"<b>Período:</b> {content.dashboard_data.report_period}", styles['Normal']))
            story.append(Paragraph(f"<b>Gerado em:</b> {content.dashboard_data.generation_date.strftime('%d/%m/%Y às %H:%M')}", styles['Normal']))
            story.append(Spacer(1, 20))
            
            # Resumo executivo
            story.append(Paragraph("Resumo Executivo", styles['Heading2']))
            
            summary_data = [
                ['Métrica', 'Valor'],
                ['Total de Objetivos', str(content.dashboard_data.total_objectives)],
                ['Total de Key Results', str(content.dashboard_data.total_key_results)],
                ['Usuários Ativos', str(content.dashboard_data.active_users)],
                ['Progresso Geral', f"{content.dashboard_data.overall_progress:.1f}%"],
                ['Taxa de Conclusão', f"{content.dashboard_data.completion_rate:.1f}%"],
                ['Taxa No Prazo', f"{content.dashboard_data.on_track_rate:.1f}%"]
            ]
            
            summary_table = Table(summary_data)
            summary_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, 0), 12),
                ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
                ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
                ('GRID', (0, 0), (-1, -1), 1, colors.black)
            ]))
            
            story.append(summary_table)
            story.append(Spacer(1, 20))
        
        # Objetivos
        if content.objectives:
            story.append(Paragraph("Objetivos", styles['Heading2']))
            
            for obj in content.objectives[:5]:  # Limitamos a 5 para não ficar muito longo
                story.append(Paragraph(f"<b>{obj.title}</b>", styles['Heading3']))
                story.append(Paragraph(f"Responsável: {obj.owner_name or 'Não atribuído'}", styles['Normal']))
                story.append(Paragraph(f"Status: {obj.status} | Progresso: {obj.progress:.1f}%", styles['Normal']))
                story.append(Paragraph(f"Key Results: {obj.key_results_completed}/{obj.key_results_count} concluídos", styles['Normal']))
                if obj.description:
                    story.append(Paragraph(f"Descrição: {obj.description}", styles['Normal']))
                story.append(Spacer(1, 10))
        
        # Build PDF
        doc.build(story)
        
        return filepath
    
    def get_file_size(self, filepath: str) -> int:
        """Obter tamanho do arquivo em bytes"""
        try:
            return os.path.getsize(filepath)
        except OSError:
            return 0
    
    def cleanup_file(self, filepath: str) -> bool:
        """Limpar arquivo temporário"""
        try:
            if os.path.exists(filepath):
                os.remove(filepath)
                return True
            return False
        except OSError:
            return False 