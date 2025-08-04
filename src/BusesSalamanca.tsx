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
import CalendarTable from "./CalendarTable";






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
  
  
  n_flota: string;
  campania: string;
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
  const [historial, setHistorial] = useState<Row[]>([]);

  
  const [isEditing, setIsEditing] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  


// Para los botones de acción
const buttonLabels: Record<Color, string> = {
  orange: "Reservado",
  black:  "No usar",
  red:    "Montado",
  white:  "Resetear",      // ← aquí pones Libre
};

// Para los títulos de sección (el que dice “🔘 Resetear el 1/8/2025”)
const sectionLabels: Record<Color, string> = {
  orange: "Reservados",
  black:  "No usar",
  red:    "Montados",
  white:  "Libres",   // ← aquí sigue siendo Resetear
};

 



const [filteredRows, setFilteredRows] = useState<Row[]>([]);
const [fechaDesde, setFechaDesde] = useState<Date | null>(null);
const [fechaHasta, setFechaHasta] = useState<Date | null>(null);
const [mostrarFuturos, setMostrarFuturos] = useState(true);

const [mostrarHistorial, setMostrarHistorial] = useState(false);
const [nFlotaSeleccionado, setNFlotaSeleccionado] = useState<string | null>(null);

const abrirHistorial = (nFlota: string) => {
  setNFlotaSeleccionado(nFlota);
  const key = `historial-${nFlota}`;
  const h: Row[] = JSON.parse(localStorage.getItem(key) || "[]");
  setHistorial(h);
  setMostrarHistorial(true);
};


const cerrarHistorial = () => {
  setMostrarHistorial(false);
  setNFlotaSeleccionado(null);
};



const [fechaSeleccionada, setFechaSeleccionada] = useState<Date | null>(null);
const rows = filteredRows;



const historialFiltrado =
  fechaSeleccionada && nFlotaSeleccionado
    ? data
        .filter(
          (row) =>
            row.n_flota === nFlotaSeleccionado &&
            (row.color === "red" || row.color === "orange") &&  // opcional: sólo montados/reservados
            row.fechaFin &&
            new Date(row.fechaFin) < fechaSeleccionada
        )
        .sort(
          (a, b) =>
            new Date(b.fechaInicio).getTime() -
            new Date(a.fechaInicio).getTime()
        )
    : [];


