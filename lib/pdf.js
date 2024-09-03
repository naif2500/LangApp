// lib/pdf.js
import * as pdfjsLib from 'pdfjs-dist/build/pdf.mjs';

if (typeof window !== "undefined") {
    pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.mjs';  // Adjust this path based on where the worker file is located
}

export default pdfjsLib;
