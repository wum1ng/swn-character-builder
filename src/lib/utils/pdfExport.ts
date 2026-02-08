import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export interface PDFExportOptions {
  pageSize: 'letter' | 'a4';
  includeDescriptions: boolean;
  includeNotes: boolean;
  colorScheme: 'bw' | 'color';
  quality: 'draft' | 'standard' | 'high';
}

export const DEFAULT_PDF_OPTIONS: PDFExportOptions = {
  pageSize: 'letter',
  includeDescriptions: false,
  includeNotes: true,
  colorScheme: 'bw',
  quality: 'standard'
};

export async function generateCharacterPDF(
  sheetElement: HTMLElement,
  options: PDFExportOptions
): Promise<Blob> {
  const margin = 5; // mm
  const pageWidth = options.pageSize === 'letter' ? 215.9 : 210;
  const pageHeight = options.pageSize === 'letter' ? 279.4 : 297;
  const contentWidth = pageWidth - margin * 2;
  const contentPageHeight = pageHeight - margin * 2;

  const scale = options.quality === 'high' ? 3 : options.quality === 'standard' ? 2 : 1;

  const canvas = await html2canvas(sheetElement, {
    scale,
    useCORS: true,
    logging: false,
    backgroundColor: '#ffffff',
    width: sheetElement.scrollWidth,
    height: sheetElement.scrollHeight
  });

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: options.pageSize
  });

  // Use JPEG to avoid PNG signature errors in jsPDF
  const imgData = canvas.toDataURL('image/jpeg', 0.95);
  const imgHeight = (canvas.height * contentWidth) / canvas.width;

  if (imgHeight <= contentPageHeight) {
    // Single page
    pdf.addImage(imgData, 'JPEG', margin, margin, contentWidth, imgHeight);
  } else {
    // Multi-page: slice the canvas into page-sized chunks
    const pxPerPage = (contentPageHeight / imgHeight) * canvas.height;
    let yOffset = 0;
    let pageNum = 0;

    while (yOffset < canvas.height) {
      if (pageNum > 0) {
        pdf.addPage();
      }

      const sliceHeight = Math.min(pxPerPage, canvas.height - yOffset);
      const pageCanvas = document.createElement('canvas');
      pageCanvas.width = canvas.width;
      pageCanvas.height = sliceHeight;

      const ctx = pageCanvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
        ctx.drawImage(
          canvas,
          0, yOffset,
          canvas.width, sliceHeight,
          0, 0,
          canvas.width, sliceHeight
        );
      }

      const pageImgData = pageCanvas.toDataURL('image/jpeg', 0.95);
      const sliceImgHeight = (sliceHeight * contentWidth) / canvas.width;
      pdf.addImage(pageImgData, 'JPEG', margin, margin, contentWidth, sliceImgHeight);

      yOffset += pxPerPage;
      pageNum++;
    }
  }

  return pdf.output('blob');
}

export function downloadPDF(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
