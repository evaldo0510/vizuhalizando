
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
    const splitText = doc.splitTextToSize(text, width - 40);
    doc.text(splitText, x, currentY);
    return currentY + (splitText.length * (size / 2)) + 2;
  };

  // --- Helper: Check Page Break ---
  const checkPageBreak = (currentY: number, margin: number = 20) => {
    if (currentY > height - margin) {
      doc.addPage();
      return 20; // Reset Y
    }
    return currentY;
  };

  // --- PAGE 1: COVER ---
  // Background Header
  doc.setFillColor(30, 27, 75); // Dark Indigo
  doc.rect(0, 0, width, 60, 'F');

  doc.setFont("times", "bold");
  doc.setFontSize(32);
  doc.setTextColor(255, 255, 255);
  doc.text("VIZU HALIZANDO", width / 2, 35, { align: "center" });
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(14);
  doc.setTextColor(200, 200, 200);
  doc.text("Dossier de Identidade Visual", width / 2, 45, { align: "center" });

  y = 80;

  // Profile Image
  if (userImageBase64) {
    try {
        const imgData = userImageBase64.startsWith('data:') ? userImageBase64 : `data:image/jpeg;base64,${userImageBase64}`;
        doc.addImage(imgData, 'JPEG', (width - 60) / 2, y, 60, 80, undefined, 'FAST');
        y += 90;
    } catch (e) {
        console.warn("Could not add user image to PDF", e);
    }
  }

  y += 10;
  doc.setFont("times", "bold");
  doc.setFontSize(24);
  doc.setTextColor(30, 41, 59); // Slate 800
  doc.text(`Cliente: ${clientName}`, width / 2, y, { align: "center" });
  
  y += 15;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  doc.setTextColor(100, 116, 139);
  doc.text(new Date().toLocaleDateString('pt-BR'), width / 2, y, { align: "center" });

  // --- PAGE 2: ANALYSIS ---
  doc.addPage();
  y = 20;

  // Title
  y = addText("Análise Biométrica & Visagismo", 20, y, 22, "times", "bold", [30, 27, 75]);
  y += 10;

  // Face Shape
  doc.setFillColor(248, 250, 252);
  doc.rect(20, y, width - 40, 30, 'F');
  y += 10;
  addText("Formato de Rosto", 25, y, 12, "helvetica", "bold", [71, 85, 105]);
  addText(result.formato_rosto_detalhado, 80, y, 12, "times", "normal", [15, 23, 42]);
  y += 15;

  // Body Type
  y += 5;
  addText("Biotipo", 25, y, 12, "helvetica", "bold", [71, 85, 105]);
  addText(result.biotipo, 80, y, 12, "times", "normal", [15, 23, 42]);
  y += 20;

  // Facial Analysis Text
  y = addText("Detalhamento Facial", 20, y, 16, "times", "bold", [30, 27, 75]);
  y += 5;
  y = addText(result.analise_facial, 20, y, 11, "helvetica", "normal", [51, 65, 85]);
  y += 10;

  // Color Palette
  y = checkPageBreak(y);
  y = addText("Colorimetria Pessoal", 20, y, 16, "times", "bold", [30, 27, 75]);
  y += 5;
  y = addText(result.analise_pele, 20, y, 11, "helvetica", "normal", [51, 65, 85]);
  
  y += 10;
  const swatchSize = 25;
  let swatchX = 20;
  
  doc.setFontSize(9);
  result.paleta_cores.forEach((color) => {
      // Draw Color Box
      doc.setFillColor(color.hex);
      doc.rect(swatchX, y, swatchSize, swatchSize, 'F');
      
      // Draw Name
      doc.setTextColor(50, 50, 50);
      doc.text(color.nome, swatchX + (swatchSize/2), y + swatchSize + 5, { align: 'center', maxWidth: swatchSize });
      
      swatchX += swatchSize + 10;
  });
  y += swatchSize + 20;

  // --- PAGE 3: RECOMMENDATIONS ---
  y = checkPageBreak(y);
  
  // Visagism
  y = addText("Recomendações de Visagismo", 20, y, 16, "times", "bold", [30, 27, 75]);
  y += 10;

  // Hair
  y = checkPageBreak(y);
  doc.setFont("helvetica", "bold");
  doc.text("Cabelo:", 20, y);
  y += 5;
  doc.setFont("helvetica", "normal");
  y = addText(`${result.visagismo.cabelo.estilo}: ${result.visagismo.cabelo.motivo}`, 20, y, 11);
  y += 5;

  // Beard/Makeup
  y = checkPageBreak(y);
  doc.setFont("helvetica", "bold");
  doc.text(result.genero === 'Masculino' ? "Barba:" : "Maquiagem:", 20, y);
  y += 5;
  doc.setFont("helvetica", "normal");
  y = addText(`${result.visagismo.barba_ou_make.estilo}: ${result.visagismo.barba_ou_make.motivo}`, 20, y, 11);
  y += 5;

  // Glasses
  y = checkPageBreak(y);
  doc.setFont("helvetica", "bold");
  doc.text("Óculos:", 20, y);
  y += 5;
  doc.setFont("helvetica", "normal");
  y = addText(`${result.otica.armacao}: ${result.otica.motivo}`, 20, y, 11);
  
  // --- OUTFITS ---
  doc.addPage();
  y = 20;
  y = addText("Sugestões de Looks", 20, y, 22, "times", "bold", [30, 27, 75]);
  y += 10;

  result.sugestoes_roupa.forEach((outfit, index) => {
      y = checkPageBreak(y, 60);
      
      doc.setFillColor(241, 245, 249); // Slate 100
      doc.roundedRect(20, y, width - 40, 50, 3, 3, 'F');
      
      let innerY = y + 10;
      doc.setFont("times", "bold");
      doc.setFontSize(14);
      doc.setTextColor(30, 41, 59);
      doc.text(`Look ${index + 1}: ${outfit.titulo}`, 25, innerY);
      
      innerY += 7;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(79, 70, 229); // Indigo 600
      doc.text(outfit.ocasiao.toUpperCase(), 25, innerY);
      
      innerY += 7;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(51, 65, 85);
      const desc = doc.splitTextToSize(outfit.detalhes, width - 60);
      doc.text(desc, 25, innerY);
      
      y += 60;
  });

  // Save
  doc.save(`Dossier_VizuHalizando_${clientName.replace(/\s/g, '_')}.pdf`);
};
