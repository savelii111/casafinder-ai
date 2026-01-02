import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Download, FileText, Table } from "lucide-react";
import { toast } from "sonner";
import jsPDF from 'jspdf';

export default function ExportManager({ apartments = [], language = 'en', userPlan = 'free' }) {
  const [isOpen, setIsOpen] = useState(false);
  const [exporting, setExporting] = useState(false);

  const labels = {
    en: {
      export: 'Export',
      title: 'Export Properties',
      pdf: 'Export as PDF',
      csv: 'Export as CSV',
      upgrade: 'Upgrade to Ultimate for exports',
      success: 'Exported successfully!'
    },
    es: {
      export: 'Exportar',
      title: 'Exportar Propiedades',
      pdf: 'Exportar como PDF',
      csv: 'Exportar como CSV',
      upgrade: 'Mejora a Ultimate para exportar',
      success: '¡Exportado exitosamente!'
    },
    ru: {
      export: 'Экспорт',
      title: 'Экспорт Объектов',
      pdf: 'Экспорт в PDF',
      csv: 'Экспорт в CSV',
      upgrade: 'Улучшите до Ultimate для экспорта',
      success: 'Успешно экспортировано!'
    }
  };

  const t = labels[language] || labels.en;

  const exportToPDF = async () => {
    if (userPlan !== 'ultimate') {
      toast.error(t.upgrade);
      return;
    }

    setExporting(true);
    try {
      const pdf = new jsPDF();
      pdf.setFontSize(20);
      pdf.text('Property Report', 20, 20);
      
      let y = 40;
      apartments.slice(0, 10).forEach((apt, idx) => {
        pdf.setFontSize(12);
        pdf.text(`${idx + 1}. ${apt.title}`, 20, y);
        pdf.setFontSize(10);
        pdf.text(`€${apt.price}/mo - ${apt.address}`, 20, y + 7);
        y += 20;
      });

      pdf.save('properties.pdf');
      toast.success(t.success);
    } catch (error) {
      toast.error('Export failed');
    } finally {
      setExporting(false);
      setIsOpen(false);
    }
  };

  const exportToCSV = () => {
    if (userPlan !== 'ultimate') {
      toast.error(t.upgrade);
      return;
    }

    setExporting(true);
    try {
      const headers = ['Title', 'Price', 'Rooms', 'Size', 'Address', 'Risk Score'];
      const rows = apartments.map(apt => [
        apt.title,
        apt.price,
        apt.rooms,
        apt.size,
        apt.address,
        apt.riskScore
      ]);

      const csv = [
        headers.join(','),
        ...rows.map(row => row.join(','))
      ].join('\n');

      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'properties.csv';
      a.click();

      toast.success(t.success);
    } catch (error) {
      toast.error('Export failed');
    } finally {
      setExporting(false);
      setIsOpen(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          {t.export}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t.title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <Button
            onClick={exportToPDF}
            disabled={exporting || userPlan !== 'ultimate'}
            className="w-full justify-start gap-2"
            variant="outline"
          >
            <FileText className="h-4 w-4" />
            {t.pdf}
          </Button>
          <Button
            onClick={exportToCSV}
            disabled={exporting || userPlan !== 'ultimate'}
            className="w-full justify-start gap-2"
            variant="outline"
          >
            <Table className="h-4 w-4" />
            {t.csv}
          </Button>
          {userPlan !== 'ultimate' && (
            <p className="text-xs text-gray-500 text-center">{t.upgrade}</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}