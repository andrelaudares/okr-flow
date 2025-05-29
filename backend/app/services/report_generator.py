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
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
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
        """Gerar relatório PDF profissional e bem estruturado"""
        if not REPORTLAB_AVAILABLE:
            raise ValueError("ReportLab não disponível para geração de PDF")
        
        filename = f"relatorio_{file_id}.pdf"
        filepath = os.path.join(self.output_dir, filename)
        
        doc = SimpleDocTemplate(
            filepath, 
            pagesize=A4,
            rightMargin=72,
            leftMargin=72,
            topMargin=72,
            bottomMargin=18
        )
        
        styles = getSampleStyleSheet()
        story = []
        
        # Estilos customizados
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontSize=24,
            spaceAfter=30,
            alignment=TA_CENTER,
            textColor=colors.HexColor('#1f2937')
        )
        
        subtitle_style = ParagraphStyle(
            'CustomSubtitle',
            parent=styles['Heading2'],
            fontSize=16,
            spaceAfter=20,
            spaceBefore=20,
            textColor=colors.HexColor('#374151'),
            borderWidth=1,
            borderColor=colors.HexColor('#e5e7eb'),
            borderPadding=10,
            backColor=colors.HexColor('#f9fafb')
        )
        
        section_style = ParagraphStyle(
            'SectionHeader',
            parent=styles['Heading3'],
            fontSize=14,
            spaceAfter=12,
            spaceBefore=16,
            textColor=colors.HexColor('#4f46e5'),
            borderWidth=0,
            borderColor=colors.HexColor('#4f46e5'),
            leftIndent=0
        )
        
        info_style = ParagraphStyle(
            'InfoText',
            parent=styles['Normal'],
            fontSize=10,
            textColor=colors.HexColor('#6b7280'),
            spaceAfter=6
        )
        
        normal_style = ParagraphStyle(
            'NormalText',
            parent=styles['Normal'],
            fontSize=10,
            textColor=colors.HexColor('#4b5563'),
            spaceAfter=6
        )
        
        # Cabeçalho do relatório
        story.append(Paragraph("📊 Relatório OKR", title_style))
        
        if content.dashboard_data:
            # Informações básicas em uma tabela elegante
            info_data = [
                ['🏢 Empresa', content.dashboard_data.company_name],
                ['📅 Período', content.dashboard_data.report_period],
                ['🕒 Gerado em', content.dashboard_data.generation_date.strftime('%d/%m/%Y às %H:%M')],
                ['👥 Usuários Ativos', str(content.dashboard_data.active_users)],
                ['🎯 Ciclo Ativo', content.dashboard_data.active_cycle_name or 'Nenhum ciclo ativo']
            ]
            
            info_table = Table(info_data, colWidths=[2*inch, 3*inch])
            info_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#f8fafc')),
                ('TEXTCOLOR', (0, 0), (0, -1), colors.HexColor('#374151')),
                ('TEXTCOLOR', (1, 0), (1, -1), colors.HexColor('#1f2937')),
                ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
                ('FONTNAME', (1, 0), (1, -1), 'Helvetica'),
                ('FONTSIZE', (0, 0), (-1, -1), 11),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
                ('TOPPADDING', (0, 0), (-1, -1), 8),
                ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#e5e7eb')),
                ('VALIGN', (0, 0), (-1, -1), 'MIDDLE')
            ]))
            
            story.append(info_table)
            story.append(Spacer(1, 30))
            
            # Resumo Executivo com métricas destacadas
            story.append(Paragraph("📈 Resumo Executivo", subtitle_style))
            
            # Métricas principais em cards
            metrics_data = [
                ['Métrica', 'Valor', 'Status'],
                [
                    '🎯 Total de Objetivos', 
                    str(content.dashboard_data.total_objectives),
                    '✅' if content.dashboard_data.total_objectives > 0 else '⚠️'
                ],
                [
                    '🔑 Total de Key Results', 
                    str(content.dashboard_data.total_key_results),
                    '✅' if content.dashboard_data.total_key_results > 0 else '⚠️'
                ],
                [
                    '📊 Progresso Geral', 
                    f"{content.dashboard_data.overall_progress:.1f}%",
                    '🟢' if content.dashboard_data.overall_progress >= 70 else '🟡' if content.dashboard_data.overall_progress >= 40 else '🔴'
                ],
                [
                    '✅ Taxa de Conclusão', 
                    f"{content.dashboard_data.completion_rate:.1f}%",
                    '🟢' if content.dashboard_data.completion_rate >= 80 else '🟡' if content.dashboard_data.completion_rate >= 50 else '🔴'
                ],
                [
                    '⏰ Taxa No Prazo', 
                    f"{content.dashboard_data.on_track_rate:.1f}%",
                    '🟢' if content.dashboard_data.on_track_rate >= 80 else '🟡' if content.dashboard_data.on_track_rate >= 50 else '🔴'
                ]
            ]
            
            metrics_table = Table(metrics_data, colWidths=[2.5*inch, 1.5*inch, 1*inch])
            metrics_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#4f46e5')),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                ('ALIGN', (1, 1), (1, -1), 'CENTER'),
                ('ALIGN', (2, 1), (2, -1), 'CENTER'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
                ('FONTSIZE', (0, 0), (-1, 0), 12),
                ('FONTSIZE', (0, 1), (-1, -1), 11),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 10),
                ('TOPPADDING', (0, 0), (-1, -1), 10),
                ('BACKGROUND', (0, 1), (-1, -1), colors.white),
                ('GRID', (0, 0), (-1, -1), 1, colors.HexColor('#e5e7eb')),
                ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
                ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f8fafc')])
            ]))
            
            story.append(metrics_table)
            story.append(Spacer(1, 20))
            
            # Distribuição por Status
            if content.dashboard_data.objectives_by_status:
                story.append(Paragraph("📋 Distribuição de Objetivos por Status", section_style))
                
                status_data = [['Status', 'Quantidade', 'Percentual']]
                total_objectives = content.dashboard_data.total_objectives
                
                status_icons = {
                    'PLANNED': '📋',
                    'ON_TRACK': '🟢',
                    'AT_RISK': '🟡',
                    'BEHIND': '🔴',
                    'COMPLETED': '✅'
                }
                
                status_names = {
                    'PLANNED': 'Planejado',
                    'ON_TRACK': 'No Prazo',
                    'AT_RISK': 'Em Risco',
                    'BEHIND': 'Atrasado',
                    'COMPLETED': 'Concluído'
                }
                
                for status, count in content.dashboard_data.objectives_by_status.items():
                    percentage = (count / total_objectives * 100) if total_objectives > 0 else 0
                    icon = status_icons.get(status, '📌')
                    name = status_names.get(status, status)
                    status_data.append([
                        f"{icon} {name}",
                        str(count),
                        f"{percentage:.1f}%"
                    ])
                
                status_table = Table(status_data, colWidths=[2*inch, 1*inch, 1*inch])
                status_table.setStyle(TableStyle([
                    ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#6b7280')),
                    ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                    ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                    ('ALIGN', (1, 1), (-1, -1), 'CENTER'),
                    ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                    ('FONTSIZE', (0, 0), (-1, 0), 11),
                    ('FONTSIZE', (0, 1), (-1, -1), 10),
                    ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
                    ('TOPPADDING', (0, 0), (-1, -1), 8),
                    ('BACKGROUND', (0, 1), (-1, -1), colors.white),
                    ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#d1d5db')),
                    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE')
                ]))
                
                story.append(status_table)
                story.append(Spacer(1, 25))
        
        # Objetivos Detalhados
        if content.objectives:
            story.append(Paragraph("🎯 Objetivos Detalhados", subtitle_style))
            story.append(Spacer(1, 10))
            
            for i, obj in enumerate(content.objectives):  # Mostrar todos os objetivos
                # Nova página a cada 2 objetivos para melhor organização
                if i > 0 and i % 2 == 0:
                    story.append(PageBreak())
                
                # Card do objetivo com destaque
                obj_title = f"🎯 {obj.title}"
                story.append(Paragraph(obj_title, section_style))
                story.append(Spacer(1, 8))
                
                # Informações básicas do objetivo
                obj_info = [
                    ['👤 Responsável', obj.owner_name or 'Não atribuído'],
                    ['🔄 Ciclo', obj.cycle_name],
                    ['📊 Status', self._get_status_display(obj.status)],
                    ['📈 Progresso', f"{obj.progress:.1f}%"],
                    ['🔑 Key Results', f"{obj.key_results_completed}/{obj.key_results_count} concluídos"],
                    ['📅 Criado em', obj.created_at.strftime('%d/%m/%Y') if obj.created_at else 'N/A'],
                    ['🔄 Atualizado em', obj.updated_at.strftime('%d/%m/%Y') if obj.updated_at else 'N/A']
                ]
                
                if obj.description:
                    obj_info.append(['📝 Descrição', obj.description])
                
                obj_table = Table(obj_info, colWidths=[1.5*inch, 4*inch])
                obj_table.setStyle(TableStyle([
                    ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#fafafa')),
                    ('TEXTCOLOR', (0, 0), (0, -1), colors.HexColor('#4b5563')),
                    ('TEXTCOLOR', (1, 0), (1, -1), colors.HexColor('#1f2937')),
                    ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                    ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
                    ('FONTNAME', (1, 0), (1, -1), 'Helvetica'),
                    ('FONTSIZE', (0, 0), (-1, -1), 10),
                    ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
                    ('TOPPADDING', (0, 0), (-1, -1), 8),
                    ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#e5e7eb')),
                    ('VALIGN', (0, 0), (-1, -1), 'TOP')
                ]))
                
                story.append(obj_table)
                story.append(Spacer(1, 15))
                
                # Barra de progresso visual melhorada
                progress_text = f"Progresso: {obj.progress:.1f}%"
                story.append(Paragraph(progress_text, normal_style))
                
                # Criar barra de progresso visual
                progress_width = 4.5 * inch
                progress_height = 0.3 * inch
                progress_percent = min(obj.progress / 100, 1.0)
                
                # Cor baseada no progresso
                if obj.progress >= 80:
                    progress_color = colors.HexColor('#10b981')  # Verde
                    bg_color = colors.HexColor('#d1fae5')
                elif obj.progress >= 60:
                    progress_color = colors.HexColor('#f59e0b')  # Amarelo
                    bg_color = colors.HexColor('#fef3c7')
                elif obj.progress >= 30:
                    progress_color = colors.HexColor('#f97316')  # Laranja
                    bg_color = colors.HexColor('#fed7aa')
                else:
                    progress_color = colors.HexColor('#ef4444')  # Vermelho
                    bg_color = colors.HexColor('#fecaca')
                
                # Simular barra de progresso com tabela
                progress_data = [['']]
                progress_table = Table(progress_data, colWidths=[progress_width], rowHeights=[progress_height])
                progress_table.setStyle(TableStyle([
                    ('BACKGROUND', (0, 0), (0, 0), bg_color),
                    ('GRID', (0, 0), (0, 0), 1, colors.HexColor('#d1d5db'))
                ]))
                
                story.append(Spacer(1, 5))
                story.append(progress_table)
                story.append(Spacer(1, 20))
                
                # Key Results deste objetivo (se houver)
                obj_key_results = [kr for kr in content.key_results if kr.objective_id == obj.id] if content.key_results else []
                
                if obj_key_results:
                    story.append(Paragraph("🔑 Key Results deste Objetivo:", normal_style))
                    story.append(Spacer(1, 8))
                    
                    kr_data = [['Key Result', 'Progresso', 'Status', 'Tipo']]
                    
                    for kr in obj_key_results:
                        kr_type = 'Numérico' if kr.target_value else 'Booleano'
                        progress_display = f"{kr.progress:.1f}%"
                        if kr.target_value and kr.current_value is not None:
                            progress_display += f" ({kr.current_value}/{kr.target_value})"
                        
                        kr_data.append([
                            kr.title[:40] + '...' if len(kr.title) > 40 else kr.title,
                            progress_display,
                            self._get_status_display(kr.status),
                            kr_type
                        ])
                    
                    kr_table = Table(kr_data, colWidths=[2.5*inch, 1.2*inch, 0.8*inch, 0.8*inch])
                    kr_table.setStyle(TableStyle([
                        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#7c3aed')),
                        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                        ('ALIGN', (1, 1), (-1, -1), 'CENTER'),
                        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                        ('FONTSIZE', (0, 0), (-1, 0), 10),
                        ('FONTSIZE', (0, 1), (-1, -1), 9),
                        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
                        ('TOPPADDING', (0, 0), (-1, -1), 6),
                        ('BACKGROUND', (0, 1), (-1, -1), colors.white),
                        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#d1d5db')),
                        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
                        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f8fafc')])
                    ]))
                    
                    story.append(kr_table)
                    story.append(Spacer(1, 15))
                
                # Check-ins recentes (se houver dados)
                if hasattr(obj, 'recent_checkins') and obj.recent_checkins:
                    story.append(Paragraph("📊 Check-ins Recentes:", normal_style))
                    story.append(Spacer(1, 8))
                    
                    checkin_data = [['Data', 'Progresso', 'Comentário']]
                    
                    for checkin in obj.recent_checkins[:3]:  # Últimos 3 check-ins
                        comment = checkin.get('comment', '')
                        if len(comment) > 50:
                            comment = comment[:50] + '...'
                        
                        checkin_data.append([
                            checkin.get('date', 'N/A'),
                            f"{checkin.get('progress', 0):.1f}%",
                            comment or 'Sem comentário'
                        ])
                    
                    checkin_table = Table(checkin_data, colWidths=[1*inch, 1*inch, 3*inch])
                    checkin_table.setStyle(TableStyle([
                        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#6b7280')),
                        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                        ('ALIGN', (1, 1), (1, -1), 'CENTER'),
                        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                        ('FONTSIZE', (0, 0), (-1, 0), 9),
                        ('FONTSIZE', (0, 1), (-1, -1), 8),
                        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
                        ('TOPPADDING', (0, 0), (-1, -1), 6),
                        ('BACKGROUND', (0, 1), (-1, -1), colors.white),
                        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#d1d5db')),
                        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE')
                    ]))
                    
                    story.append(checkin_table)
                    story.append(Spacer(1, 20))
                
                # Separador entre objetivos
                if i < len(content.objectives) - 1:
                    story.append(Spacer(1, 10))
                    # Linha separadora
                    line_data = [['']]
                    line_table = Table(line_data, colWidths=[5.5*inch], rowHeights=[0.05*inch])
                    line_table.setStyle(TableStyle([
                        ('BACKGROUND', (0, 0), (0, 0), colors.HexColor('#e5e7eb')),
                        ('GRID', (0, 0), (0, 0), 0, colors.white)
                    ]))
                    story.append(line_table)
                    story.append(Spacer(1, 15))
        
        # Seção dedicada aos Key Results (nova página)
        if content.key_results and len(content.key_results) > 0:
            story.append(PageBreak())
            story.append(Paragraph("🔑 Todos os Key Results", subtitle_style))
            story.append(Spacer(1, 15))
            
            # Agrupar Key Results por objetivo
            kr_by_objective = {}
            for kr in content.key_results:
                obj_title = kr.objective_title
                if obj_title not in kr_by_objective:
                    kr_by_objective[obj_title] = []
                kr_by_objective[obj_title].append(kr)
            
            for obj_title, krs in kr_by_objective.items():
                story.append(Paragraph(f"🎯 {obj_title}", section_style))
                story.append(Spacer(1, 10))
                
                for kr in krs:
                    # Informações detalhadas do Key Result
                    kr_info = [
                        ['🔑 Título', kr.title],
                        ['📊 Status', self._get_status_display(kr.status)],
                        ['📈 Progresso', f"{kr.progress:.1f}%"],
                        ['🎯 Tipo', 'Numérico' if kr.target_value else 'Booleano']
                    ]
                    
                    if kr.target_value:
                        kr_info.append(['🎯 Meta', str(kr.target_value)])
                        kr_info.append(['📊 Valor Atual', str(kr.current_value or 0)])
                        kr_info.append(['📏 Unidade', kr.unit or 'N/A'])
                    
                    if kr.description:
                        kr_info.append(['📝 Descrição', kr.description])
                    
                    kr_info.append(['📅 Criado em', kr.created_at.strftime('%d/%m/%Y') if kr.created_at else 'N/A'])
                    kr_info.append(['🔄 Atualizado em', kr.updated_at.strftime('%d/%m/%Y') if kr.updated_at else 'N/A'])
                    
                    kr_table = Table(kr_info, colWidths=[1.5*inch, 4*inch])
                    kr_table.setStyle(TableStyle([
                        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#f8fafc')),
                        ('TEXTCOLOR', (0, 0), (0, -1), colors.HexColor('#4b5563')),
                        ('TEXTCOLOR', (1, 0), (1, -1), colors.HexColor('#1f2937')),
                        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
                        ('FONTNAME', (1, 0), (1, -1), 'Helvetica'),
                        ('FONTSIZE', (0, 0), (-1, -1), 9),
                        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
                        ('TOPPADDING', (0, 0), (-1, -1), 6),
                        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#e5e7eb')),
                        ('VALIGN', (0, 0), (-1, -1), 'TOP')
                    ]))
                    
                    story.append(kr_table)
                    story.append(Spacer(1, 12))
                
                story.append(Spacer(1, 15))
        
        # Resumo final (nova página)
        story.append(PageBreak())
        story.append(Paragraph("📋 Resumo Executivo", subtitle_style))
        story.append(Spacer(1, 15))
        
        # Insights e recomendações
        insights = []
        
        if content.dashboard_data:
            total_progress = content.dashboard_data.overall_progress
            completion_rate = content.dashboard_data.completion_rate
            
            if total_progress >= 80:
                insights.append("✅ Excelente progresso geral! A empresa está no caminho certo para atingir seus objetivos.")
            elif total_progress >= 60:
                insights.append("🟡 Progresso satisfatório, mas há espaço para melhorias em alguns objetivos.")
            else:
                insights.append("🔴 Atenção necessária! O progresso geral está abaixo do esperado.")
            
            if completion_rate >= 80:
                insights.append("🎯 Alta taxa de conclusão de objetivos demonstra eficiência na execução.")
            elif completion_rate < 50:
                insights.append("⚠️ Taxa de conclusão baixa. Revisar estratégias e recursos alocados.")
            
            # Análise por status
            if content.dashboard_data.objectives_by_status:
                behind_count = content.dashboard_data.objectives_by_status.get('BEHIND', 0)
                at_risk_count = content.dashboard_data.objectives_by_status.get('AT_RISK', 0)
                
                if behind_count > 0:
                    insights.append(f"🚨 {behind_count} objetivo(s) atrasado(s) requer(em) atenção imediata.")
                
                if at_risk_count > 0:
                    insights.append(f"⚠️ {at_risk_count} objetivo(s) em risco precisa(m) de monitoramento.")
        
        # Recomendações
        recommendations = [
            "📊 Realizar check-ins regulares para manter o progresso atualizado",
            "🎯 Focar nos objetivos com maior impacto estratégico",
            "👥 Garantir alinhamento entre equipes e objetivos",
            "📈 Monitorar KPIs semanalmente para identificar desvios rapidamente",
            "🔄 Ajustar metas conforme necessário baseado em dados reais"
        ]
        
        # Adicionar insights ao PDF
        for insight in insights:
            story.append(Paragraph(insight, normal_style))
            story.append(Spacer(1, 8))
        
        story.append(Spacer(1, 15))
        story.append(Paragraph("💡 Recomendações:", section_style))
        story.append(Spacer(1, 10))
        
        for rec in recommendations:
            story.append(Paragraph(rec, normal_style))
            for kr in top_krs:
                kr_data.append([
                    kr.title[:30] + '...' if len(kr.title) > 30 else kr.title,
                    kr.objective_title[:25] + '...' if len(kr.objective_title) > 25 else kr.objective_title,
                    f"{kr.progress:.1f}%",
                    self._get_status_display(kr.status)
                ])
            
            kr_table = Table(kr_data, colWidths=[2*inch, 1.8*inch, 0.8*inch, 1*inch])
            kr_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#7c3aed')),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                ('ALIGN', (2, 1), (2, -1), 'CENTER'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, 0), 11),
                ('FONTSIZE', (0, 1), (-1, -1), 9),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
                ('TOPPADDING', (0, 0), (-1, -1), 8),
                ('BACKGROUND', (0, 1), (-1, -1), colors.white),
                ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#d1d5db')),
                ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
                ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f8fafc')])
            ]))
            
            story.append(kr_table)
        
        # Rodapé
        story.append(Spacer(1, 30))
        footer_style = ParagraphStyle(
            'Footer',
            parent=styles['Normal'],
            fontSize=8,
            textColor=colors.HexColor('#9ca3af'),
            alignment=TA_CENTER
        )
        
        story.append(Paragraph(
            f"Relatório gerado automaticamente pelo Sistema OKR • {datetime.now().strftime('%d/%m/%Y às %H:%M')}",
            footer_style
        ))
        
        # Build PDF
        doc.build(story)
        
        return filepath
    
    def _get_status_display(self, status: str) -> str:
        """Converter status para exibição com emoji"""
        status_map = {
            'PLANNED': '📋 Planejado',
            'ON_TRACK': '🟢 No Prazo',
            'AT_RISK': '🟡 Em Risco',
            'BEHIND': '🔴 Atrasado',
            'COMPLETED': '✅ Concluído'
        }
        return status_map.get(status, f'📌 {status}')
    
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