import React, { useState, useEffect } from "react";
import axios from "axios";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { getWeek, parse } from "date-fns";
import { isWithinInterval } from "date-fns";
import { useRef } from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from 'jspdf';
import { Line } from 'react-chartjs-2';
import { Doughnut } from "react-chartjs-2";



import autoTable from 'jspdf-autotable';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);









type Color = "white" | "orange" | "black" | "red";

type Row = {
  campania: string;
  
  n_flota: string;
  base: string;
  carretera: string;
  provincia: string;
  zona: string;
  der_delantera: string;
  der_plus: string;
  der_trasera: string;
  extra: string;
  izq_delantera: string;
  izq_plus: string;
  izq_trasera: string;
  lineas: string;
  matricula: string;
  modelo: string;
  operador: string;
  plantilla: string;
  trasera: string;
  info_plus: string;    
  observaciones: string;
  fechaInicio: string;
  fechaFin: string;
  color: "white" | "orange" | "black" | "red";
};

const LOCAL_STORAGE_KEY = "Salamanca-color-data";

const Salamanca: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<Row[]>([]);
  const [vista, setVista] = useState<"calendario" | "resumen" | "total">("calendario");
  const chartRef = useRef<any>(null);
  const [anioSeleccionado, setAnioSeleccionado] = useState(new Date().getFullYear());
  
  







  const [fechaSeleccionada, setFechaSeleccionada] = useState<Date | null>(null);
  const [filterColor, setFilterColor] = useState("Todos");
  const [filterMunicipio, setFilterMunicipio] = useState("Todos");
  
  const [filtroPorSemana, setFiltroPorSemana] = useState(false);
  const avisadasRef = useRef<Set<string>>(new Set());
  const [mostrarCaducados, setMostrarCaducados] = useState(false);
  const [filterOperador, setFilterOperador] = useState("Todos");
  const [filterLinea, setFilterLinea] = useState("Todos");
  const ensureIncluded = (list: string[], valor: string) => {
  if (valor === "Todos" || list.includes(valor)) return list;
  
};

const generarResumenAnual = () => {
  const resumen = {
    Montado: Array(12).fill(0),
    Reservado: Array(12).fill(0),
    "No usar": Array(12).fill(0),
    Libres: Array(12).fill(0),
  };

  data.forEach((row) => {
    const { color, fechaInicio, fechaFin } = row;

    const inicio = fechaInicio ? new Date(fechaInicio) : null;
    const fin = fechaFin ? new Date(fechaFin) : null;

    if (color === "red" && inicio) {
      const mes = inicio.getMonth();
      resumen.Montado[mes]++;
    } else if (color === "orange" && inicio) {
      const mes = inicio.getMonth();
      resumen.Reservado[mes]++;
    } else if (color === "black" && inicio) {
      const mes = inicio.getMonth();
      resumen["No usar"][mes]++;
    } else if (color === "white") {
      // Libres con fechas válidas -> sumar en el rango
      if (inicio && fin && !isNaN(inicio.getTime()) && !isNaN(fin.getTime())) {
        const mesInicio = inicio.getMonth();
        const mesFin = fin.getMonth();
        for (let m = mesInicio; m <= mesFin; m++) {
          resumen.Libres[m]++;
        }
      } else {
        // ❗ Libres sin fechas -> sumar en TODOS los meses
        for (let m = 0; m < 12; m++) {
          resumen.Libres[m]++;
        }
      }
    }
  });

  return resumen;
};

const generarTotalesMontadoLibres = () => {
  const resumen = generarResumenAnual();
  return {
    Montado: resumen.Montado.reduce((a, b) => a + b, 0),
    Libres: resumen.Libres.reduce((a, b) => a + b, 0),
  };
};

const generarResumenPorAnio = (anio: number) => {
  const resumen = {
    Montado: Array(12).fill(0),
    Libres: Array(12).fill(0),
  };

  data.forEach((row) => {
    const { color, fechaInicio, fechaFin } = row;
    const inicio = fechaInicio ? new Date(fechaInicio) : null;
    const fin = fechaFin ? new Date(fechaFin) : null;

    const fueraDeAnio =
      (inicio && inicio.getFullYear() !== anio) &&
      (fin && fin.getFullYear() !== anio);

    if (fueraDeAnio) return;

    if (color === "red" && inicio?.getFullYear() === anio) {
      resumen.Montado[inicio.getMonth()]++;
    } else if (color === "white") {
      if (
        inicio &&
        fin &&
        !isNaN(inicio.getTime()) &&
        !isNaN(fin.getTime())
      ) {
        const mesInicio =
          inicio.getFullYear() === anio ? inicio.getMonth() : 0;
        const mesFin = fin.getFullYear() === anio ? fin.getMonth() : 11;

        for (let m = mesInicio; m <= mesFin; m++) {
          resumen.Libres[m]++;
        }
      } else {
        // Libres sin fechas: contarlos en todos los meses
        for (let m = 0; m < 12; m++) {
          resumen.Libres[m]++;
        }
      }
    }
  });

  return resumen;
};










  
const [filterProvincia, setFilterProvincia] = useState("Todos");
const [filterZona, setFilterZona] = useState("Todos");
// Filtrado completo (para mostrar resultados)
// Filtrado completo (para mostrar resultados en tabla)
const [filterModelo, setFilterModelo] = useState("Todos");
const [filterTrasera, setFilterTrasera] = useState("Todos");
const [filterCampania, setFilterCampania] = useState("Todos");

// ✅ Ya puedes usarlo aquí abajo sin error
const dataFiltrada = data.filter((row) =>
  (filterLinea === "Todos" || row.lineas === filterLinea) &&
  (filterOperador === "Todos" || row.operador === filterOperador) &&
  (filterZona === "Todos" || row.zona === filterZona) &&
  (filterProvincia === "Todos" || row.provincia === filterProvincia) &&
  (filterModelo === "Todos" || row.modelo === filterModelo) &&
  (filterTrasera === "Todos" || row.trasera === filterTrasera) &&
  (filterCampania === "Todos" || row.campania === filterCampania)
);

const modelosDisponiblesRaw = [...new Set(
  data
    .filter((r) =>
      (filterOperador === "Todos" || r.operador === filterOperador) &&
      (filterZona === "Todos" || r.zona === filterZona) &&
      (filterProvincia === "Todos" || r.provincia === filterProvincia) &&
      (filterLinea === "Todos" || r.lineas === filterLinea)
    )
    .map((r) => r.modelo)
)].filter(Boolean).sort();

const modelosDisponibles = modelosDisponiblesRaw.includes(filterModelo)
  ? modelosDisponiblesRaw
  : [filterModelo, ...modelosDisponiblesRaw].filter(Boolean);


const traserasDisponiblesRaw = [...new Set(
  data
    .filter((r) =>
      (filterOperador === "Todos" || r.operador === filterOperador) &&
      (filterZona === "Todos" || r.zona === filterZona) &&
      (filterProvincia === "Todos" || r.provincia === filterProvincia) &&
      (filterLinea === "Todos" || r.lineas === filterLinea)
    )
    .map((r) => r.trasera)
)].filter(Boolean).sort();

const traserasDisponibles = traserasDisponiblesRaw.includes(filterTrasera)
  ? traserasDisponiblesRaw
  : [filterTrasera, ...traserasDisponiblesRaw].filter(Boolean);


const campaniasDisponiblesRaw = [...new Set(
  data
    .filter((r) =>
      (filterOperador === "Todos" || r.operador === filterOperador) &&
      (filterZona === "Todos" || r.zona === filterZona) &&
      (filterProvincia === "Todos" || r.provincia === filterProvincia) &&
      (filterLinea === "Todos" || r.lineas === filterLinea)
    )
    .map((r) => r.campania)
)].filter(Boolean).sort();

const campaniasDisponibles = campaniasDisponiblesRaw.includes(filterCampania)
  ? campaniasDisponiblesRaw
  : [filterCampania, ...campaniasDisponiblesRaw].filter(Boolean);


const lineasDisponiblesRaw = [...new Set(
  data
    .filter((r) =>
      (filterOperador === "Todos" || r.operador === filterOperador) &&
      (filterZona === "Todos" || r.zona === filterZona) &&
      (filterProvincia === "Todos" || r.provincia === filterProvincia)
    )
    .map((r) => r.lineas)
)].filter(Boolean).sort();

const lineasDisponibles = lineasDisponiblesRaw.includes(filterLinea)
  ? lineasDisponiblesRaw
  : [filterLinea, ...lineasDisponiblesRaw].filter(Boolean);


const operadoresDisponiblesRaw = [...new Set(
  data
    .filter((r) =>
      (filterLinea === "Todos" || r.lineas === filterLinea) &&
      (filterZona === "Todos" || r.zona === filterZona) &&
      (filterProvincia === "Todos" || r.provincia === filterProvincia)
    )
    .map((r) => r.operador)
)].filter(Boolean).sort();

