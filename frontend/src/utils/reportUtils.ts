
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Objective, ActivityItem } from '@/types/okr';
import { formatDate } from './dateUtils';

/**
 * Generates a PDF report for objectives and their activities
 */
export const generateObjectivesReport = (objectives: Objective[]) => {
  // Create PDF document
  const doc = new jsPDF();
  const currentDate = new Date().toLocaleDateString('pt-BR');
  
  // Add header
  doc.setFontSize(20);
  doc.setTextColor(40, 40, 40);
  doc.text('Relatório de Objetivos e Atividades', 14, 22);
  
  // Add generation date
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Gerado em: ${currentDate}`, 14, 30);
  
  // Add overview section
  doc.setFontSize(12);
  doc.setTextColor(40, 40, 40);
  doc.text('Resumo Geral', 14, 40);
  
  // Calculate overview metrics
  const totalObjectives = objectives.length;
  const completedObjectives = objectives.filter(obj => obj.progress === 100).length;
  const averageProgress = totalObjectives > 0 
    ? Math.round(objectives.reduce((sum, obj) => sum + obj.progress, 0) / totalObjectives) 
    : 0;
  
  const totalActivities = objectives.reduce((sum, obj) => sum + obj.activities.length, 0);
  const completedActivities = objectives.reduce(
    (sum, obj) => sum + obj.activities.filter(act => act.progress === 100).length, 
    0
  );
  
  // Add overview table
  autoTable(doc, {
    startY: 45,
    head: [['Métrica', 'Valor']],
    body: [
      ['Total de Objetivos', totalObjectives.toString()],
      ['Objetivos Concluídos', completedObjectives.toString()],
      ['Progresso Médio', `${averageProgress}%`],
      ['Total de Atividades', totalActivities.toString()],
      ['Atividades Concluídas', completedActivities.toString()],
    ],
    headStyles: {
      fillColor: [65, 105, 225],
      textColor: 255,
      fontStyle: 'bold',
    },
  });
  
  // Add details for each objective
  let yPosition = (doc as any).lastAutoTable?.finalY || 120;
  
  objectives.forEach((objective, index) => {
    // Check if we need a new page
    if (yPosition > 250) {
      doc.addPage();
      yPosition = 20;
    }
    
    // Add objective details
    yPosition += 10;
    doc.setFontSize(14);
    doc.setTextColor(0, 51, 102);
    doc.text(`Objetivo: ${objective.title}`, 14, yPosition);
    
    // Add progress
    yPosition += 7;
    doc.setFontSize(11);
    doc.setTextColor(80, 80, 80);
    doc.text(`Progresso: ${objective.progress}%`, 14, yPosition);
    
    // Add description if available
    if (objective.description) {
      yPosition += 6;
      doc.setFontSize(10);
      doc.text(`Descrição: ${objective.description}`, 14, yPosition);
    }
    
    // Add activities table
    if (objective.activities.length > 0) {
      const activitiesData = objective.activities.map((activity: ActivityItem) => [
        activity.title,
        activity.status,
        `${activity.progress}%`,
        activity.assignee || 'Não atribuído'
      ]);
      
      autoTable(doc, {
        startY: yPosition + 5,
        head: [['Atividade', 'Status', 'Progresso', 'Responsável']],
        body: activitiesData,
        headStyles: {
          fillColor: [100, 149, 237],
          textColor: 255,
        },
        alternateRowStyles: {
          fillColor: [240, 248, 255],
        },
      });
      
      yPosition = (doc as any).lastAutoTable?.finalY || yPosition + 50;
    } else {
      yPosition += 10;
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text('Nenhuma atividade cadastrada', 14, yPosition);
      yPosition += 10;
    }
    
    // Add separator between objectives
    if (index < objectives.length - 1) {
      doc.setDrawColor(200);
      doc.line(14, yPosition, 196, yPosition);
    }
  });
  
  // Add footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(
      'Desenvolvido por Nobug Tecnologia',
      doc.internal.pageSize.getWidth() - 60,
      doc.internal.pageSize.getHeight() - 10
    );
    doc.text(
      `Página ${i} de ${pageCount}`,
      14,
      doc.internal.pageSize.getHeight() - 10
    );
  }
  
  // Save the PDF
  doc.save('relatorio-objetivos-atividades.pdf');
};
