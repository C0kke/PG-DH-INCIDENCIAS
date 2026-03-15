import React from "react";

const downloadFileFromResponse = async (response, defaultFilename) => {
    const blob = await response.blob();
    let filename = defaultFilename;
    const contentDisposition = response.headers.get('Content-Disposition');
    if (contentDisposition) {
        const matches = /filename="?([^"]+)"?/.exec(contentDisposition);
        if (matches && matches[1]) {
            filename = matches[1];
        }
    }

    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url); 
};

const handleDownloadReporteById = async (id, setMensaje, setLoading) => {
  setLoading?.(true);
  setMensaje?.('');

  try {
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/incidencias/descargar-reporte/${id}`);

    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || `HTTP ${response.status}`);
    }

    const blob = await response.blob();

    const cd = response.headers.get('Content-Disposition');
    let filename = `Reporte_Incidencia_${id}.docx`;
    if (cd) {
      const match = /filename="?([^"]+)"?/i.exec(cd);
      if (match?.[1]) filename = match[1];
    }

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);

    setMensaje?.('Reporte descargado correctamente');
  } catch (err) {
    console.error('Descarga fallida:', err);
    setMensaje?.(`Error: ${err.message || 'No se pudo descargar el reporte.'}`);
  } finally {
    setLoading?.(false);
  }
};

export { handleDownloadReporteById, downloadFileFromResponse };