const operadoresDisponibles = operadoresDisponiblesRaw.includes(filterOperador)
  ? operadoresDisponiblesRaw
  : [filterOperador, ...operadoresDisponiblesRaw].filter(Boolean);


const zonasDisponiblesRaw = [...new Set(
  data
    .filter((r) =>
      (filterLinea === "Todos" || r.lineas === filterLinea) &&
      (filterOperador === "Todos" || r.operador === filterOperador) &&
      (filterProvincia === "Todos" || r.provincia === filterProvincia)
    )
    .map((r) => r.zona)
)].filter(Boolean).sort();

const zonasDisponibles = zonasDisponiblesRaw.includes(filterZona)
  ? zonasDisponiblesRaw
  : [filterZona, ...zonasDisponiblesRaw].filter(Boolean);

  const limpiarTexto = (texto: string): string => {
  return texto
    .normalize("NFD") // descompone caracteres acentuados
    .replace(/[\u0300-\u036f]/g, "") // elimina acentos
    .replace(/�/g, "") // elimina símbolos raros sueltos
    .trim();
};



const provinciasDisponiblesRaw = [...new Set(
  data
    .filter((r) =>
      (filterLinea === "Todos" || r.lineas === filterLinea) &&
      (filterOperador === "Todos" || r.operador === filterOperador) &&
      (filterZona === "Todos" || r.zona === filterZona)
    )
    .map((r) => r.provincia)
)].filter(Boolean).sort();

const provinciasDisponibles = provinciasDisponiblesRaw.includes(filterProvincia)
  ? provinciasDisponiblesRaw
  : [filterProvincia, ...provinciasDisponiblesRaw].filter(Boolean);


const estadoDesdeColor = (color: string): string => {
  switch (color) {
    case "red":
      return "Montado";
    case "orange":
      return "Reservado";
    case "black":
      return "No usar";
    default:
      return "Libre";
  }
};
const arreglarTextoCorrupto = (texto: string): string => {
  if (!texto) return "";

  return texto
    .replace(/Ã¡/g, "á")
    .replace(/Ã©/g, "é")
    .replace(/Ã­/g, "í")
    .replace(/Ã³/g, "ó")
    .replace(/Ãº/g, "ú")
    .replace(/Ã±/g, "ñ")
    .replace(/Ã/g, "Á")
    .replace(/Ã‰/g, "É")
    .replace(/Ã/g, "Í")
    .replace(/Ã“/g, "Ó")
    .replace(/Ãš/g, "Ú")
    .replace(/Ã‘/g, "Ñ")
    .replace(/�/g, "") // Elimina reemplazos corruptos
    .replace(/\s+/g, " ")
    .trim();
};







