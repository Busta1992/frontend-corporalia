import React, { useState } from "react";

type Row = {
  n_flota: string;
  campania: string;
  carretera: string;
  provincia: string;
  zona: string;
  operador: string;
  lineas: string;
  matricula: string;
  base: string;
  modelo: string;
  plantilla?: string;
  extra?: string;
  trasera?: string;
  izq_delantera?: string;
  izq_plus?: string;
  izq_trasera?: string;
  der_delantera?: string;
  der_plus?: string;
  der_trasera?: string;
  info_plus?: string;
  observaciones?: string;
  fechaInicio?: string;
  fechaFin?: string;
  color?: string;
};

type CalendarTableProps = {
  rows: Row[];
  filters: { [key: string]: string };
  setFilters: React.Dispatch<React.SetStateAction<{ [key: string]: string }>>;
  handleInputChange: (index: number, field: keyof Row, value: string) => void;
  selectedDate: Date | null;
  modo?: "activos" | "expirados" | "futuros" | "todos";
};



const CalendarTable: React.FC<CalendarTableProps> = ({
  rows,
  filters,
  setFilters,
  handleInputChange,
  selectedDate,
  modo = "todos",
}) => {
  const [mostrarHistorial, setMostrarHistorial] = useState(false);
  const [nFlotaSeleccionado, setNFlotaSeleccionado] = useState<string | null>(null);

  const abrirHistorial = (nFlota: string) => {
    setNFlotaSeleccionado(nFlota);
    setMostrarHistorial(true);
  };

  const cerrarHistorial = () => {
    setMostrarHistorial(false);
    setNFlotaSeleccionado(null);
  };

  const campos = [
    "n_flota", "campania", "carretera", "provincia", "zona", "operador", "lineas", "matricula", "base", "modelo", "plantilla", "extra", "trasera",
    "izq_delantera", "izq_plus", "izq_trasera", "der_delantera", "der_plus", "der_trasera", "info_plus", "observaciones", "fechaInicio", "fechaFin"
  ];

  const resetFilters = () => {
    const cleanFilters: { [key: string]: string } = {};
    campos.forEach((campo) => {
      cleanFilters[campo] = "Todos";
    });
    setFilters(cleanFilters);
  };

  const filtrarPorModo = (row: Row): boolean => {
    if (!selectedDate || modo === "todos") return true;
    const inicio = row.fechaInicio ? new Date(row.fechaInicio) : null;
    const fin = row.fechaFin ? new Date(row.fechaFin) : null;
    const seleccion = new Date(selectedDate);
    seleccion.setHours(12, 0, 0, 0);

    if (!inicio && !fin) return false;

    if (modo === "activos") {
      return inicio !== null && fin !== null && seleccion >= inicio && seleccion <= fin;
    } else if (modo === "expirados") {
      return fin !== null && seleccion > fin;
    } else if (modo === "futuros") {
      return inicio !== null && seleccion < inicio;
    }
    return true;
  };

  const filteredRows = rows.filter((row) => {
    const coincide = Object.entries(filters).every(([clave, valor]) => {
      if (!valor || valor === "Todos") return true;
      return row[clave as keyof Row]?.toLowerCase().includes(valor.toLowerCase());
    });
    return coincide && filtrarPorModo(row);
  });

  return (
    <div style={{ marginTop: 20 }}>
      <h4 style={{ textAlign: "center", marginBottom: 10 }}>📅 Tabla unificada - campañas activas</h4>

      {/* 🔄 Botón de limpiar filtros */}
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

      <div style={{
        overflowX: "auto",
        overflowY: "auto",
        width: "100%",
        marginBottom: 30,
        maxHeight: 300,
        border: "1px solid #ccc",
        borderRadius: "6px"
      }}>
        <table style={{ borderCollapse: "collapse", width: "100%" }}>
          <thead style={{ position: "sticky", top: 0, backgroundColor: "#ddd", zIndex: 2 }}>
            <tr>
              <th>📜</th>
              <th>Campaña</th>
              <th>Carretera</th>
              <th>Provincia</th>
              <th>Zona</th>
              <th>Operador</th>
              <th>Líneas</th>
              <th>Matrícula</th>
              <th>Base</th>
              <th>Modelo</th>
              <th>Inicio</th>
              <th>Fin</th>
            </tr>
          </thead>
          <tbody>
            {filteredRows.map((row, index) => (
              <tr key={index} style={{ backgroundColor: row.color || "white" }}>
                <td><button onClick={() => abrirHistorial(row.n_flota)}>📜</button></td>
                <td>{row.campania}</td>
                <td>{row.carretera}</td>
                <td>{row.provincia}</td>
                <td>{row.zona}</td>
                <td>{row.operador}</td>
                <td>{row.lineas}</td>
                <td>{row.matricula}</td>
                <td>{row.base}</td>
                <td>{row.modelo}</td>
                <td>{row.fechaInicio?.slice(0, 10)}</td>
                <td>{row.fechaFin?.slice(0, 10)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {mostrarHistorial && nFlotaSeleccionado && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0,0,0,0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
          onClick={cerrarHistorial}
        >
          <div
            style={{
              backgroundColor: "white",
              padding: "20px",
              borderRadius: "8px",
              maxWidth: "90vw",
              maxHeight: "80vh",
              overflowY: "auto",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ marginBottom: "10px" }}>
              📜 Historial de campañas para: {nFlotaSeleccionado}
            </h3>
            <table style={{ borderCollapse: "collapse", width: "100%" }}>
              <thead>
                <tr>
                  {[
                    "Campaña", "Carretera", "Provincia", "Zona", "Operador", "Líneas",
                    "Matrícula", "Base", "Modelo", "Inicio", "Fin", "Color"
                  ].map((label) => (
                    <th
                      key={label}
                      style={{
                        padding: "6px",
                        border: "1px solid black",
                        backgroundColor: "#eee",
                      }}
                    >
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows
                  .filter(
                    (row) =>
                      row.n_flota === nFlotaSeleccionado &&
                      (row.color === "red" || row.color === "orange")
                  )
                  .sort((a, b) => {
  const fechaA = a.fechaInicio ? new Date(a.fechaInicio).getTime() : 0;
  const fechaB = b.fechaInicio ? new Date(b.fechaInicio).getTime() : 0;
  return fechaB - fechaA;
})

                  .map((row, index) => (
                    <tr key={index} style={{ backgroundColor: row.color || "white" }}>
                      <td>{row.campania}</td>
                      <td>{row.carretera}</td>
                      <td>{row.provincia}</td>
                      <td>{row.zona}</td>
                      <td>{row.operador}</td>
                      <td>{row.lineas}</td>
                      <td>{row.matricula}</td>
                      <td>{row.base}</td>
                      <td>{row.modelo}</td>
                      <td>{row.fechaInicio?.slice(0, 10)}</td>
                      <td>{row.fechaFin?.slice(0, 10)}</td>
                      <td>{row.color}</td>
                    </tr>
                  ))}
              </tbody>
            </table>

            <button
              onClick={cerrarHistorial}
              style={{
                marginTop: "10px",
                backgroundColor: "#ccc",
                padding: "6px 12px",
                borderRadius: "6px",
                fontWeight: "bold",
              }}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarTable;
