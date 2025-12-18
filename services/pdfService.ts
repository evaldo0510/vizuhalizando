
import { jsPDF } from "jspdf";
import type { AnalysisResult } from "../types";

export const generateDossierPDF = async (
  result: AnalysisResult, 
  clientName: string,
  userImageBase64?: string
): Promise<void> => {
  const doc = new jsPDF();
  const width = doc.internal.pageSize.getWidth();
  const height = doc.internal.pageSize.getHeight();
  let y = 0;

  // --- Helper: Add Text ---
  const addText = (text: string, x: number, currentY: number, size: number = 10, font: string = "helvetica", style: string = "normal", color: [number, number, number] = [0, 0, 0]) => {
    doc.setFont(font, style);
    doc.setFontSize(size);
    doc.setTextColor(color[0], color[1], color[2]);
    const splitText = doc.splitTextToSize(text || "", width - 40);
    doc.text(splitText, x, currentY);
    return currentY + (splitText.length * (size / 2)) + 2;
  };

  const checkPageBreak = (currentY: number, margin: number = 20) => {
    if (currentY > height - margin) {
      doc.addPage();
      return 20;
    }
    return currentY;
  };

  // --- COVER ---
  doc.setFillColor(26, 26, 46); // Brand Graphite
  doc.rect(0, 0, width, 60, 'F');

  doc.setFont("times", "bold");
  doc.setFontSize(32);
  doc.setTextColor(197, 165, 114); // Brand Gold
  doc.text("VIZU HALIZANDO", width / 2, 35, { align: "center" });
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255);
  doc.text("Dossier Profissional de Imagem", width / 2, 45, { align: "center" });

  y = 80;

  if (userImageBase64) {
    try {
        const imgData = userImageBase64.includes(',') ? userImageBase64 : `data:image/jpeg;base64,${userImageBase64}`;
        doc.addImage(imgData, 'JPEG', (width - 70) / 2, y, 70, 90, undefined, 'FAST');
        y += 100;
    } catch (e) {
        console.warn("Could not add image");
    }
  }

  y += 10;
  doc.setFont("times", "bold");
  doc.setFontSize(22);
  doc.setTextColor(26, 26, 46);
  doc.text(clientName, width / 2, y, { align: "center" });
  
  y += 12;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(150, 150, 150);
  doc.text(`Gerado em ${new Date().toLocaleDateString('pt-BR')}`, width / 2, y, { align: "center" });

  // --- CONTENT ---
  doc.addPage();
  y = 25;

  y = addText("Análise de Visagismo", 20, y, 20, "times", "bold", [197, 165, 114]);
  y += 10;

  y = addText(`Formato de Rosto: ${result.formato_rosto_detalhado}`, 20, y, 12, "helvetica", "bold");
  y = addText(`Biotipo: ${result.biotipo}`, 20, y, 12, "helvetica", "bold");
  y += 5;

  y = addText("Análise Técnica:", 20, y, 14, "times", "bold");
  y = addText(result.analise_facial, 20, y, 11);
  y += 5;

  y = checkPageBreak(y);
  y = addText("Colorimetria Pessoal:", 20, y, 14, "times", "bold");
  y = addText(result.analise_pele, 20, y, 11);
  y += 10;

  // Paleta de Cores
  y = checkPageBreak(y);
  let swatchX = 20;
  result.paleta_cores?.forEach((color) => {
      doc.setFillColor(color.hex);
      doc.rect(swatchX, y, 20, 20, 'F');
      swatchX += 25;
  });
  y += 30;

  // Recomendações
  y = checkPageBreak(y);
  y = addText("Harmonização Sugerida:", 20, y, 16, "times", "bold");
  y += 5;
  y = addText(`Cabelo: ${result.visagismo?.cabelo?.estilo}`, 20, y, 11, "helvetica", "bold");
  y = addText(result.visagismo?.cabelo?.motivo, 20, y, 10);
  y += 5;
  y = addText(`Óptica: ${result.otica?.armacao}`, 20, y, 11, "helvetica", "bold");
  y = addText(result.otica?.motivo, 20, y, 10);

  // Looks
  doc.addPage();
  y = 25;
  y = addText("Curadoria de Looks", 20, y, 20, "times", "bold", [197, 165, 114]);
  y += 10;

  result.sugestoes_roupa?.forEach((look, i) => {
    y = checkPageBreak(y, 40);
    y = addText(`${i+1}. ${look.titulo}`, 20, y, 13, "helvetica", "bold");
    y = addText(look.detalhes, 20, y, 10);
    y += 10;
  });

  const safeName = clientName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
  doc.save(`vizuhalizando_${safeName}.pdf`);
};
