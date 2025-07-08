import { useEffect, useRef } from "react";
import * as pdfjsLib from "pdfjs-dist";
import "./pdfWorker.js"; // 👈 Important!

export default function PdfViewer({ pdfBlobUrl }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!pdfBlobUrl) return;

    const renderPDF = async () => {
      const loadingTask = pdfjsLib.getDocument(pdfBlobUrl);
      const pdf = await loadingTask.promise;
      const page = await pdf.getPage(1);
      const viewport = page.getViewport({ scale: 1.5 });

      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      await page.render({ canvasContext: context, viewport }).promise;
    };

    renderPDF();
  }, [pdfBlobUrl]);

  return (
    <div style={{ width: "100%", overflowX: "auto", padding: "10px" }}>
      <canvas ref={canvasRef} style={{ width: "100%", height: "auto" }} />
    </div>
  );
}