const exportarMesAExcel = (data: Row[], mesSeleccionado: string) => {
  if (!mesSeleccionado) {
    alert("Por favor, selecciona un mes.");
    return;
  }

  const [añoStr, mesStr] = mesSeleccionado.split("-");
  const año = parseInt(añoStr, 10);
  const mes = parseInt(mesStr, 10) - 1;

  const primerDia = new Date(año, mes, 1);
  const ultimoDia = new Date(año, mes + 1, 0);

  const datosFiltrados = data.filter((row) => {
    if (row.color === "white") return false;
    const inicio = row.fechaInicio ? new Date(row.fechaInicio) : null;
    const fin = row.fechaFin ? new Date(row.fechaFin) : null;
    return (
      inicio &&
      fin &&
      !isNaN(inicio.getTime()) &&
      !isNaN(fin.getTime()) &&
      fin >= primerDia &&
      inicio <= ultimoDia
    );
  });
  

  const mapearDatos = (filas: Row[]) =>
    filas.map((row) => ({
      "Nº Flota": row.n_flota,
      Carretera:row.carretera,
      Matrícula: row.matricula,
      Base: row.base,
      Modelo: row.modelo,
      Operador: row.operador,
      Provincia: row.provincia,
      Zona: row.zona,
      Líneas: row.lineas,
      Campania: row.campania,
      "Fecha Inicio": row.fechaInicio ? new Date(row.fechaInicio).toLocaleDateString() : "",
      "Fecha Fin": row.fechaFin ? new Date(row.fechaFin).toLocaleDateString() : "",
      Estado: estadoDesdeColor(row.color),
    }));

  const hojas = {
    General: datosFiltrados,
    Montado: datosFiltrados.filter((r) => estadoDesdeColor(r.color) === "Montado"),
    Reservado: datosFiltrados.filter((r) => estadoDesdeColor(r.color) === "Reservado"),
    "No usar": datosFiltrados.filter((r) => estadoDesdeColor(r.color) === "No usar"),
  };

  const workbook = XLSX.utils.book_new();

  Object.entries(hojas).forEach(([nombreHoja, filas]) => {
    const datos = mapearDatos(filas);
    const worksheet = XLSX.utils.json_to_sheet(datos);

    worksheet["!cols"] = Object.keys(datos[0] || {}).map(() => ({ wch: 20 }));
    worksheet["!freeze"] = { xSplit: 0, ySplit: 1 };

    XLSX.utils.book_append_sheet(workbook, worksheet, nombreHoja);
  });

  const nombreArchivo = `Resumen_${mesSeleccionado}.xlsx`;
  const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
  const blob = new Blob([excelBuffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  saveAs(blob, nombreArchivo);
};

// ✅ FUNCION EXPORTAR A PDF (FUERA del anterior)
// ⚠️ Fix temporal para TypeScript
// @ts-ignore
const autoTableTyped: any = autoTable;

const exportToPDF = (rows: Row[], mesSeleccionado?: string) => {
  const doc = new jsPDF();

  const formatDate = (fecha: string) => {
    if (!fecha) return '';
    const date = new Date(fecha);
    if (isNaN(date.getTime())) return '';
    return date.toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const estadoDesdeColor = (color: string): string => {
    switch (color) {
      case 'red': return 'Montado';
      case 'orange': return 'Reservado';
      case 'black': return 'No usar';
      default: return 'Libre';
    }
  };

  // Cabecera
  const fechaHoy = new Date().toLocaleDateString('es-ES');
  doc.setFontSize(10);
  doc.text(`Generado: ${fechaHoy}`, doc.internal.pageSize.getWidth() - 60, 15);
  doc.setFontSize(14);
  doc.text('Resumen de Buses por Operador', doc.internal.pageSize.getWidth() / 2, 22, { align: 'center' });

  let startY = 30;

  const columnas = [
    'Matrícula',
    'Carretera',
    'Provincia',
    'Línea',
    'Zona',
    'Modelo',
    'Campania',
    'Inicio',
    'Fin',
  ];

  const registrosFiltrados = rows.filter(r => r.color !== 'white');
  const operadoresUnicos = [...new Set(registrosFiltrados.map(r => r.operador))];
  

  for (const operador of operadoresUnicos) {
    const registrosDelOperador = registrosFiltrados.filter(r => r.operador === operador);

    const secciones = {
      Montado: registrosDelOperador.filter(r => estadoDesdeColor(r.color) === 'Montado'),
      Reservado: registrosDelOperador.filter(r => estadoDesdeColor(r.color) === 'Reservado'),
      'No usar': registrosDelOperador.filter(r => estadoDesdeColor(r.color) === 'No usar'),
    };

    // Nombre del operador
    doc.setFontSize(12);
    doc.setTextColor(0, 102, 204); // azul oscuro
    doc.text(`Operador: ${operador}`, 14, startY);
    startY += 6;

    for (const [estado, filas] of Object.entries(secciones)) {
      if (filas.length === 0) continue;

      doc.setFontSize(10);
switch (estado) {
  case 'Montado':
    doc.setTextColor(220, 53, 69); // rojo
    break;
  case 'Reservado':
    doc.setTextColor(255, 152, 0); // naranja
    break;
  case 'No usar':
    doc.setTextColor(33, 33, 33); // negro/gris oscuro
    break;
  default:
    doc.setTextColor(80);
}
doc.text(`• ${estado}`, 16, startY);
startY += 4;


     const datos = filas.map(row => [
  row.matricula,
  row.carretera,
  row.provincia,
  row.lineas,
  row.zona,
  row.modelo,
  row.campania || '',
  formatDate(row.fechaInicio),
  formatDate(row.fechaFin),
]);



      // @ts-ignore
      autoTable(doc, {
        head: [columnas],
        body: datos,
        startY,
        styles: { fontSize: 8 },
        theme: 'grid',
        margin: { left: 14, right: 14 },
      });

      // @ts-ignore
      startY = doc.lastAutoTable.finalY + 10;

      if (startY > 260) {
        doc.addPage();
        startY = 20;
      }
    }

    startY += 8;
  }

  const nombreArchivo = mesSeleccionado
    ? `ResumenPorOperador_${mesSeleccionado}.pdf`
    : 'buses_por_operador.pdf';

    // Añadir numeración de páginas
const pageCount = (doc as any).getNumberOfPages();


for (let i = 1; i <= pageCount; i++) {
  doc.setPage(i);
  doc.setFontSize(8);
  doc.setTextColor(100);
  doc.text(`Página ${i} de ${pageCount}`, doc.internal.pageSize.getWidth() - 50, doc.internal.pageSize.getHeight() - 10);
}


  doc.save(nombreArchivo);
};








useEffect(() => {
  setFilterOperador("Todos");
  setFilterZona("Todos");
  setFilterProvincia("Todos");
  setFilterModelo("Todos");
  setFilterTrasera("Todos");
  setFilterCampania("Todos");
}, [filterLinea]);


useEffect(() => {
  // Si el valor actual no está en los disponibles, lo resetea a "Todos"
  if (!modelosDisponibles.includes(filterModelo)) setFilterModelo("Todos");
  if (!traserasDisponibles.includes(filterTrasera)) setFilterTrasera("Todos");
  if (!campaniasDisponibles.includes(filterCampania)) setFilterCampania("Todos");
}, [modelosDisponibles, traserasDisponibles, campaniasDisponibles]);

useEffect(() => {
  if (
    filterModelo !== "Todos" &&
    !data.some((r) => r.modelo === filterModelo)
  ) {
    setFilterModelo("Todos");
  }

  if (
    filterTrasera !== "Todos" &&
    !data.some((r) => r.trasera === filterTrasera)
  ) {
    setFilterTrasera("Todos");
  }

  if (
    filterCampania !== "Todos" &&
    !data.some((r) => r.campania === filterCampania)
  ) {
    setFilterCampania("Todos");
  }

  if (
    filterLinea !== "Todos" &&
    !data.some((r) => r.lineas === filterLinea)
  ) {
    setFilterLinea("Todos");
  }

  if (
    filterOperador !== "Todos" &&
    !data.some((r) => r.operador === filterOperador)
  ) {
    setFilterOperador("Todos");
  }

  if (
    filterZona !== "Todos" &&
    !data.some((r) => r.zona === filterZona)
  ) {
    setFilterZona("Todos");
  }

  if (
    filterProvincia !== "Todos" &&
    !data.some((r) => r.provincia === filterProvincia)
  ) {
    setFilterProvincia("Todos");
  }
}, [data]);







  

  useEffect(() => {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0); // Normalizar para comparar solo por fecha

  const fetchData = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/Corporalia/v1/carreteras/carretera/Salamanca`);

      const savedColors = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || "{}");

      const formattedData: Row[] = response.data.map((row: any) => {
        let color: Color = "white";

        if (["white", "orange", "black", "red"].includes(row.color)) {
          color = row.color; // ✅ Prioriza color del backend
        } else if (savedColors[row.n_flota]) {
          color = savedColors[row.n_flota]; // Solo si el backend no tiene color válido
        }

        return {
          campania: row.campania || "",
          n_flota: row.n_flota || "",
          base: row.base || "",
          carretera: row.carretera || "",
          provincia: row.provincia || "",
          zona: row.zona || "",
          der_delantera: row.der_delantera || "",
          der_plus: row.der_plus || "",
          der_trasera: row.der_trasera || "",
          extra: row.extra || "",
          izq_delantera: row.izq_delantera || "",
          izq_plus: row.izq_plus || "",
          izq_trasera: row.izq_trasera || "",
          lineas: row.lineas || "",
          matricula: row.matricula || "",
          modelo: row.modelo || "",
          operador: row.operador || "",
          plantilla: row.plantilla || "",
          trasera: row.trasera || "",
          info_plus: row.info_plus || "",
          observaciones: row.observaciones || "",
          fechaInicio: row.fechaInicio ?? "",
          fechaFin: row.fechaFin ?? "",
          color,
        };
      });

      setData(formattedData);
      console.log("Datos cargados:", formattedData);
      setFechaSeleccionada(hoy); // ✅ Predeterminar el día actual

      // ✅ Mostrar toasts para campañas caducadas
      const caducadas = formattedData.filter((row) => {
        if (!row.fechaFin) return false;

        const fin = new Date(row.fechaFin);
        if (isNaN(fin.getTime())) return false;

        fin.setHours(23, 59, 59, 999);
        return fin < hoy;
      });

      caducadas.forEach((row) => {
        if (!avisadasRef.current.has(row.n_flota)) {
          toast.warn(`⚠️ La campaña con código ${row.n_flota} ha caducado.`);
          avisadasRef.current.add(row.n_flota);
        }
      });

    } catch (err) {
      toast.error("Error al cargar los datos de Málaga.");
    }
  };

  fetchData();
}, []);


  useEffect(() => {
  if (!fechaSeleccionada || data.length === 0) return;

  const seleccion = new Date(fechaSeleccionada);
  seleccion.setHours(0, 0, 0, 0);

  const caducadasParaFechaSeleccionada = data.filter((row) => {
    if (!row.fechaFin) return false;

    const fin = new Date(completarSegundos(row.fechaFin));
    fin.setHours(0, 0, 0, 0);

    return fin < seleccion && !avisadasRef.current.has(row.n_flota);
  });

  caducadasParaFechaSeleccionada.forEach((row) => {
    toast.warn(`⚠️ La campaña con código ${row.n_flota} ha caducado en esta fecha.`);
    avisadasRef.current.add(row.n_flota);
  });
}, [fechaSeleccionada, data]);



  const normalizarFecha = (f: Date | null) => {
  if (!f) return null;
  const fecha = new Date(f);
  fecha.setHours(0, 0, 0, 0);
  return fecha;
};

  
  
  

  const completarSegundos = (fecha: string | null | undefined): string => {
  if (!fecha || typeof fecha !== "string") return "";

  try {
    const [datePart, timePart] = fecha.split("T");
    if (!datePart || !timePart) return "";

    const [hh, mm, ss] = timePart.split(":");
    const hora = hh || "00";
    const minutos = mm || "00";
    const segundos = ss ?? "00";

    return `${datePart}T${hora}:${minutos}:${segundos}`;
  } catch {
    return "";
  }
};






  

const handleSave = async () => {
  try {
    const datosLimpios = data.map((row) => ({
  ...row,
  base: row.base || "",
  carretera: row.carretera || "",
  provincia: row.provincia || "",
  zona: row.zona || "",
  der_delantera: row.der_delantera || "",
  der_plus: row.der_plus || "",
  der_trasera: row.der_trasera || "",
  extra: row.extra || "",
  izq_delantera: row.izq_delantera || "",
  izq_plus: row.izq_plus || "",
  izq_trasera: row.izq_trasera || "",
  lineas: row.lineas || "",
  matricula: row.matricula || "",
  modelo: row.modelo || "",
  operador: row.operador || "",
  plantilla: row.plantilla || "",
  trasera: row.trasera || "",
  info_plus: row.info_plus || "",
  observaciones: row.observaciones || "",
  campania: row.campania || "",
  fechaInicio: row.fechaInicio ? completarSegundos(row.fechaInicio) : null,
  fechaFin: row.fechaFin ? completarSegundos(row.fechaFin) : null,
  color: row.color || "white", // ✅ Añadir esta línea
}));


    console.log("🔍 Datos que se van a guardar:", datosLimpios);

    for (const row of datosLimpios) {
  if (!row.n_flota) {
    toast.warn("Fila sin código no se ha guardado.");
    continue;
  }

  // ✅ Este log es el que debes ver en consola
  console.log("🧪 Enviando fila:", row);
  console.log("🕒 FechaInicio:", row.fechaInicio, "Tipo:", typeof row.fechaInicio);
  console.log("🕒 FechaFin:", row.fechaFin, "Tipo:", typeof row.fechaFin);

  try {
    const res = await axios.post("/Corporalia/v1/carreteras", row);
    console.log("✅ Guardado:", row.n_flota, res.status);
  } catch (err) {
    console.error("❌ Error guardando:", row.n_flota, err);
    toast.error(`Error guardando ${row.n_flota}`);
  }
}


    toast.success("✅ Cambios guardados correctamente.");
  } catch (error) {
    console.error("⛔ Error general en handleSave:", error);
    toast.error("Error al guardar los datos.");
  }
};

const handleReset = (index: number) => {
  setData((prevData) => {
    const newData = [...prevData];
    const n_flota = newData[index].n_flota;

    // 🔴 Elimina el color guardado del localStorage
    localStorage.removeItem(`color-${n_flota}`);

    // 🔄 Resetea visualmente y funcionalmente la fila
    newData[index] = {
      ...newData[index],
      fechaInicio: "",
      fechaFin: "",
      campania: "",
      observaciones: "",
      color: "white",
    };

    return newData;
  });
};





  const addRow = () => {
  setData((prev) => [
    ...prev,
    {
      n_flota: "", 
      carretera: "Salamanca",
      provincia: "CastillayLeon",
      zona: "",
      operador: "",
      lineas: "",
      matricula: "",
      base: "",
      modelo: "",
      plantilla: "",
      extra: "",
      trasera: "",
      izq_delantera: "",
      izq_plus: "",
      izq_trasera: "",
      der_delantera: "",
      der_plus: "",
      der_trasera: "",
      campania: "",
      info_plus: "",
      observaciones: "",
      fechaInicio: "",
      fechaFin: "",
      color: "white",
    },
  ]);
  toast.success("Fila añadida correctamente!");
};


  const handleInputChange = (index: number, field: keyof Row, value: string) => {
    setData((prevData) => {
      const newData = [...prevData];
      newData[index] = { ...newData[index], [field]: value };
      console.log("➡️ Editando:", newData[index]); // 👈 AÑADE ESTO
      return newData;
    });
  };

  const theadStyle: React.CSSProperties = {
    position: "sticky",
    top: 0,
    backgroundColor: "#ddd",
    zIndex: 2,
  };
  

  const handleDelete = async (n_flota: string) => {
    const confirmDelete = window.confirm(`¿Eliminar la fila con código ${n_flota}?`);
    if (!confirmDelete) return;

    try {
      const response = await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/Corporalia/v1/carreteras/${n_flota}`);

      if (response.status === 204) {
        setData((prevData) => prevData.filter((row) => row.n_flota !== n_flota));
        const savedColors = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || "{}");
        delete savedColors[n_flota];
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(savedColors));
        toast.success("Fila eliminada correctamente!");
      } else {
        setError("No se pudo eliminar la fila. Código: " + response.status);
      }
    } catch (error) {
      console.error("Error al eliminar los datos:", error);
      setError("Error al eliminar los datos.");
    }
  };
  
  
  type CalendarTableProps = {
  rows: Row[];
  filters: { [key: string]: string };
  setFilters: React.Dispatch<React.SetStateAction<{ [key: string]: string }>>;
  handleInputChange: (index: number, field: keyof Row, value: string) => void;
};

