"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const PDFViewer = dynamic(
  async () => {
    const mod = await import("react-pdf");
    mod.pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${mod.pdfjs.version}/build/pdf.worker.min.js`;

    return function Viewer({
      pdfUrl,
      width,
      onPages,
    }: {
      pdfUrl: string;
      width: number;
      onPages: (n: number) => void;
    }) {
      const { Document, Page } = mod;

      return (
        <Document
          file={pdfUrl}
          onLoadSuccess={({ numPages }) => onPages(numPages)}
        >
          <Page pageNumber={1} width={width} />
        </Document>
      );
    };
  },
  { ssr: false }
);

type Props = {
  pdfUrl?: string | null;
};

export default function RenderedPdfPreview({ pdfUrl }: Props) {
  const [numPages, setNumPages] = useState(1);
  const [width, setWidth] = useState(700);

  useEffect(() => {
    const update = () => {
      const maxWidth =
        window.innerWidth < 1024 ? window.innerWidth - 80 : 700;
      setWidth(Math.max(320, maxWidth));
    };

    update();
    window.addEventListener("resize", update);

    return () => window.removeEventListener("resize", update);
  }, []);

  if (!pdfUrl) {
    return (
      <div className="rounded-xl border border-gray-200 bg-gray-50 p-8 text-sm text-gray-500">
        PDF preview will appear after generation.
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-6 max-h-[700px] overflow-y-auto">
      <PDFViewer
        pdfUrl={pdfUrl}
        width={width}
        onPages={setNumPages}
      />
    </div>
  );
}