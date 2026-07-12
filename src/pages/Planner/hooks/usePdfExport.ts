import { useState, RefObject } from 'react';
import dayjs from 'dayjs';

type UsePdfExportReturn = {
  isExporting: boolean;
  error: string | null;
  downloadPdf: (ref: RefObject<HTMLDivElement | null>) => Promise<void>;
  triggerPrint: () => void;
};

function addCanvasToMultiPagePdf(
  canvas: HTMLCanvasElement,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  doc: any,
): void {
  const pdfWidth = doc.internal.pageSize.getWidth();
  const pdfHeight = doc.internal.pageSize.getHeight();

  const imgWidth = pdfWidth;
  const imgHeight = (canvas.height / canvas.width) * imgWidth;

  // Encode once — reused across all pages
  const imgData = canvas.toDataURL('image/jpeg', 0.88);
  const pageCount = Math.ceil(imgHeight / pdfHeight);

  for (let page = 0; page < pageCount; page++) {
    if (page > 0) doc.addPage();
    doc.addImage(imgData, 'JPEG', 0, -(page * pdfHeight), imgWidth, imgHeight);
  }
}

const usePdfExport = (): UsePdfExportReturn => {
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const downloadPdf = async (ref: RefObject<HTMLDivElement | null>): Promise<void> => {
    if (!ref.current) return;

    setIsExporting(true);
    setError(null);

    try {
      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
        import('html2canvas'),
        import('jspdf'),
      ]);

      // Temporarily make the report visible for capture
      const el = ref.current;
      const prevDisplay = el.style.display;
      el.style.display = 'block';

      const canvas = await html2canvas(el, {
        scale: 1.5,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      });

      el.style.display = prevDisplay;

      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      addCanvasToMultiPagePdf(canvas, doc);

      doc.save(`financial-plan-${dayjs().format('YYYY-MM-DD')}.pdf`);
    } catch {
      setError(
        'PDF generation failed. Please try again or use Print → Save as PDF from your browser.',
      );
    } finally {
      setIsExporting(false);
    }
  };

  const triggerPrint = (): void => {
    window.print();
  };

  return { isExporting, error, downloadPdf, triggerPrint };
};

export default usePdfExport;