const CalendarTable: React.FC<CalendarTableProps> = ({ rows, filters, setFilters, handleInputChange }) => {
  const campos = [
    "n_flota", "carretera", "provincia", "zona", "operador", "lineas", "matricula", "base", "modelo", "plantilla", "extra", "trasera",
    "izq_delantera", "izq_plus", "izq_trasera", "der_delantera", "der_plus", "der_trasera", "campania", "info_plus", "observaciones",
    "fechaInicio", "fechaFin"
  ];

  const theadStyle: React.CSSProperties = {
    position: "sticky",
    top: 0,
    backgroundColor: "#ddd",
    zIndex: 2,
    height: "50px",
  };

  const filteredRows = rows.filter((row) => {
    return Object.entries(filters).every(([key, value]) => {
      if (value === "Todos") return true;
      const rowValue = (row as any)[key];
      return rowValue?.toString().trim().toLowerCase() === value.toLowerCase();
    });
  });

  const resetFilters = () => {
    const cleanFilters: { [key: string]: string } = {};
    campos.forEach((campo) => {
      cleanFilters[campo] = "Todos";
    });
    setFilters(cleanFilters);
  };

  return (
    <div style={{
      overflowX: "auto",
      overflowY: "auto",
      width: "100%",
      marginBottom: 30,
      maxHeight: 300,
      border: "1px solid #ccc",
      borderRadius: "6px"
    }}>
      <div style={{ marginBottom: 10 }}>
        <button onClick={resetFilters} style={{
          padding: "6px 10px",
          borderRadius: "5px",
          backgroundColor: "#007bff",
          color: "white",
          fontWeight: "bold",
          border: "none",
          cursor: "pointer"
        }}>
          🔄 Limpiar filtros
        </button>
      </div>

      <table style={{ width: "max-content", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={theadStyle}>Acciones</th>
            {campos.map((label, i) => (
              <th key={i} style={theadStyle}>{label}</th>
            ))}
          </tr>

          <tr>
            <td></td>
            {campos.map((field, i) => {
              const values = [...new Set(rows.map((r) => r[field as keyof Row]))]
                .filter(Boolean)
                .sort((a, b) => a?.toString().localeCompare(b?.toString()));

              return (
                <td key={i}>
                  <select
                    value={filters[field] || "Todos"}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        [field]: e.target.value,
                      }))
                    }
                    style={{
                      width: "100%",
                      padding: "4px",
                      backgroundColor: "#f0f0f0",
                      fontSize: "14px",
                    }}
                  >
                    <option value="Todos">Todos</option>
                    {values.map((v) => (
                      <option key={v} value={v}>{v}</option>
                    ))}
                  </select>
                </td>
              );
            })}
          </tr>
        </thead>

        <tbody>
          {filteredRows.map((row, index) => (
            <tr key={index} style={{ backgroundColor: row.color }}>
              <td>
                {/* Aquí puedes insertar tus botones de acción personalizados */}
              </td>
              {campos.map((field) => (
                <td key={field}>
                  <input
                    type={field === "fechaInicio" || field === "fechaFin" ? "datetime-local" : "text"}
                    value={(row as any)[field] || ""}
                    onChange={(e) =>
                      handleInputChange(index, field as keyof Row, e.target.value)
                    }
                    style={{
                      padding: "5px",
                      borderRadius: "4px",
                      border: "1px solid #ccc",
                      backgroundColor: "#f9f9f9",
                      width: "100%",
                    }}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
  
  let toastMostrado = false;

  const handleColorChange = (index: number, color: Color) => {
  setData((prevData) => {
    const newData = [...prevData];
    const row = newData[index];

    // ⚠️ Validar que haya fechas antes de aplicar un color que no sea blanco
    if (
      color !== "white" &&
      (!row.fechaInicio || !row.fechaFin)
    ) {
      toast.warning("⚠️ Debes establecer fecha de inicio y fin antes de aplicar una accion");
      return prevData; // 🚫 Bloqueamos el cambio
    }

    // ✅ Si es color blanco o fechas válidas, permitir el cambio
    if (color === "white") {
      newData[index] = {
        ...row,
        color,
        fechaInicio: "",
        fechaFin: "",
        campania: "",
        observaciones: "",
      };
    } else {
      newData[index] = {
        ...row,
        color,
      };
    }

    return newData;
  });
};


  const parseDate = (input: string | null | undefined): Date | null => {
  const fechaStr = completarSegundos(input);
  if (!fechaStr) return null;

  const d = new Date(fechaStr);
  return isNaN(d.getTime()) ? null : d;
};



  const isInRange = (row: Row, date: Date): boolean => {
  const inicio = parseDate(row.fechaInicio);
  const fin = parseDate(row.fechaFin);

  if (!inicio || !fin) return false;

  // Normalizamos todas las fechas a medianoche
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  inicio.setHours(0, 0, 0, 0);
  fin.setHours(0, 0, 0, 0);

  return inicio <= d && d <= fin;
};


  const filteredData = data.filter(
    (row) =>
      (filterColor === "Todos" || row.color === filterColor) &&
      (filterMunicipio === "Todos" || row.provincia === filterMunicipio)
 
      
  );

  const disponibles = data.filter(
    (row) => fechaSeleccionada && isInRange(row, fechaSeleccionada) && row.color === "white"
  );

  const ocupados = data.filter(
    (row) => fechaSeleccionada && isInRange(row, fechaSeleccionada) && row.color !== "white"
  );

  const sinFecha = data.filter((row) => !row.fechaInicio || !row.fechaFin);

  const conteo = {
    nousar: data.filter((r) => r.color === "black").length,
    reservado: data.filter((r) => r.color === "orange").length,
    montado: data.filter((r) => r.color === "red").length,
    libres: data.filter((r) => r.color === "white").length,
    total: data.length,
  };

  return (
  <div style={containerStyle}>
    <style>
      {`
       body, button, input, select, h1, h2, h3, h4, h5, h6, table, td, th {
    font-family: 'Fredoka', sans-serif;
    font-weight: 600;
    font-size: 16px;
  }
        }
      `}
    </style>

    <h2 style={titleStyle}>Salamanca</h2>


  <div
  style={{
    display: "flex",
    justifyContent: "flex-start",
    flexWrap: "wrap",
    gap: "12px",
    padding: "16px",
    backgroundColor: "#eaf8ff",
    boxShadow: "0 4px 10px rgba(0, 0, 0, 0.08)",
    borderRadius: "12px",
  }}
>
  {/* Volver Atrás */}
  <button
    onClick={() => window.history.back()}
    style={{
      padding: "10px 20px",
      borderRadius: "10px",
      background: "linear-gradient(45deg, #ff4d4d, #d11a2a)",
      color: "white",
      fontWeight: "bold",
      fontSize: "15px",
      border: "none",
      cursor: "pointer",
      boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
      transition: "all 0.2s ease-in-out",
    }}
    onMouseOver={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
    onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
  >
    🔙 Volver Atrás
  </button>

  {/* Guardar Cambios */}
  <button
    onClick={handleSave}
    style={{
      padding: "10px 20px",
      borderRadius: "10px",
      background: "linear-gradient(45deg, #28a745, #1e7e34)",
      color: "white",
      fontWeight: "bold",
      fontSize: "15px",
      border: "none",
      cursor: "pointer",
      boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
      transition: "all 0.2s ease-in-out",
    }}
    onMouseOver={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
    onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
  >
    💾 Guardar Cambios
  </button>

  {/* Añadir Nueva Fila */}
  <button
    onClick={addRow}
    style={{
      padding: "10px 20px",
      borderRadius: "10px",
      background: "linear-gradient(45deg, #007bff, #0056b3)",
      color: "white",
      fontWeight: "bold",
      fontSize: "15px",
      border: "none",
      cursor: "pointer",
      boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
      transition: "all 0.2s ease-in-out",
    }}
    onMouseOver={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
    onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
  >
    ➕ Añadir Nueva Fila
  </button>

  {/* Vista Calendario */}
  <button
    onClick={() => setVista("calendario")}
    style={{
      padding: "10px 20px",
      borderRadius: "10px",
      background: vista === "calendario" ? "#007bff" : "#f0f0f0",
      color: vista === "calendario" ? "white" : "#333",
      fontWeight: "bold",
      fontSize: "15px",
      border: vista === "calendario" ? "none" : "1px solid #ccc",
      cursor: "pointer",
      boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
      transition: "all 0.2s ease-in-out",
    }}
    onMouseOver={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
    onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
  >
    📅 Calendario
  </button>

  {/* Vista Historial */}
  <button
    onClick={() => setVista("resumen")}
    style={{
      padding: "10px 20px",
      borderRadius: "10px",
      background: vista === "resumen" ? "#339af0" : "#f0f0f0",
      color: vista === "resumen" ? "white" : "#333",
      fontWeight: "bold",
      fontSize: "15px",
      border: vista === "resumen" ? "none" : "1px solid #ccc",
      cursor: "pointer",
      boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
      transition: "all 0.2s ease-in-out",
    }}
    onMouseOver={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
    onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
  >
    📊 Historial anual
  </button>

  {/*
<button
  onClick={() => setVista("general")}
  style={vista === "general" ? activeTabButton : tabButton}
>
  Vista General
</button>
*/}


  {/* Exportar Excel y PDF */}
  <div style={{ marginLeft: "1rem", display: "flex", alignItems: "flex-start", gap: "30px" }}>
    {/* Exportar a Excel */}
    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
      <label style={{ fontWeight: "bold", marginBottom: "5px", color: "#1a7f37" }}>
        🟢 Exportar a Excel
      </label>
      <input
        type="month"
        onChange={(e) => exportarMesAExcel(data, e.target.value)}
        style={{
          padding: "6px 10px",
          borderRadius: "6px",
          border: "1px solid #ccc",
          backgroundColor: "#e8f5e9",
          color: "#1a7f37",
          fontWeight: "bold",
        }}
      />
    </div>

    {/* Exportar a PDF */}
    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
      <label style={{ fontWeight: "bold", marginBottom: "5px", color: "#c62828" }}>
        🔴 Exportar a PDF
      </label>
      <input
        type="month"
        onChange={(e) => {
          const mesSeleccionado = e.target.value;
          if (!mesSeleccionado) return;

          const [añoStr, mesStr] = mesSeleccionado.split("-");
          const año = parseInt(añoStr, 10);
          const mes = parseInt(mesStr, 10) - 1;

          const primerDia = new Date(año, mes, 1);
          const ultimoDia = new Date(año, mes + 1, 0);

          const datosFiltrados = data.filter((row) => {
            if (row.color === "white") return false;
            const inicio = row.fechaInicio ? new Date(row.fechaInicio) : null;
            const fin = row.fechaFin ? new Date(row.fechaFin) : null;
            return (
              inicio &&
              fin &&
              !isNaN(inicio.getTime()) &&
              !isNaN(fin.getTime()) &&
              fin >= primerDia &&
              inicio <= ultimoDia
            );
          });

          exportToPDF(datosFiltrados, mesSeleccionado);
        }}
        style={{
          padding: "6px 10px",
          borderRadius: "6px",
          border: "1px solid #ccc",
          backgroundColor: "#ffebee",
          color: "#c62828",
          fontWeight: "bold",
        }}
      />
    </div>
  </div>
</div>

  



        

      {/*
      {vista === "general" && (
  <>
    <div style={filterGroupStyle}>
    <select value={filterColor} onChange={(e) => setFilterColor(e.target.value)} style={selectStyle}>
  <option value="Todos">Todos</option>
  <option value="orange">Reservado</option>
  <option value="black">No usar</option> // ← CAMBIAR ESTO
  <option value="red">Montado</option>
  <option value="white">Libres</option>
</select>


      <select value={filterMunicipio} onChange={(e) => setFilterMunicipio(e.target.value)} style={selectStyle}>
        <option value="Todos">Todos</option>
        {[...new Set(data.map((r) => r.municipio))].sort().map((m) => (
          <option key={m} value={m}>{m}</option>
        ))}
      </select>

      <select value={filterProducto} onChange={(e) => setFilterProducto(e.target.value)} style={selectStyle}>
        <option value="Todos">Todos</option>
        {[...new Set(data.map((r) => r.producto))].sort().map((p) => (
          <option key={p} value={p}>{p}</option>
        ))}
      </select>
    </div>

    <div style={counterStyle}>
  <span style={{ marginRight: 15, color: "black" }}>⚫ No usar: {conteo.nousar}</span>
  <span style={{ marginRight: 15 }}>🟠 Reservado: {conteo.reservado}</span>
  <span style={{ marginRight: 15 }}>🔴 Montado: {conteo.montado}</span>
  <span style={{ marginRight: 15 }}>⚪ Libres: {conteo.libres}</span>
  <span>🟡 Total: {conteo.total}</span>
</div>


    <div style={{ overflowX: "auto", width: "100%" }}>
      <table style={tableStyle}>
        <thead style={theadStyle}>
          <tr>
          <th style={{ position: "sticky", left: 0, backgroundColor: "#ddd", zIndex: 2 }}>Acciones</th>

            <th>Campaña</th>
            <th>Código</th>
            <th>Municipio</th>
            <th>Provincia</th>
            <th>Dirección</th>
            <th>CP</th>
            <th>Observación</th>
            <th>Fecha Inicio</th>
            <th>Fecha Fin</th>
          </tr>
        </thead>
        <tbody>
  {filteredData.map((row, index) => (
    <tr
    key={index}
    style={{
      backgroundColor: (() => {
        const fin = row.fechaFin
          ? new Date(parse(row.fechaFin, "dd/MM/yyyy HH:mm", new Date()).setHours(23, 59, 59, 999))
          : null;
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        return fin && fin < hoy ? "white" : row.color;
      })(),
    }}
  >
    <td style={{ position: "sticky", left: 0, backgroundColor: "#fff", zIndex: 2 }}>
      <div style={actionButtonGroup}>
        {["orange", "black", "red", "white"].map((c) => (
          <button
            key={c}
            onClick={() => handleColorChange(data.indexOf(row), c as Color)}
            style={{
              ...colorButtonStyle,
              backgroundColor: c === "white" ? "#f1f1f1" : c === "black" ? "black" : c,
              color: c === "white" ? "#000" : "#fff",
              border: c === "black" ? "2px solid black" : "none",
            }}
          >
            {c === "orange"
              ? "Reservado"
              : c === "black"
              ? "No usar"
              : c === "red"
              ? "Montado"
              : "Resetear"}
          </button>
        ))}
        <button
          onClick={() => handleDelete(row.codigo)}
          style={{ ...colorButtonStyle, backgroundColor: "red", color: "white" }}
        >
          Eliminar
        </button>
      </div>
    </td>
  
    {["producto", "codigo", "municipio", "provincia", "direccion", "cp", "observaciones", "fechaInicio", "fechaFin"].map((field) => (
      <td key={field}>
        <input
          type={field === "fechaInicio" || field === "fechaFin" ? "datetime-local" : "text"}
          value={(row as any)[field] || ""}
          onChange={(e) =>
            handleInputChange(
              data.indexOf(row),
              field as keyof Row,
              e.target.value
            )
          }
          style={{
            ...inputStyle,
            backgroundColor: "#f9f9f9",
            color: "#333",
            border: "1px solid #ccc",
            borderRadius: "6px",
            fontWeight: 500,
            padding: "5px",
            width: field === "direccion" || field === "observaciones" ? "250px" : "100%",
          }}
        />
      </td>
    ))}
  </tr>
  
  ))}
</tbody>

      </table>
    </div>
  </>
)}
  */}

  

{vista === "total" && (
  <div style={{ textAlign: "center", marginTop: "20px" }}>
    <h3 style={{ marginBottom: 20 }}>Total anual de mupis por estado</h3>

    <div style={{ maxWidth: "700px", margin: "0 auto" }}>
      <Bar
        ref={(el) => {
          if (el) chartRef.current = el;
        }}
        data={{
          labels: ["Montados", "Libres"],
          datasets: [
            {
              label: "Total anual",
              data: [
                generarResumenAnual().Montado.reduce((a, b) => a + b, 0),
                generarResumenAnual().Libres.reduce((a, b) => a + b, 0),
              ],
              backgroundColor: ["red", "white"],
              borderColor: ["#900", "#ccc"],
              borderWidth: 1,
            },
          ],
        }}
        options={{
          indexAxis: "y",
          responsive: true,
          plugins: {
            legend: { display: false },
            title: {
              display: true,
              text: "Totales anuales de Montados vs. Libres",
              font: { size: 18 },
            },
          },
          scales: {
            x: { beginAtZero: true },
            y: { ticks: { font: { size: 14 } } },
          },
        }}
        height={220}
      />

      <button
        onClick={() => {
          const chart = chartRef.current;
          if (chart) {
            const url = chart.toBase64Image();
            const link = document.createElement("a");
            link.href = url;
            link.download = "grafico-total-anual.png";
            link.click();
          }
        }}
        style={{
          marginTop: "15px",
          padding: "8px 12px",
          fontWeight: "bold",
          borderRadius: "6px",
          backgroundColor: "#007bff",
          color: "white",
          border: "none",
          cursor: "pointer",
        }}
      >
        📥 Descargar gráfico
      </button>
    </div>
  </div>
)}






{vista === "resumen" && (
  <div style={{ textAlign: "center", marginTop: "80px" }}>
    <h3 style={{ marginBottom: 20, fontSize: "2rem" }}>
      📊 Resumen anual: Montados vs Libres
    </h3>

    {/* Selector de año */}
    <select
      value={anioSeleccionado}
      onChange={(e) => setAnioSeleccionado(parseInt(e.target.value))}
      style={{
        padding: "10px 16px",
        fontSize: "16px",
        marginBottom: "30px",
        borderRadius: "8px",
        border: "1px solid #ccc",
        backgroundColor: "white",
        fontWeight: "bold"
      }}
    >
      {[2023, 2024, 2025].map((year) => (
        <option key={year} value={year}>
          Ver año {year}
        </option>
      ))}
    </select>

    <div style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "flex-start",
      gap: "40px",
      flexWrap: "wrap"
    }}>
      
      {/* Gráfico + botones */}
      <div style={{
        backgroundColor: "white",
        padding: "30px",
        borderRadius: "16px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        maxWidth: "800px",
        flexGrow: 1
      }}>
        <Bar
          ref={chartRef}
          data={{
            labels: ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"],
            datasets: [
              {
                label: "Montado",
                backgroundColor: "rgba(255, 99, 132, 0.8)",
                borderRadius: 8,
                borderWidth: 1,
                data: generarResumenPorAnio(anioSeleccionado).Montado,
              },
              {
                label: "Libres",
                backgroundColor: "rgba(54, 162, 235, 0.8)",
                borderRadius: 8,
                borderWidth: 1,
                data: generarResumenPorAnio(anioSeleccionado).Libres,
              },
            ],
          }}
          options={{
            responsive: true,
            plugins: {
              legend: {
                position: "top",
                labels: { font: { size: 14 } }
              },
              title: {
                display: true,
                text: `Mupis Montados vs. Libres - Año ${anioSeleccionado}`,
                font: { size: 18 },
              },
              tooltip: {
                callbacks: {
                  label: (context) =>
                    `${context.dataset.label}: ${context.formattedValue}`,
                },
              },
            },
            scales: {
              y: {
                beginAtZero: true,
                ticks: { font: { size: 14 } },
                grid: { color: "#eee" },
              },
              x: {
                ticks: { font: { size: 14 } },
                grid: { color: "#f9f9f9" },
              },
            },
          }}
        />

        {/* Botón imagen */}
        <button
          onClick={() => {
            const chart = chartRef.current;
            if (chart) {
              const url = chart.toBase64Image();
              const link = document.createElement("a");
              link.href = url;
              link.download = `grafico-resumen-${anioSeleccionado}.png`;
              link.click();
            }
          }}
          style={{
            marginTop: "20px",
            padding: "12px 18px",
            fontWeight: "bold",
            borderRadius: "10px",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            cursor: "pointer",
            fontSize: "16px",
            boxShadow: "0 3px 8px rgba(0,0,0,0.2)"
          }}
        >
          📥 Descargar gráfica como imagen
        </button>

        {/* Botón PDF */}
        <button
          onClick={() => {
            const chart = chartRef.current;
            if (chart) {
              const image = chart.toBase64Image();
              const pdf = new jsPDF();
              pdf.addImage(image, "PNG", 15, 40, 180, 100);
              pdf.save(`grafico-resumen-${anioSeleccionado}.pdf`);
            }
          }}
          style={{
            marginTop: "12px",
            padding: "12px 18px",
            fontWeight: "bold",
            borderRadius: "10px",
            backgroundColor: "#28a745",
            color: "white",
            border: "none",
            cursor: "pointer",
            fontSize: "16px",
            boxShadow: "0 3px 8px rgba(0,0,0,0.2)"
          }}
        >
          🧾 Descargar gráfica como PDF
        </button>
      </div>

      {/* Indicadores a la derecha */}
      <div style={{
        backgroundColor: "#fff",
        padding: "30px",
        borderRadius: "16px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        minWidth: "320px",
        fontWeight: "bold",
        fontSize: "18px",
        textAlign: "left",
        lineHeight: "1.8"
      }}>
        <div style={{ fontSize: "20px", marginBottom: "10px" }}>
          📌 <span style={{ textDecoration: "underline" }}>Indicadores Anuales</span>
        </div>
        <div>🔴 <span style={{ color: "#cc0000" }}>Total Montados:</span> {generarResumenPorAnio(anioSeleccionado).Montado.reduce((a, b) => a + b, 0)}</div>
        <div>⚪ <span style={{ color: "#666" }}>Total Libres:</span> {generarResumenPorAnio(anioSeleccionado).Libres.reduce((a, b) => a + b, 0)}</div>
        <div style={{ marginTop: "18px" }}>
          🧾 <span style={{ color: "#007700" }}>Tasa de ocupación:</span>{" "}
          <span style={{ color: "green" }}>
            {
              (
                (generarResumenPorAnio(anioSeleccionado).Montado.reduce((a, b) => a + b, 0) /
                (generarResumenPorAnio(anioSeleccionado).Montado.reduce((a, b) => a + b, 0) +
                generarResumenPorAnio(anioSeleccionado).Libres.reduce((a, b) => a + b, 0))) * 100
              ).toFixed(1)
            }%
          </span>
        </div>
        <div style={{ marginTop: "18px" }}>
          🏆 <span style={{ color: "#333" }}>Mes con más Montados:</span><br />
          {
            (() => {
              const datos = generarResumenPorAnio(anioSeleccionado).Montado;
              const i = datos.indexOf(Math.max(...datos));
              return ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"][i] + ` (${datos[i]})`;
            })()
          }
        </div>
        <div style={{ marginTop: "18px" }}>
          💡 <span style={{ color: "#333" }}>Mes con más Libres:</span><br />
          {
            (() => {
              const datos = generarResumenPorAnio(anioSeleccionado).Libres;
              const i = datos.indexOf(Math.max(...datos));
              return ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"][i] + ` (${datos[i]})`;
            })()
          }
        </div>

        {/* Comparativa con año anterior */}
        <div style={{
          marginTop: "30px",
          padding: "20px",
          backgroundColor: "#f8f9fa",
          borderRadius: "12px",
          fontSize: "16px",
          fontWeight: "bold",
          color: "#333",
          boxShadow: "0 2px 6px rgba(0,0,0,0.1)"
        }}>
          {(() => {
  const resumenActual = generarResumenPorAnio(anioSeleccionado);
  const resumenPrevio = generarResumenPorAnio(anioSeleccionado - 1);
  const montadoActual = resumenActual.Montado.reduce((a, b) => a + b, 0);
  const montadoPrevio = resumenPrevio.Montado.reduce((a, b) => a + b, 0);
  const libresActual = resumenActual.Libres.reduce((a, b) => a + b, 0);
  const libresPrevio = resumenPrevio.Libres.reduce((a, b) => a + b, 0);
  const ocupacionActual = (montadoActual / (montadoActual + libresActual)) * 100;
  const ocupacionPrevia = (montadoPrevio / (montadoPrevio + libresPrevio)) * 100;

  const diffMontado = montadoActual - montadoPrevio;
  const diffLibres = libresActual - libresPrevio;
  const diffOcupacion = ocupacionActual - ocupacionPrevia;

  const flecha = (valor: number) => valor > 0 ? "⬆️" : valor < 0 ? "⬇️" : "➖";
  const colorTexto = (valor: number) => valor > 0 ? "green" : valor < 0 ? "red" : "#555";

  return (
    <div>
      📈 <strong>Análisis comparativo con {anioSeleccionado - 1}:</strong><br />
      - <strong>Montados:</strong>{" "}
      <span style={{ color: colorTexto(diffMontado) }}>
        {montadoActual} ({flecha(diffMontado)} {Math.abs(diffMontado)})
      </span><br />
      - <strong>Libres:</strong>{" "}
      <span style={{ color: colorTexto(-diffLibres) }}>
        {libresActual} ({flecha(-diffLibres)} {Math.abs(diffLibres)})
      </span><br />
      - <strong>Tasa ocupación:</strong>{" "}
      <span style={{ color: colorTexto(diffOcupacion) }}>
        {ocupacionActual.toFixed(1)}% ({flecha(diffOcupacion)} {Math.abs(diffOcupacion).toFixed(1)}%)
      </span>
    </div>
  );
})()}

        </div>
      </div>
    </div>
  </div>
)}














{vista === "calendario" && (
  
  <div style={{ textAlign: "center" }}>
    <h3 style={{ marginBottom: 10 }}>Selecciona una fecha</h3>
    <div style={{ display: "inline-block", marginBottom: 20 }}>
      

<style>
{`
  .react-calendar__month-view__weekNumbers {
    font-weight: bold;
    color: black;
  }

.react-calendar__month-view__weekNumbers .react-calendar__tile:nth-child(1) {
  transform: translateY(-80px);
}
.react-calendar__month-view__weekNumbers .react-calendar__tile:nth-child(2) {
  transform: translateY(-62px);
}
.react-calendar__month-view__weekNumbers .react-calendar__tile:nth-child(3) {
  transform: translateY(-40px);
}
.react-calendar__month-view__weekNumbers .react-calendar__tile:nth-child(4) {
  transform: translateY(-20px);
}
.react-calendar__month-view__weekNumbers .react-calendar__tile:nth-child(5) {
  transform: translateY(-3px);
}
.react-calendar__month-view__weekNumbers .react-calendar__tile:nth-child(6) {
  transform: translateY(-2px);
}
  }

  .react-calendar__month-view__weekNumbers abbr {
    color: black !important;
    font-size: 14px;
  }

  .react-calendar__tile abbr {
    color: transparent !important;
  }

  .react-calendar__month-view__weekdays {
    color: black;
    font-weight: bold;
  }

  .react-calendar__navigation button {
    color: black;
    font-weight: bold;
    font-size: 16px;
  }

  .react-calendar__month-view__days__day--neighboringMonth {
  display: none;
}

`}
</style>




  <Calendar
    onChange={(date) => setFechaSeleccionada(date as Date)}
    value={fechaSeleccionada}
    showWeekNumbers={true}
    showNeighboringMonth={false}
    
    tileContent={({ date, view }) => {
      if (view === "month") {
        const colores: Color[] = [];

        data.forEach((row) => {
          if (isInRange(row, date) && !colores.includes(row.color)) {
            colores.push(row.color);
          }
        });

        return (
           <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: "-4px" }}>
          <span style={{ color: "black", fontWeight: "bold", fontSize: "14px" }}>
            {date.getDate()}
          </span>
          <div style={{ display: "flex", gap: 2, marginTop: 2 }}>
            {colores.map((color, i) => (
              <span
                key={i}
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  backgroundColor: color,
                  }}
                />
              ))}
            </div>
          </div>
        );
      }
      return null;
    }}
  />



  


    </div>

    {/*
<div style={{ marginTop: 10 }}>
  <label style={{ fontWeight: "bold" }}>
    <input
      type="checkbox"
      checked={mostrarCaducados}
      onChange={(e) => setMostrarCaducados(e.target.checked)}
      style={{ marginRight: 5 }}
    />
    Mostrar solo campañas caducadas
  </label>
</div>
*/}


    {/* 📊 Resumen del{" "}
{filtroPorSemana
  ? `la semana ${getWeek(fechaSeleccionada)}`
  : fechaSeleccionada.toLocaleDateString()} */}


    {/* Resumen por color */}
    {vista === "calendario" && fechaSeleccionada && (
  <div style={{ marginTop: "15px", textAlign: "center", fontWeight: "bold" }}>
    📊 Resumen del{" "}
    {filtroPorSemana
      ? `la semana ${getWeek(fechaSeleccionada)}`
      : fechaSeleccionada.toLocaleDateString()}

    <div style={{ marginTop: "8px", fontSize: "16px", fontWeight: "normal" }}>
      {["orange", "black", "red", "white"].map((color) => {
        const count = data.filter((row) => {
          const enRango = isInRange(row, fechaSeleccionada!);
          return color === "white"
            ? !enRango || row.color === "white"
            : enRango && row.color === color;
        }).length;

        const icono = {
          orange: "🟠",
          black: "⚫",
          red: "🔴",
          white: "⚪",
        }[color];

        const label = {
          orange: "Reservados",
          black: "No usar",
          red: "Montados",
          white: "Libres",
        }[color];

        return (
          <span key={color} style={{ marginRight: "15px" }}>
            {icono} {label}: {count}
          </span>
        );
      })}
    </div>
  </div>
)}



  </div>
)}


    {/* Tus tablas por color empiezan aquí */}
    {vista !== "resumen" && fechaSeleccionada && (

      
      <>
      
      {/* Filtros generales por operador y línea */}
<div
  style={{
    display: "flex",
    flexWrap: "wrap",
    gap: "12px",
    justifyContent: "center",
    marginTop: "20px",
    marginBottom: "10px",
  }}
>
  {/* Este es un patrón reutilizable */}
  {[
  { label: "Provincia", value: filterProvincia, setter: setFilterProvincia, options: provinciasDisponibles },
  { label: "Modelo", value: filterModelo, setter: setFilterModelo, options: modelosDisponibles },
  { label: "Trasera", value: filterTrasera, setter: setFilterTrasera, options: traserasDisponibles },
  { label: "Campaña", value: filterCampania, setter: setFilterCampania, options: campaniasDisponibles },
  { label: "Operador", value: filterOperador, setter: setFilterOperador, options: operadoresDisponibles },
  { label: "Línea", value: filterLinea, setter: setFilterLinea, options: lineasDisponibles },
  { label: "Zona", value: filterZona, setter: setFilterZona, options: zonasDisponibles },
].map(({ label, value, setter, options }, i) => (
  <div key={i} style={{ minWidth: 160 }}>
    <label style={{ fontWeight: "bold", display: "block", marginBottom: 4 }}>{label}</label>
    <select
      value={value}
      onChange={(e) => setter(e.target.value)}
      style={selectStyle}
    >
      <option value="Todos">Todos</option>
      {options.map((opt) => (
        <option key={opt} value={opt}>{opt}</option>
      ))}
    </select>
  </div>
))}


  {/* Botón Limpiar */}
  <div style={{ alignSelf: "flex-end" }}>
    <button
      onClick={() => {
        setFilterLinea("Todos");
        setFilterOperador("Todos");
        setFilterZona("Todos");
        setFilterProvincia("Todos");
        setFilterModelo("Todos");
        setFilterTrasera("Todos");
        setFilterCampania("Todos");
      }}
      style={{
        padding: "10px 16px",
        borderRadius: "6px",
        backgroundColor: "#007bff",
        color: "white",
        fontWeight: "bold",
        border: "none",
        cursor: "pointer",
      }}
    >
      🔄 Limpiar filtros
    </button>
  </div>
</div>




       {["orange", "black", "red", "white"].map((color) => {
  const colorLabels: { [key in Color]: string } = {
    orange: "🟠 Reservados",
    black: "⚫ No usar",
    red: "🔴 Montados",
    white: "⚪ Libres",
  };

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  

  const filtrados = data.filter((r) => {
  const seleccion = new Date(fechaSeleccionada!);
  seleccion.setHours(0, 0, 0, 0);

  const inicio = r.fechaInicio ? new Date(completarSegundos(r.fechaInicio)) : null;
  const fin = r.fechaFin ? new Date(completarSegundos(r.fechaFin)) : null;

  if (inicio) inicio.setHours(0, 0, 0, 0);
  if (fin) fin.setHours(0, 0, 0, 0);

  const enRango = inicio && fin
    ? seleccion >= inicio && seleccion <= fin
    : inicio
    ? seleccion >= inicio
    : fin
    ? seleccion <= fin
    : false;

  const esCaducado = fin && fin < new Date();

  const coincideOperador = filterOperador === "Todos" || r.operador === filterOperador;
  const coincideLinea = filterLinea === "Todos" || r.lineas === filterLinea;
  const coincideZona = filterZona === "Todos" || r.zona === filterZona;
  const coincideProvincia = filterProvincia === "Todos" || r.provincia === filterProvincia;
  const coincideModelo = filterModelo === "Todos" || r.modelo === filterModelo;
  const coincideTrasera = filterTrasera === "Todos" || r.trasera === filterTrasera;
  const coincideCampania = filterCampania === "Todos" || r.campania === filterCampania;

  if (color === "white") {
    return (
      (r.color === "white" || (!r.fechaInicio && !r.fechaFin)) &&
      coincideOperador &&
      coincideLinea &&
      coincideZona &&
      coincideProvincia &&
      coincideModelo &&
      coincideTrasera &&
      coincideCampania
    );
  } else {
    return (
      r.color === color &&
      enRango &&
      (!mostrarCaducados || esCaducado) &&
      coincideOperador &&
      coincideLinea &&
      coincideZona &&
      coincideProvincia &&
      coincideModelo &&
      coincideTrasera &&
      coincideCampania
    );
  }
});









          return (
            <div key={color}>
              
  <h4 style={sectionTitle}>
    {colorLabels[color as Color]} el{" "}
    {fechaSeleccionada.toLocaleDateString()}
  </h4>

  {filtrados.length > 0 ? (
    <div style={{
      maxHeight: "300px",
      overflowY: "auto",
      overflowX: "auto",
      width: "100%",
      marginBottom: 30,
      border: "1px solid #ccc",
      borderRadius: "6px"
    }}>
      <table style={tableStyle}>
        <thead style={{
          position: "sticky",
          top: 0,
          backgroundColor: "#ddd",
          zIndex: 1
        }}>
          <tr>
            <th style={{ position: "sticky", left: 0, backgroundColor: "#ddd", zIndex: 2 }}>Acciones</th>
            <th>n_flota</th>
        <th>Carretera</th>
        <th>Provincia</th>
        <th>Zona</th>
        <th>Operador</th>
        <th>Líneas</th>
        <th>Matrícula</th>
        <th>Base</th>
        <th>Modelo</th>
        <th>Plantilla</th>
        <th>Extra</th>
        <th>Trasera</th>
        <th>Izq Delantera</th>
        <th>Izq Plus</th>
        <th>Izq Trasera</th>
        <th>Der Delantera</th>
        <th>Der Plus</th>
        <th>Der Trasera</th>
        <th>Campaña</th>
        <th>Info Plus</th>
        <th>Observaciones</th>
        <th>Fecha Inicio</th>
        <th>Fecha Fin</th>

          </tr>
        </thead>
        <tbody>
          {filtrados.map((row, index) => (
            <tr
              key={index}
              style={{
                backgroundColor: (() => {
                  const fin = row.fechaFin
                    ? new Date(parse(row.fechaFin, "dd/MM/yyyy HH:mm", new Date()).setHours(23, 59, 59, 999))
                    : null;
                  const hoy = new Date();
                  hoy.setHours(0, 0, 0, 0);
                  return fin && fin < hoy ? "white" : row.color;
                })(),
              }}
            >
              <td style={{ position: "sticky", left: 0, backgroundColor: "#fff", zIndex: 1 }}>
                <div style={actionButtonGroup}>
                  {["orange", "black", "red", "white"].map((c) => (
                    <button
                      key={c}
                      onClick={() => handleColorChange(data.indexOf(row), c as Color)}
                      style={{
                        ...colorButtonStyle,
                        backgroundColor: c === "white" ? "#f1f1f1" : c === "black" ? "black" : c,
                        color: c === "white" ? "#000" : "#fff",
                        border: c === "black" ? "2px solid black" : "none",
                      }}
                    >
                      {c === "orange"
                        ? "Reservado"
                        : c === "black"
                        ? "No usar"
                        : c === "red"
                        ? "Montado"
                        : "Resetear"}
                    </button>
                  ))}
                  <button
                    onClick={() => handleDelete(row.n_flota)}
                    style={{ ...colorButtonStyle, backgroundColor: "red", color: "white" }}
                  >
                    Eliminar
                  </button>
                </div>
              </td>

              {["n_flota",
                "carretera",
                "provincia",
                "zona",
                "operador",
                "lineas",
                "matricula",
                "base",
                "modelo",
                "plantilla",
                "extra",
                "trasera",
                "izq_delantera",
                "izq_plus",
                "izq_trasera",
                "der_delantera",
                "der_plus",
                "der_trasera",
                "campania",
                "info_plus",
                "observaciones",
                "fechaInicio",
                "fechaFin"].map((field) => (
                <td key={field}>
                  <input
                    type={field === "fechaInicio" || field === "fechaFin" ? "datetime-local" : "text"}
                    value={(row as any)[field] || ""}
                    onChange={(e) =>
                      handleInputChange(
                        data.indexOf(row),
                        field as keyof Row,
                        e.target.value
                      )
                    }
                    style={{
                      ...inputStyle,
                      backgroundColor: "#f9f9f9",
                      color: "#333",
                      border: "1px solid #ccc",
                      borderRadius: "6px",
                      fontWeight: 500,
                      padding: "5px",
                      width: field === "base" || field === "observacion" ? "250px" : "100%",
                    }}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  ) : (
    <p style={{
  fontStyle: "italic",
  color: "#666",
  textAlign: "center",
  padding: "10px 0"
}}>
  Ninguno
</p>

  )}
</div>

          );
        })}
      </>
    )}
    <ToastContainer position="top-right" autoClose={3000} />
  </div>
)}



      
  
// Estilos (idénticos a Barcelona)
const containerStyle: React.CSSProperties = {
  padding: "20px",
  maxWidth: "100%",
  margin: "auto",
  background: "linear-gradient(to bottom right, #e0f7ff, #d0eaff)",
  borderRadius: "8px",
  minHeight: "100vh",
};

const titleStyle: React.CSSProperties = {
  textAlign: "center",
  marginBottom: "20px",
  fontSize: "1.8rem",
  fontWeight: "bold"
};

const topButtonGroupStyle: React.CSSProperties = {
  position: "sticky",
  top: 0,
  backgroundColor: "#e0f7ff",
  padding: "10px 0",
  display: "flex",
  gap: "10px",
  zIndex: 1000,
  justifyContent: "flex-start",
  alignItems: "center",
  borderBottom: "2px solid #ccc",
  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
};

const tabButton: React.CSSProperties = {
  padding: "10px 15px",
  borderRadius: "8px",
  border: "none",
  fontWeight: "bold",
  cursor: "pointer",
  backgroundColor: "#007bff",
  color: "white",
  boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
};

const activeTabButton = { ...tabButton, backgroundColor: "#0056b3" };

const tableStyle: React.CSSProperties = {
  width: "max-content",
  borderCollapse: "collapse",
  textAlign: "left",
  marginTop: 20,
};

const theadStyle: React.CSSProperties = {
  backgroundColor: "#ddd",
  textAlign: "center"
};

const inputStyle: React.CSSProperties = {
  padding: "5px",
  borderRadius: "4px",
  border: "1px solid #ccc",
};

const colorButtonStyle: React.CSSProperties = {
  border: "none",
  borderRadius: "5px",
  padding: "6px",
  cursor: "pointer",
  fontWeight: "bold",
  boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.2)",
};

const actionButtonGroup: React.CSSProperties = {
  display: "flex",
  gap: "5px",
  flexWrap: "wrap",
};

const filterGroupStyle: React.CSSProperties = {
  marginBottom: "20px",
  textAlign: "center",
  display: "flex",
  gap: "20px",
  justifyContent: "center",
  flexWrap: "wrap"
};

const selectStyle: React.CSSProperties = {
  padding: "8px",
  borderRadius: "5px",
  fontWeight: "bold",
};

const sectionTitle: React.CSSProperties = {
  textAlign: "center",
  fontWeight: "bold",
  marginTop: 30,
  marginBottom: 10,
};

const counterStyle: React.CSSProperties = {
  marginBottom: 15,
  textAlign: "center",
  fontWeight: "bold",
  fontSize: "1.1rem"
};

const addRowButtonStyle = { ...colorButtonStyle, backgroundColor: "#007BFF", color: "white" };
const saveButtonStyle = { ...colorButtonStyle, backgroundColor: "#28a745", color: "white" };
const backButtonStyle = { ...colorButtonStyle, backgroundColor: "#dc3545", color: "white" };

export default Salamanca

