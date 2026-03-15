import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, BorderStyle, HeadingLevel, AlignmentType, ImageRun, WidthType } from 'docx';
import axios from 'axios';
import fs from 'fs';
import path from 'path';

// --- HELPERS ---
const formatearFechaLarga = (fecha) => {
    if (!fecha) return new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
    return new Date(fecha).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
};

const getHora = (fechaISO) => {
    if (!fechaISO) return "00:00";
    // Si viene como string '2025-10-09 01:05:01'
    const d = new Date(fechaISO);
    return d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
};

const getIniciales = (nombre) => {
    if (!nombre) return "XX";
    return nombre.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 3);
};

export async function generarReporteIncidencia(data) {
    // Preparar variables con fallbacks seguros
    const fechaObj = data.hora ? new Date(data.hora) : new Date();
    const fechaLarga = formatearFechaLarga(fechaObj);
    const fechaEmision = formatearFechaLarga(new Date());
    const horaTexto = getHora(data.hora);
    
    // Formato fecha corta DD-MM-YYYY para la tabla
    const fechaCorta = `${fechaObj.getDate().toString().padStart(2,'0')}-${(fechaObj.getMonth()+1).toString().padStart(2,'0')}-${fechaObj.getFullYear()}`;
    const fechaTabla = `${fechaCorta} ${horaTexto}`;

    const nombre = data.responsable_nombre || "Usuario";
    const email = data.responsable_email || "usuario@empresa.com";
    const area = data.area || "Área General";
    const modulo = data.modulo || "Falla General";
    const prioridad = data.prioridad ? data.prioridad.charAt(0).toUpperCase() + data.prioridad.slice(1) : "Media";
    const estado = data.estado || "Registrada";
    
    // Código del título: #YYYY-MM-DD-INICIALES
    const codigo = `#${fechaObj.getFullYear()}-${(fechaObj.getMonth()+1).toString().padStart(2,'0')}-${fechaObj.getDate().toString().padStart(2,'0')}-${getIniciales(nombre)}`;

    // Estilos
    const font = "Calibri";
    const bold = (txt) => new TextRun({ text: txt, bold: true, font, size: 24 });
    const normal = (txt) => new TextRun({ text: txt, font, size: 24 });

    // --- TABLA DETALLE ---
    const createTable = () => {
        const rows = [
            { label: "Ubicación", val: area },
            { label: "Categoría", val: modulo },
            { label: "Fecha y Hora", val: fechaTabla },
            { label: "Prioridad", val: prioridad },
            { label: "Solicitante", val: nombre },
            { label: "Estado Actual", val: `${estado} / Reporte Descargado` },
        ];

        return new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
                new TableRow({
                    children: [
                        new TableCell({ children: [new Paragraph({ children: [bold("Campo")] })], shading: { fill: "F2F2F2" } }),
                        new TableCell({ children: [new Paragraph({ children: [bold("Información Registrada")] })], shading: { fill: "F2F2F2" } }),
                    ]
                }),
                ...rows.map(r => new TableRow({
                    children: [
                        new TableCell({ children: [new Paragraph({ children: [normal(r.label)] })], width: { size: 30, type: WidthType.PERCENTAGE } }),
                        new TableCell({ children: [new Paragraph({ children: [normal(r.val)] })] }),
                    ]
                }))
            ]
        });
    };

    // --- IMAGEN ---
    let imageRun = null;
    if (data.url_foto) {
        try {
            let buffer;
            if (data.url_foto.startsWith('http')) {
                // Descarga de Cloudinary (o cualquier URL)
                const res = await axios.get(data.url_foto, { responseType: 'arraybuffer' });
                buffer = Buffer.from(res.data, 'binary');
            } else {
                // Archivo Local
                const localPath = path.resolve(data.url_foto);
                if (fs.existsSync(localPath)) buffer = fs.readFileSync(localPath);
            }
            if (buffer) {
                imageRun = new ImageRun({ data: buffer, transformation: { width: 400, height: 300 } });
            }
        } catch (e) {
            console.error("Error cargando imagen reporte:", e.message);
        }
    }

    // --- DOC ---
    const children = [
        // Título
        new Paragraph({ text: `Informe de Incidencia ${codigo}`, heading: HeadingLevel.HEADING_1 }),
        new Paragraph({ text: "", spacing: { after: 200 } }),

        // Metadata
        new Paragraph({ children: [bold("Fecha de Emisión:")] }),
        new Paragraph({ children: [normal(fechaEmision)] }),
        new Paragraph({ children: [bold("Emitido por:")] }),
        new Paragraph({ children: [normal(nombre)] }),
        new Paragraph({ text: "", spacing: { after: 300 } }),

        // 1. Resumen
        new Paragraph({ text: "1. Resumen de la Incidencia", heading: HeadingLevel.HEADING_2, spacing: { after: 200 } }),
        new Paragraph({
            children: [
                normal("Se informa que el día "), bold(fechaLarga),
                normal(", a las "), bold(`${horaTexto} horas`),
                normal(", se ha procedido al registro de una nueva incidencia operativa a través del sistema de gestión de planta. El evento ha sido identificado en el sector del "),
                bold(area), normal(" y corresponde a una falla de tipo "), bold(modulo), normal("."),
            ],
            alignment: AlignmentType.JUSTIFIED, spacing: { after: 200 }
        }),
        new Paragraph({
            children: [
                normal("El reporte ha sido ingresado exitosamente al sistema por el responsable "),
                bold(nombre), normal(" bajo una categoría de prioridad "), bold(prioridad),
                normal(". El sistema ha confirmado la recepción de los datos y la descarga del comprobante correspondiente, quedando pendiente la revisión técnica por parte del área encargada."),
            ],
            alignment: AlignmentType.JUSTIFIED, spacing: { after: 400 }
        }),

        // 2. Detalle
        new Paragraph({ text: "2. Detalle del Registro", heading: HeadingLevel.HEADING_2, spacing: { after: 200 } }),
        new Paragraph({ children: [normal("A continuación se presentan los datos específicos capturados en el formulario de control:")], spacing: { after: 200 } }),
        createTable(),
        new Paragraph({ text: "", spacing: { after: 200 } }),

        // Evidencia
        imageRun 
            ? new Paragraph({ children: [normal("(Se adjunta captura del formulario de registro como evidencia en el anexo digital)")], spacing: { after: 200 } })
            : new Paragraph({ children: [normal("(No se adjuntó evidencia visual)")], italic: true }),
        
        imageRun ? new Paragraph({ children: [imageRun], alignment: AlignmentType.CENTER, spacing: { after: 400 } }) : new Paragraph({ text:"" }),

        // 3. Borrador Correo
        new Paragraph({ text: "3. Borrador de Correo de Notificación", heading: HeadingLevel.HEADING_2, spacing: { after: 200 } }),
        new Paragraph({ children: [bold("Para: "), normal("Mantenimiento Planta mantenimiento@empresa.com")] }),
        new Paragraph({ children: [bold("CC: "), normal(`${nombre} ${email}`)] }),
        new Paragraph({ children: [bold("Asunto: "), normal(`Reporte de Incidencia ${modulo} - ${area} - [Prioridad ${prioridad}]`)] }),
        new Paragraph({ text: "", spacing: { after: 200 } }),
        new Paragraph({ children: [normal("Estimado equipo de Mantenimiento,")] }),
        new Paragraph({ children: [normal("Por medio del presente, les notifico que se ha registrado una nueva incidencia en el sistema con los siguientes detalles para su programación:")], spacing: { after: 200 } }),
        
        new Paragraph({ children: [bold("• Ubicación: "), normal(area)], indent: { left: 720 } }),
        new Paragraph({ children: [bold("• Tipo de falla: "), normal(modulo)], indent: { left: 720 } }),
        new Paragraph({ children: [bold("• Fecha de reporte: "), normal(`${fechaLarga} (${horaTexto} hrs)`)], indent: { left: 720 } }),
        new Paragraph({ children: [bold("• Prioridad: "), normal(prioridad)], indent: { left: 720 }, spacing: { after: 200 } }),

        new Paragraph({ children: [normal("El reporte completo ya ha sido generado y descargado en la plataforma. Agradeceré que puedan incluir esta revisión en la próxima ronda de mantenimiento preventivo o correctivo según disponibilidad, dado el nivel de prioridad asignado.")], alignment: AlignmentType.JUSTIFIED, spacing: { after: 200 } }),
        new Paragraph({ children: [normal("Quedo atento a sus comentarios o requerimientos de información adicional.")], spacing: { after: 200 } }),
        new Paragraph({ children: [normal("Atentamente,")] }),
        new Paragraph({ children: [bold(nombre)] }),
        new Paragraph({ children: [normal("Responsable de Turno / Área")] }),
    ];

    const document = new Document({ sections: [{ children }] });
    return await Packer.toBuffer(document);
}