// Guarda en localStorage el estado ANTERIOR de la fila
function logHistorial(oldRow: Row) {
  const key = `historial-${oldRow.n_flota}`;
  const h: Row[] = JSON.parse(localStorage.getItem(key) || "[]");
  h.push({ ...oldRow });
  localStorage.setItem(key, JSON.stringify(h));
}



  

  
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
const [originalData, setOriginalData] = useState<Row[]>([]); // NUEVO
useEffect(() => {
  axios.get(`${import.meta.env.VITE_BACKEND_URL}/Corporalia/v1/carreteras/carretera/Salamanca`)
    .then((res) => {
      setData(res.data);
      setOriginalData(res.data); // Guardamos una copia original para filtros/reset
    })
    .catch((error) => {
      console.error("Error al obtener datos de Salamanca:", error);
    });
}, []);



  // 0️⃣ Ref para asegurarnos de hacer sólo un pushState
  const hasPushedState = useRef(false);

  // 1️⃣ Aviso al recargar o cerrar pestaña
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isDirty]);

  // 2️⃣ Aviso al pulsar “Atrás”/“Adelante” y manejo de un solo click
  useEffect(() => {
    if (!isDirty) {
      hasPushedState.current = false;
      return;
    }

    // Solo una vez: insertamos un estado extra en el historial
    if (!hasPushedState.current) {
      window.history.pushState(null, "", window.location.href);
      hasPushedState.current = true;
    }

    const handlePopState = (e: PopStateEvent) => {
      if (!isDirty) return;

      const confirmed = window.confirm(
        "Tienes cambios sin guardar. ¿Seguro que quieres salir sin guardar?"
      );

      if (!confirmed) {
        // Usuario canceló: volvemos a empujar el mismo estado
        window.history.pushState(null, "", window.location.href);
      } else {
        // Usuario confirmó: limpiamos y navegamos atrás de verdad
        window.removeEventListener("popstate", handlePopState);
        setIsDirty(false);
        window.history.back();
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [isDirty]);


const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());

const [historyData, setHistoryData] = useState<Row[]>([]);

const getHistorial = (nFlota: string): Row[] =>
  JSON.parse(localStorage.getItem(`historial-${nFlota}`) || "[]");

// ➋ Función para borrar el historial
const clearHistorial = (nFlota: string) => {
  localStorage.removeItem(`historial-${nFlota}`);
  toast.info(`Historial de ${nFlota} borrado.`);
  // Opcional: forzar recálculo del array para que la tabla se vacíe
  setMostrarHistorial(false);
  setTimeout(() => setMostrarHistorial(true), 0);
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

const filtrarPorRangoDeFechas = (row: Row) => {
  if (!fechaDesde && !fechaHasta) return true;

  const inicio = row.fechaInicio ? new Date(row.fechaInicio) : null;
  const fin = row.fechaFin ? new Date(row.fechaFin) : null;

  if (!inicio || !fin) return false;

  // Normalizar horas para comparación
  inicio.setHours(0, 0, 0, 0);
  fin.setHours(23, 59, 59, 999);

  if (fechaDesde) {
    const desde = new Date(fechaDesde);
    desde.setHours(0, 0, 0, 0);
    if (fin < desde) return false;
  }

  if (fechaHasta) {
    const hasta = new Date(fechaHasta);
    hasta.setHours(23, 59, 59, 999);
    if (inicio > hasta) return false;
  }

  return true;
};

type ColorKey = "orange" | "black" | "red" | "white";

const allColors: ColorKey[] = ["orange", "black", "red", "white"];

const colorLabels: Record<ColorKey, string> = {
  orange: "🟠 Reservados",
  black:  "⚫ No usar",
  red:    "🔴 Montados",
  white:  "⚪ Libres",
};


const generarResumenPorAnio = (anio: number) => {
  const resumen = {
    Montado: Array(12).fill(0),
    Reservado: Array(12).fill(0),
    NoUsar: Array(12).fill(0),
    Libres: Array(12).fill(0),
  };

  data.forEach((row) => {
    const { color, fechaInicio, fechaFin } = row;
    const inicio = fechaInicio ? new Date(fechaInicio) : null;
    const fin = fechaFin ? new Date(fechaFin) : null;

    const añoEmpieza = new Date(anio, 0, 1);
    const añoTermina = new Date(anio, 11, 31, 23, 59, 59, 999);

    

    // Caso 1: Sin fechas → libre todo el año
    if (!inicio || !fin || isNaN(inicio.getTime()) || isNaN(fin.getTime())) {
      for (let m = 0; m < 12; m++) resumen.Libres[m]++;
      return;
    }

    // Caso 2: Rango fuera del año → libre todo el año
    if (fin < añoEmpieza || inicio > añoTermina) {
      for (let m = 0; m < 12; m++) resumen.Libres[m]++;
      return;
    }

    // Caso 3: Rango parcial → contar meses activos y libres
    const mesInicio = inicio < añoEmpieza ? 0 : inicio.getMonth();
    const mesFin = fin > añoTermina ? 11 : fin.getMonth();

    for (let m = 0; m < 12; m++) {
      if (m >= mesInicio && m <= mesFin) {
        // Mes dentro del rango
        if (color === "red") resumen.Montado[m]++;
        else if (color === "orange") resumen.Reservado[m]++;
        else if (color === "black") resumen.NoUsar[m]++;
        else resumen.Libres[m]++;
      } else {
        // Mes fuera del rango
        resumen.Libres[m]++;
      }
    }
  });

  return resumen;
};


// Dentro del componente
useEffect(() => {
  const totales = generarTotalesPorEstado(anioSeleccionado);
  console.log("Totales calculados desde useEffect:", totales);
}, [anioSeleccionado]);


const generarTotalesPorEstado = (anio: number) => {
  console.log("Año recibido en generarTotalesPorEstado:", anio); // 👈 Depuración

  const resumen = generarResumenPorAnio(anio);

  console.log("Resumen generado:", resumen); // 👈 Verifica si contiene los arrays correctos

  return {
    Montado: resumen.Montado.reduce((a, b) => a + b, 0),
    Reservado: resumen.Reservado.reduce((a, b) => a + b, 0),
    NoUsar: resumen.NoUsar.reduce((a, b) => a + b, 0),
    Libres: resumen.Libres.reduce((a, b) => a + b, 0),
  };
};










const containerTableStyle: React.CSSProperties = {
  overflowX: 'auto',
  width: '100%',
};

const tableStyle: React.CSSProperties = {
  borderCollapse: 'collapse',
  width: 'max-content', // deja que crezca hasta donde necesite
};

const headerCellStyle: React.CSSProperties = {
  border: '1px solid #ccc',
  padding: '8px',
  background: '#f5f5f5',
  fontWeight: 'bold',
  whiteSpace: 'nowrap',
};

const cellStyle: React.CSSProperties = {
  border: '1px solid #ccc',
  padding: '8px',
  whiteSpace: 'pre-wrap',   // permite saltos de línea
  wordBreak: 'break-word',   // quiebra palabras muy largas
  verticalAlign: 'top',      // alinea el contenido arriba
  maxWidth: 200,             // ancho máximo opcional
};


  
const [filterProvincia, setFilterProvincia] = useState("Todos");
const [filterZona, setFilterZona] = useState("Todos");
// Filtrado completo (para mostrar resultados)
// Filtrado completo (para mostrar resultados en tabla)
const [filterModelo, setFilterModelo] = useState("Todos");
const [filterTrasera, setFilterTrasera] = useState("Todos");
const [filterCampania, setFilterCampania] = useState("Todos");
const [filters, setFilters] = useState<{ [key: string]: string }>({});


// ✅ Ya puedes usarlo aquí abajo sin error
const dataFiltrada = isEditing
  ? data
  : data.filter((row) => {
      const coincideLinea = filterLinea === "Todos" || row.lineas === filterLinea;
      const coincideOperador = filterOperador === "Todos" || row.operador === filterOperador;
      const coincideZona = filterZona === "Todos" || row.zona === filterZona;
      const coincideProvincia = filterProvincia === "Todos" || row.provincia === filterProvincia;
      const coincideModelo = filterModelo === "Todos" || row.modelo === filterModelo;
      const coincideTrasera = filterTrasera === "Todos" || row.trasera === filterTrasera;
      const coincideCampania = filterCampania === "Todos" || row.campania === filterCampania;
      const coincideEstado = filterColor === "Todos" || row.color === filterColor;

      const fechaInicioValida = row.fechaInicio ? new Date(row.fechaInicio) : null;
      const fechaFinValida = row.fechaFin ? new Date(row.fechaFin) : null;
      const filtroDesdeValido = fechaDesde ? new Date(fechaDesde) : null;
const filtroHastaValido = fechaHasta ? new Date(fechaHasta) : null;

if (fechaInicioValida) fechaInicioValida.setHours(0, 0, 0, 0);
if (fechaFinValida) fechaFinValida.setHours(0, 0, 0, 0);
if (filtroDesdeValido) filtroDesdeValido.setHours(0, 0, 0, 0);
if (filtroHastaValido) filtroHastaValido.setHours(0, 0, 0, 0);

let coincideFechas = true;

if (fechaDesde || fechaHasta) {
  if (!fechaInicioValida || !fechaFinValida) {
    coincideFechas = false;
  } else {
    if (filtroDesdeValido && fechaFinValida < filtroDesdeValido) coincideFechas = false;
    if (filtroHastaValido && fechaInicioValida > filtroHastaValido) coincideFechas = false;
  }
}

if (!coincideFechas) {
  console.log("❌ Descartado por fecha:", row.n_flota, row.fechaInicio, row.fechaFin);
}


      return (
        coincideLinea &&
        coincideOperador &&
        coincideZona &&
        coincideProvincia &&
        coincideModelo &&
        coincideTrasera &&
        coincideCampania &&
        coincideEstado &&
        coincideFechas
      );
    });



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




const lineasDisponiblesRaw = [...new Set(
  data
    .filter((r) =>
      (filterOperador === "Todos" || r.operador === filterOperador) &&
      (filterZona === "Todos" || r.zona === filterZona) &&
      (filterProvincia === "Todos" || r.provincia === filterProvincia)
    )
    .map((r) => r.lineas)
)].filter(Boolean).sort();




const operadoresDisponiblesRaw = [...new Set(
  data
    .filter((r) =>
      (filterLinea === "Todos" || r.lineas === filterLinea) &&
      (filterZona === "Todos" || r.zona === filterZona) &&
      (filterProvincia === "Todos" || r.provincia === filterProvincia)
    )
    .map((r) => r.operador)
)].filter(Boolean).sort();



const zonasDisponiblesRaw = [...new Set(
  data
    .filter((r) =>
      (filterLinea === "Todos" || r.lineas === filterLinea) &&
      (filterOperador === "Todos" || r.operador === filterOperador) &&
      (filterProvincia === "Todos" || r.provincia === filterProvincia)
    )
    .map((r) => r.zona)
)].filter(Boolean).sort();



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

const filtros = {
  lineas: filterLinea,
  operador: filterOperador,
  zona: filterZona,
  provincia: filterProvincia,
  modelo: filterModelo,
  trasera: filterTrasera,
  campania: filterCampania,
};





const obtenerOpcionesDisponibles = (
  campo: keyof Row,
  data: Row[],
  filtros: { [key: string]: string }
): string[] => {
  const otrosFiltros = Object.entries(filtros).filter(([clave]) => clave !== campo);

  const valores = data
    .filter((row) =>
      otrosFiltros.every(([clave, valor]) =>
        valor === "Todos" ? true : row[clave as keyof Row] === valor
      )
    )
    .map((row) => row[campo])
    .filter(Boolean);

  const unicos = [...new Set(valores)].sort();
  return unicos.includes(filtros[campo]) ? unicos : [filtros[campo], ...unicos].filter(Boolean);
};

const modelosDisponibles = obtenerOpcionesDisponibles("modelo", data, filtros);
const traserasDisponibles = obtenerOpcionesDisponibles("trasera", data, filtros);
const campaniasDisponibles = obtenerOpcionesDisponibles("campania", data, filtros);
const lineasDisponibles = obtenerOpcionesDisponibles("lineas", data, filtros);
const operadoresDisponibles = obtenerOpcionesDisponibles("operador", data, filtros);
const zonasDisponibles = obtenerOpcionesDisponibles("zona", data, filtros);
const provinciasDisponibles = obtenerOpcionesDisponibles("provincia", data, filtros);











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
  row.operador,
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
  hoy.setHours(0, 0, 0, 0); // Normalizar para comparar solo la fecha

  const fetchData = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/Corporalia/v1/carreteras/carretera/Salamanca`
      );

      // 1️⃣ Leemos TODO el mapa de colores guardados
      const savedColors: Record<string, Color> =
        JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || "{}");

      // 2️⃣ Mapeamos la data de la API, aplicando primero los colores persistidos
      const formattedData: Row[] = response.data.map((row: any) => {
        // Color que viene de la API (si es válido)
        const apiColor = ["white", "orange", "black", "red"].includes(row.color)
          ? (row.color as Color)
          : ("white" as Color);

        // Usamos el color persistido si existe, sino el de la API
        const color: Color = savedColors[row.n_flota] ?? apiColor;

        

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
      setFechaSeleccionada(hoy); // Seleccionar hoy por defecto

      // 3️⃣ Mostramos toasts para caducados, pero NO reseteamos color
      formattedData.forEach((row) => {
        const fin = row.fechaFin ? new Date(row.fechaFin) : null;
        if (
          fin &&
          !isNaN(fin.getTime()) &&
          fin < hoy &&
          (row.color === "red" || row.color === "orange" || row.color === "black") &&
          !avisadasRef.current.has(row.n_flota)
        ) {
          toast.warn(`⚠️ La campaña con código ${row.n_flota} ha caducado.`);
          avisadasRef.current.add(row.n_flota);
        }
      });
    } catch (err) {
      toast.error("Error al cargar los datos de Salamanca.");
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

useEffect(() => {
  if (data && data.length > 0) {
    const totales = generarTotalesPorEstado(anioSeleccionado);
    console.log("✅ Totales calculados:", totales);
  } else {
    console.log("⚠️ Datos aún no disponibles para el resumen.");
  }
}, [anioSeleccionado, data]);






  const normalizarFecha = (f: Date | null) => {
  if (!f) return null;
  const fecha = new Date(f);
  fecha.setHours(0, 0, 0, 0);
  return fecha;
};

useEffect(() => {
  if (!data || data.length === 0) {
    setFilteredRows([]);
    return;
  }

  const desde = fechaDesde ? new Date(fechaDesde) : null;
  const hasta = fechaHasta ? new Date(fechaHasta) : null;

  if (desde) desde.setHours(0, 0, 0, 0);
  if (hasta) hasta.setHours(23, 59, 59, 999);

  const filtrados = data.filter((row) => {
    if (!row.fechaInicio || !row.fechaFin) return false;

    const inicio = new Date(completarSegundos(row.fechaInicio));
    const fin = new Date(completarSegundos(row.fechaFin));

    inicio.setHours(0, 0, 0, 0);
    fin.setHours(23, 59, 59, 999);

    // ✅ Prioridad: primero rango
    if (desde || hasta) {
      if (desde && fin < desde) return false;
      if (hasta && inicio > hasta) return false;
    }

    // ✅ Luego por día seleccionado
    if (fechaSeleccionada) {
      const seleccion = new Date(fechaSeleccionada);
      seleccion.setHours(0, 0, 0, 0);
      if (seleccion < inicio || seleccion > fin) return false;
    }

    return true;
  });

  setFilteredRows(filtrados);
}, [fechaSeleccionada, fechaDesde, fechaHasta, data]);

 
  
  

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






  

const filaVacia: Row = {
  n_flota: "",
  base: "",
  carretera: "",
  provincia: "",
  zona: "",
  der_delantera: "",
  der_plus: "",
  der_trasera: "",
  extra: "",
  izq_delantera: "",
  izq_plus: "",
  izq_trasera: "",
  lineas: "",
  matricula: "",
  modelo: "",
  operador: "",
  plantilla: "",
  trasera: "",
  info_plus: "",
  observaciones: "",
  campania: "",
  fechaInicio: "",
  fechaFin: "",
  color: "white",
};

const rowHasChanges = (original: Row, current: Row) => {
  return (
    original.base !== current.base ||
    original.carretera !== current.carretera ||
    original.provincia !== current.provincia ||
    original.zona !== current.zona ||
    original.der_delantera !== current.der_delantera ||
    original.der_plus !== current.der_plus ||
    original.der_trasera !== current.der_trasera ||
    original.extra !== current.extra ||
    original.izq_delantera !== current.izq_delantera ||
    original.izq_plus !== current.izq_plus ||
    original.izq_trasera !== current.izq_trasera ||
    original.lineas !== current.lineas ||
    original.matricula !== current.matricula ||
    original.modelo !== current.modelo ||
    original.operador !== current.operador ||
    original.plantilla !== current.plantilla ||
    original.trasera !== current.trasera ||
    original.info_plus !== current.info_plus ||
    original.observaciones !== current.observaciones ||
    original.campania !== current.campania ||
    original.fechaInicio !== current.fechaInicio ||
    original.fechaFin !== current.fechaFin ||
    original.color !== current.color
  );
};

const handleSave = async () => {
  try {
    const filasModificadas = data
      .filter((row) =>
        row.n_flota &&
        rowHasChanges(
          originalData.find((r) => r.n_flota === row.n_flota) || filaVacia,
          row
        )
      )
      .map((row) => {
        const fechaInicio = row.fechaInicio
          ? completarSegundos(row.fechaInicio)
          : null;
        const fechaFin = row.fechaFin
          ? completarSegundos(row.fechaFin)
          : null;

        const formato = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/;
        if (
          (fechaInicio && !formato.test(fechaInicio)) ||
          (fechaFin    && !formato.test(fechaFin))
        ) {
          toast.warn(`⚠️ Fecha inválida en ${row.n_flota}`);
          return null;
        }

        return {
          ...row,
          fechaInicio,
          fechaFin,
          color: row.color || "white",
        };
      })
      .filter(Boolean); // elimina null

    if (filasModificadas.length === 0) {
      toast.info("✅ No hay cambios para guardar.");
      return;
    }

    await axios.post(
      `${import.meta.env.VITE_BACKEND_URL}/Corporalia/v1/carreteras/bulk-fast`,
      filasModificadas
    );

    toast.success("✅ Cambios guardados correctamente.");
    setIsDirty(false);  // ← Aquí limpias el flag
  } catch (error) {
    console.error("⛔ Error al guardar:", error);
    toast.error("Error al guardar los datos.");
  }
};


const handleReset = (index: number) => {
  setData(prev => {
    const newData = [...prev];
    const prevRow = newData[index];
    const n_flota = prevRow.n_flota;

    // 1. log del estado anterior
    if (prevRow.color !== "white") {
      logHistorial(prevRow);
    }

    // 2. borramos el color persistido
    const saved: Record<string, Color> =
      JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || "{}");
    delete saved[n_flota];
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(saved));

    // 3. reseteamos la fila a blanco + limpiamos fechas y textos
    newData[index] = {
      ...prevRow,
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
      provincia: "Castilla y Leon",
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
  setIsDirty(true);               // ← marcamos que hay cambios sin guardar
  setData((prevData) => {
    const newData = [...prevData];
    newData[index] = { ...newData[index], [field]: value };
    console.log("➡️ Editando:", newData[index]);
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

  
  
  
  
    
  
  

 
 


  

  
  let toastMostrado = false;

 
 const handleColorChange = (nFlota: string, color: Color) => {
  const prevRow = data.find(r => r.n_flota === nFlota);
  if (!prevRow) return;

  // validación de fechas
  if (color !== "white" && (!prevRow.fechaInicio || !prevRow.fechaFin)) {
    toast.warning("⚠️ Debes establecer fecha de inicio y fin antes de aplicar una acción");
    return;
  }

  // guardamos el estado anterior (<prevRow.color>, fechas, etc.)
  if (prevRow.color !== "white") {
    logHistorial(prevRow);
  }

  // construimos el nuevo estado y lo persistimos
  const updatedRow: Row = {
    ...prevRow,
    color,
    ...(color === "white"
      ? { fechaInicio: "", fechaFin: "", campania: "", observaciones: "" }
      : {})
  };

  // persistimos en LOCAL_STORAGE_KEY
  const saved: Record<string, Color> = JSON.parse(
    localStorage.getItem(LOCAL_STORAGE_KEY) || "{}"
  );
  if (color === "white") delete saved[nFlota];
  else saved[nFlota] = color;
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(saved));

  // actualizamos el estado React
  setData(prev => prev.map(r =>
    r.n_flota === nFlota ? updatedRow : r
  ));
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

  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  inicio.setHours(0, 0, 0, 0);
  fin.setHours(0, 0, 0, 0);

  const color = localStorage.getItem(`color-${row.n_flota}`) || row.color || 'white';

  return (
    color !== 'white' &&
    d >= inicio &&
    d <= fin
  );
};



 const filteredData = data.filter(row => {
  const fechaInicioRow = row.fechaInicio ? new Date(row.fechaInicio) : null;
  const fechaFinRow = row.fechaFin ? new Date(row.fechaFin) : null;

  if (fechaDesde && fechaHasta && fechaInicioRow && fechaFinRow) {
    fechaInicioRow.setHours(0, 0, 0, 0);
    fechaFinRow.setHours(23, 59, 59, 999);

    const desde = new Date(fechaDesde);
    const hasta = new Date(fechaHasta);
    desde.setHours(0, 0, 0, 0);
    hasta.setHours(23, 59, 59, 999);

    // Mostrar todo lo que no se excluya explícitamente
    const estaFueraDelRango = fechaFinRow < desde || fechaInicioRow > hasta;

    return !estaFueraDelRango;
  }

  return true; // Si no hay filtros activos o no hay fechas, se muestra
});







  const disponibles = data.filter(
  (row) =>
    fechaSeleccionada &&
    isInRange(row, fechaSeleccionada) &&
    row.color === "white" &&
    filtrarPorRangoDeFechas(row)
);

const ocupados = data.filter(
  (row) =>
    fechaSeleccionada &&
    isInRange(row, fechaSeleccionada) &&
    row.color !== "white" &&
    filtrarPorRangoDeFechas(row)
);

const sinFecha = data.filter(
  (row) =>
    (!row.fechaInicio || !row.fechaFin)
 &&
    filtrarPorRangoDeFechas(row) // opcional: solo si también quieres filtrar sin fechas
);

const conteo = {
  nousar: data.filter((r) => r.color === "black" && filtrarPorRangoDeFechas(r)).length,
  reservado: data.filter((r) => r.color === "orange" && filtrarPorRangoDeFechas(r)).length,
  montado: data.filter((r) => r.color === "red" && filtrarPorRangoDeFechas(r)).length,
  libres: data.filter((r) => r.color === "white" && filtrarPorRangoDeFechas(r)).length,
  total: data.filter(filtrarPorRangoDeFechas).length,
};

// 🔽 Clasificación por estado para la fecha seleccionada
const registrosMontados = data.filter((row) => {
  if (row.color !== "red" || !row.fechaInicio || !row.fechaFin || !fechaSeleccionada) return false;
  const inicio = new Date(completarSegundos(row.fechaInicio));
  const fin = new Date(completarSegundos(row.fechaFin));
  const seleccion = new Date(fechaSeleccionada);
  return seleccion >= inicio && seleccion <= fin;
});

const registrosReservados = data.filter((row) => {
  if (row.color !== "orange" || !row.fechaInicio || !row.fechaFin || !fechaSeleccionada) return false;
  const inicio = new Date(completarSegundos(row.fechaInicio));
  const fin = new Date(completarSegundos(row.fechaFin));
  const seleccion = new Date(fechaSeleccionada);
  return seleccion >= inicio && seleccion <= fin;
});

const registrosNoUsar = data.filter((row) => {
  if (row.color !== "black" || !row.fechaInicio || !row.fechaFin || !fechaSeleccionada) return false;
  const inicio = new Date(completarSegundos(row.fechaInicio));
  const fin = new Date(completarSegundos(row.fechaFin));
  const seleccion = new Date(fechaSeleccionada);
  return seleccion >= inicio && seleccion <= fin;
});

// ✅ LIBRES = blancos o cualquier color fuera de fechas
const registrosLibres = data.filter((row) => {
  if (!fechaSeleccionada) return false;

  const inicio = row.fechaInicio ? new Date(completarSegundos(row.fechaInicio)) : null;
  const fin = row.fechaFin ? new Date(completarSegundos(row.fechaFin)) : null;
  const seleccion = new Date(fechaSeleccionada);

  if (inicio) inicio.setHours(0, 0, 0, 0);
  if (fin) fin.setHours(23, 59, 59, 999);
  seleccion.setHours(12, 0, 0, 0);

  const estaDentro =
    inicio && fin
      ? seleccion >= inicio && seleccion <= fin
      : inicio
      ? seleccion >= inicio
      : fin
      ? seleccion <= fin
      : false;

  const color = localStorage.getItem(`color-${row.n_flota}`) || row.color || "white";
  const esLibre = color === "white" || !estaDentro;

  return esLibre;
});





  

const cell: React.CSSProperties = {
  border: "1px solid #ccc",
  padding: "8px",
  fontSize: "1.1rem",  // antes 0.9em
};

const headerCell: React.CSSProperties = {
  border: "1px solid #ccc",
  padding: "8px",
  background: "#f5f5f5",
  fontWeight: "bold",
  fontSize: "1.2rem",  // un pelín más grande para el header
  textAlign: "left" as const,
};



  return (

    
  <div style={containerStyle}>

    {/* ------------------------------------------------
   Modal de Historial con scroll y celdas flexibles
------------------------------------------------ */}
{mostrarHistorial && nFlotaSeleccionado && (
  <div
    onClick={cerrarHistorial}
    style={{
      position: "fixed",
      top: 0, left: 0,
      width: "100vw", height: "100vh",
      background: "rgba(0,0,0,0.5)",
      display: "flex", justifyContent: "center", alignItems: "center",
      zIndex: 9999,
    }}
  >
    <div
      onClick={e => e.stopPropagation()}
      style={{
        background: "#fff",
        padding: 20,
        borderRadius: 8,
        maxWidth: "90%",
        maxHeight: "80%",
        overflow: "auto",
        boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
      }}
    >
      <h3 style={{ marginBottom: 12 }}>📜 Historial de {nFlotaSeleccionado}</h3>

      {/* Contenedor con scroll horizontal */}
      <div style={{ overflowX: "auto", width: "100%" }}>
        <table style={{ borderCollapse: "collapse", width: "max-content" }}>
          <thead>
            <tr>
              {/* Pon aquí todas tus cabeceras */}
              <th style={{ border: "1px solid #ccc", padding: 8, background: "#f5f5f5", whiteSpace: "nowrap" }}>Campaña</th>
              <th style={{ border: "1px solid #ccc", padding: 8, background: "#f5f5f5", whiteSpace: "nowrap" }}>Carretera</th>
              <th style={{ border: "1px solid #ccc", padding: 8, background: "#f5f5f5", whiteSpace: "nowrap" }}>Provincia</th>
              <th style={{ border: "1px solid #ccc", padding: 8, background: "#f5f5f5", whiteSpace: "nowrap" }}>Zona</th>
              <th style={{ border: "1px solid #ccc", padding: 8, background: "#f5f5f5", whiteSpace: "nowrap" }}>Operador</th>
              <th style={{ border: "1px solid #ccc", padding: 8, background: "#f5f5f5", whiteSpace: "nowrap" }}>Líneas</th>
              <th style={{ border: "1px solid #ccc", padding: 8, background: "#f5f5f5", whiteSpace: "nowrap" }}>Matrícula</th>
              <th style={{ border: "1px solid #ccc", padding: 8, background: "#f5f5f5", whiteSpace: "nowrap" }}>Base</th>
              <th style={{ border: "1px solid #ccc", padding: 8, background: "#f5f5f5", whiteSpace: "nowrap" }}>Modelo</th>
              <th style={{ border: "1px solid #ccc", padding: 8, background: "#f5f5f5", whiteSpace: "nowrap" }}>Plantilla</th>
              <th style={{ border: "1px solid #ccc", padding: 8, background: "#f5f5f5", whiteSpace: "nowrap" }}>Extra</th>
              <th style={{ border: "1px solid #ccc", padding: 8, background: "#f5f5f5", whiteSpace: "nowrap" }}>Trasera</th>
              <th style={{ border: "1px solid #ccc", padding: 8, background: "#f5f5f5", whiteSpace: "nowrap" }}>Izq Delantera</th>
              <th style={{ border: "1px solid #ccc", padding: 8, background: "#f5f5f5", whiteSpace: "nowrap" }}>Izq Plus</th>
              <th style={{ border: "1px solid #ccc", padding: 8, background: "#f5f5f5", whiteSpace: "nowrap" }}>Izq Trasera</th>
              <th style={{ border: "1px solid #ccc", padding: 8, background: "#f5f5f5", whiteSpace: "nowrap" }}>Der Delantera</th>
              <th style={{ border: "1px solid #ccc", padding: 8, background: "#f5f5f5", whiteSpace: "nowrap" }}>Der Plus</th>
              <th style={{ border: "1px solid #ccc", padding: 8, background: "#f5f5f5", whiteSpace: "nowrap" }}>Der Trasera</th>
              <th style={{ border: "1px solid #ccc", padding: 8, background: "#f5f5f5", whiteSpace: "nowrap" }}>Info Plus</th>
              <th style={{ border: "1px solid #ccc", padding: 8, background: "#f5f5f5", whiteSpace: "nowrap" }}>Observaciones</th>
              <th style={{ border: "1px solid #ccc", padding: 8, background: "#f5f5f5", whiteSpace: "nowrap" }}>Inicio</th>
              <th style={{ border: "1px solid #ccc", padding: 8, background: "#f5f5f5", whiteSpace: "nowrap" }}>Fin</th>
              <th style={{ border: "1px solid #ccc", padding: 8, background: "#f5f5f5", whiteSpace: "nowrap" }}>Color</th>
            </tr>
          </thead>
          <tbody>
            {(() => {
              const allHistory: Row[] = JSON.parse(localStorage.getItem(`historial-${nFlotaSeleccionado}`) || "[]");
              const anterior = allHistory.length > 0 ? allHistory[allHistory.length - 1] : null;
              const actual   = data.find(r => r.n_flota === nFlotaSeleccionado);
              const rowsToShow = [anterior, actual].filter((r): r is Row => !!r);

              return rowsToShow.map((row, idx) => (
                <tr key={idx} style={{ backgroundColor: row.color }}>
                  {/* Campaña editable solo en la fila actual (idx===1) */}
                  <td style={{
                    border: "1px solid #ccc",
                    padding: 8,
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                    verticalAlign: "top",
                    minWidth: 120
                  }}>
                    <input
                      type="text"
                      value={row.campania}
                      readOnly={idx===0}
                      onChange={e => {
                        if (idx === 1) {
                          const i = data.findIndex(r => r.n_flota === row.n_flota);
                          if (i !== -1) handleInputChange(i, "campania", e.target.value);
                        }
                      }}
                      style={{
                        width: "100%",
                        border: idx===0 ? "none" : "1px solid #ccc",
                        backgroundColor: idx===0 ? "transparent" : "#f9f9f9",
                        padding: 5,
                      }}
                    />
                  </td>

                  {/* Los demás campos de solo lectura */}
                  {[
                    "carretera","provincia","zona","operador","lineas","matricula","base",
                    "modelo","plantilla","extra","trasera","izq_delantera","izq_plus",
                    "izq_trasera","der_delantera","der_plus","der_trasera","info_plus","observaciones"
                  ].map(field => (
                    <td key={field} style={{
                      border: "1px solid #ccc",
                      padding: 8,
                      whiteSpace: "pre-wrap",
                      wordBreak: "break-word",
                      verticalAlign: "top",
                      minWidth: 100
                    }}>
                      { (row as any)[field] }
                    </td>
                  ))}

                  {/* Inicio */}
                  <td style={{
                    border: "1px solid #ccc",
                    padding: 8,
                    whiteSpace: "nowrap",
                    minWidth: 120
                  }}>
                    {row.fechaInicio
                      ? new Date(row.fechaInicio).toLocaleDateString("es-ES")
                      : ""}
                  </td>

                   {/* Fin */}
                  <td style={{
                    border: "1px solid #ccc",
                    padding: 8,
                    whiteSpace: "nowrap",
                    minWidth: 120
                  }}>
                    {row.fechaFin
                      ? new Date(row.fechaFin).toLocaleDateString("es-ES")
                      : ""}
                  </td>

                  {/* Color */}
                  <td style={{
                    border: "1px solid #ccc",
                    padding: 8,
                    whiteSpace: "nowrap",
                    minWidth: 80
                  }}>
                    {row.color}
                  </td>
                </tr>
              ));
            })()}
          </tbody>
        </table>
      </div>

      <button
        onClick={cerrarHistorial}
        style={{
          marginTop: 16, padding: "8px 12px",
          backgroundColor: "#007bff", color: "white",
          border: "none", borderRadius: 4, cursor: "pointer"
        }}
      >
        Cerrar
      </button>
    </div>
  </div>
)}



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
  onClick={() => {
    if (isDirty && !window.confirm("Tienes cambios sin guardar. ¿Seguro que quieres salir sin guardar?")) {
      return;
    }
    window.history.back();
  }}
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
  const color = localStorage.getItem(`color-${row.n_flota}`) || row.color || "white";
  const inicio = row.fechaInicio ? new Date(row.fechaInicio) : null;
  const fin = row.fechaFin ? new Date(row.fechaFin) : null;

  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  if (inicio) inicio.setHours(0, 0, 0, 0);
  if (fin) fin.setHours(0, 0, 0, 0);

  const estaDentro =
    inicio && fin
      ? d >= inicio && d <= fin
      : inicio
      ? d >= inicio
      : fin
      ? d <= fin
      : false;

  const esLibre = color === "white" || !estaDentro;
  const colorFinal: Color = esLibre ? "white" : (color as Color);

  // 🔍 AÑADE ESTA LÍNEA AQUÍ:
  console.log(`N_FLOTA ${row.n_flota} -> Color: ${color} | Dentro: ${estaDentro} | esLibre: ${esLibre} | FINAL: ${colorFinal}`);

  if (!colores.includes(colorFinal)) {
    colores.push(colorFinal);
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

</div>




{/* Filtro por fechas */}
{/*
<div style={{ minWidth: 160 }}>
  <label style={{ fontWeight: "bold", display: "block", marginBottom: 4 }}>Fecha desde</label>
  <input
    type="date"
    value={fechaDesde ? fechaDesde.toISOString().split("T")[0] : ""}
    onChange={(e) => {
      const value = e.target.value;
      setFechaDesde(value ? new Date(value) : null);
    }}
    style={selectStyle}
  />
</div>

<div style={{ minWidth: 160 }}>
  <label style={{ fontWeight: "bold", display: "block", marginBottom: 4 }}>Fecha hasta</label>
  <input
    type="date"
    value={fechaHasta ? fechaHasta.toISOString().split("T")[0] : ""}
    onChange={(e) => {
      const value = e.target.value;
      setFechaHasta(value ? new Date(value) : null);
    }}
    style={selectStyle}
  />
</div>
*/}



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
      setFechaDesde(null);
      setFechaHasta(null);
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






       {allColors.map((color) => {
  // Filtramos según fecha, color y el resto de filtros
  const filtrados = data.filter((r) => {
    if (!fechaSeleccionada) return false;
    const seleccion = new Date(fechaSeleccionada);
    seleccion.setHours(0, 0, 0, 0);

    const inicio = r.fechaInicio
      ? new Date(completarSegundos(r.fechaInicio))
      : null;
    const fin = r.fechaFin
      ? new Date(completarSegundos(r.fechaFin))
      : null;

    if (inicio) inicio.setHours(0, 0, 0, 0);
    if (fin)    fin.setHours(23, 59, 59, 999);

    const enRango = (inicio && fin)
      ? (seleccion >= inicio && seleccion <= fin)
      : inicio
      ? (seleccion >= inicio)
      : fin
      ? (seleccion <= fin)
      : false;

    // 1️⃣ Detectamos si la campaña expiró antes de la fecha seleccionada
    const expirado = !!(fin && seleccion > fin);

    // 2️⃣ Determinamos si ha empezado o ha terminado
    const haEmpezado  = !!(inicio && seleccion >= inicio);
    const haTerminado = !!(fin    && seleccion > fin);

    // 3️⃣ Definimos el color de visualización:
    //    antes de inicio o tras fin → "white"
    const displayColor: Color = (!haEmpezado || haTerminado)
      ? "white"
      : r.color;

    // tus filtros habituales
    const coincideOperador  = filterOperador  === "Todos" || r.operador  === filterOperador;
    const coincideLinea     = filterLinea     === "Todos" || r.lineas    === filterLinea;
    const coincideZona      = filterZona      === "Todos" || r.zona      === filterZona;
    const coincideProvincia = filterProvincia === "Todos" || r.provincia === filterProvincia;
    const coincideModelo    = filterModelo    === "Todos" || r.modelo    === filterModelo;
    const coincideTrasera   = filterTrasera   === "Todos" || r.trasera   === filterTrasera;
    const coincideCampania  = filterCampania  === "Todos" || r.campania  === filterCampania;

    if (color === "white") {
      // ⚪ Libres: todas las que, tras aplicar displayColor, sean white
      return (
        (displayColor === "white") &&
        coincideOperador &&
        coincideLinea &&
        coincideZona &&
        coincideProvincia &&
        coincideModelo &&
        coincideTrasera &&
        coincideCampania
      );
    } else {
      // 🟠🔴⚫ Sólo dentro de rango, no caducadas (o caducadas si mostramos) y con displayColor === color
      return (
        (displayColor === color) &&
        enRango &&
        (!mostrarCaducados || expirado) &&
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
  {sectionLabels[color]} el {fechaSeleccionada!.toLocaleDateString()}
</h4>


      {filtrados.length > 0 ? (
        <div style={{
            maxHeight: "300px",
            overflowY: "auto",
            overflowX: "auto",
            width: "100%",
            marginBottom: 30,
            border: "1px solid #ccc",
            borderRadius: "6px",
            position: "relative",
            zIndex: 1,
          }}>
          <table style={tableStyle}>
            <thead style={{
                position: "sticky",
                top: 0,
                backgroundColor: "#ddd",
                zIndex: 1,
              }}>
              <tr>
                <th style={{
                    position: "sticky",
                    left: 0,
                    backgroundColor: "#ddd",
                    zIndex: 2,
                  }}>
                  Acciones
                </th>
                {[
                  "n_flota","campania","carretera","provincia","zona","operador",
                  "lineas","matricula","base","modelo","plantilla","extra","trasera",
                  "izq_delantera","izq_plus","izq_trasera","der_delantera",
                  "der_plus","der_trasera","info_plus","observaciones",
                  "fechaInicio","fechaFin",
                ].map((field) => (
                  <th key={field}>{field}</th>
                ))}
                <th>Eliminar</th>
              </tr>
            </thead>
            <tbody>
             {filtrados.map((row,idx) => {
  // normalizamos la fecha seleccionada
  const seleccion = new Date(fechaSeleccionada!);
  seleccion.setHours(0, 0, 0, 0);
  const inicio = row.fechaInicio ? new Date(completarSegundos(row.fechaInicio)) : null;
  const fin    = row.fechaFin    ? new Date(completarSegundos(row.fechaFin))    : null;
  if (inicio) inicio.setHours(0, 0, 0, 0);
  if (fin)    fin.setHours(23, 59, 59, 999);
  const haEmpezado  = !!(inicio && seleccion >= inicio);
  const haTerminado = !!(fin    && seleccion >  fin);
  const displayColor: Color = (!haEmpezado || haTerminado) ? "white" : row.color;

  return (
    <tr key={idx} style={{ backgroundColor: displayColor }}>
      {/* —————— CELDA ACCIONES —————— */}
      <td
        style={{
          position: "sticky",
          left: 0,
          backgroundColor: "#fff",
          zIndex: 1,
          padding: 4
        }}
      >
        <div style={actionButtonGroup}>
          {allColors.map((c) => (
            <button
              key={c}
              onClick={() => handleColorChange(row.n_flota, c)}
              style={{
                ...colorButtonStyle,
                backgroundColor:
                  c === "white" ? "#f1f1f1" : c === "black" ? "black" : c,
                color: c === "white" ? "#000" : "#fff",
                border: c === "black" ? "2px solid black" : "none",
              }}
            >
              {buttonLabels[c]}
            </button>
          ))}
          <button
            onClick={() => abrirHistorial(row.n_flota)}
            style={{
              marginLeft: 4,
              backgroundColor: "#e0e0e0",
              border: "none",
              padding: "4px 6px",
              borderRadius: 4,
              cursor: "pointer",
            }}
            title="Ver historial"
          >
            📜
          </button>
        </div>
      </td>

      {/* —————— CELDAS EDITABLES —————— */}
      {[
        "n_flota","campania","carretera","provincia","zona","operador",
        "lineas","matricula","base","modelo","plantilla","extra",
        "trasera","izq_delantera","izq_plus","izq_trasera",
        "der_delantera","der_plus","der_trasera","info_plus",
        "observaciones","fechaInicio","fechaFin",
      ].map((field) => (
        <td key={field}>
          <input
            type={field === "fechaInicio" || field === "fechaFin" ? "datetime-local" : "text"}
            value={(row as any)[field] || ""}
            onChange={(e) => {
              const idx = data.findIndex((r) => r.n_flota === row.n_flota);
              if (idx !== -1) {
                handleInputChange(idx, field as keyof Row, e.target.value);
              }
            }}
            style={{
              ...inputStyle,
              backgroundColor: "#f9f9f9",
              color: "#333",
              border: "1px solid #ccc",
              borderRadius: 6,
              fontWeight: 500,
              padding: 5,
              width: field === "base" || field === "observaciones" ? "250px" : "100%",
            }}
          />
        </td>
      ))}

      {/* —————— BOTÓN ELIMINAR —————— */}
      <td style={{ paddingLeft: 15, width: 130, textAlign: "center" }}>
        <button
          onClick={() => handleDelete(row.n_flota)}
          style={{
            ...colorButtonStyle,
            backgroundColor: "red",
            color: "white",
            width: 100,
          }}
        >
          Eliminar
        </button>
      </td>
    </tr>
  );
})}
            </tbody>
          </table>
        </div>
      ) : (
        <p style={{
            fontStyle: "italic",
            color: "#666",
            textAlign: "center",
            padding: "10px 0",
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

