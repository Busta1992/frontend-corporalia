// CalendarTable1.tsx
import React from 'react';

export type Color = 'white' | 'orange' | 'black' | 'red';

export type Row = {
  id: string;
  codigo: string;
  campania: string;
  cp: string;
  municipio: string;
  provincia: string;
  observaciones: string;
  fecha_inicio: string;
  fecha_fin: string;
  color: Color;
};

type CalendarTableProps = {
  rows: Row[];
  filters: Record<string, string>;
  setFilters: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  handleInputChange: (id: string, field: keyof Row, value: string) => void;
  handleColorChange: (id: string, color: Color) => void;
  handleDelete: (codigo: string) => void;
  selectedDate: Date | null;
};

const thStyle: React.CSSProperties = {
  position: 'sticky',
  top: 0,
  backgroundColor: '#ddd',
  padding: 6,
  zIndex: 2,
};

const tableContainerStyle: React.CSSProperties = {
  overflow: 'auto',
  maxHeight: 300,
  border: '1px solid #ccc',
  borderRadius: 6,
};

const rowActionStyle: React.CSSProperties = {
  position: 'sticky',
  left: 0,
  background: '#fff',
  padding: 4,
  zIndex: 1,
};

export const CalendarTable1: React.FC<CalendarTableProps> = ({
  rows,
  filters,
  setFilters,
  handleInputChange,
  handleColorChange,
  handleDelete,
  selectedDate,
}) => {
  const campos = [
    'codigo',
    'campania',
    'cp',
    'municipio',
    'provincia',
    'observaciones',
    'fecha_inicio',
    'fecha_fin',
  ] as const;

  const resetFilters = () => {
    const clean: Record<string, string> = {};
    campos.forEach((c) => (clean[c] = 'Todos'));
    setFilters(clean);
  };

  const filteredRows = rows.filter((row) =>
    campos.every(
      (f) => filters[f] === 'Todos' || String(row[f]).toLowerCase() === filters[f].toLowerCase()
    )
  );

  const getDisplayColor = (row: Row): Color => {
    if (!selectedDate) return 'white';
    const inicio = row.fecha_inicio ? new Date(row.fecha_inicio) : null;
    const fin = row.fecha_fin ? new Date(row.fecha_fin) : null;
    if (!inicio || !fin) return 'white';
    inicio.setHours(0, 0, 0, 0);
    fin.setHours(0, 0, 0, 0);
    const d = new Date(selectedDate);
    d.setHours(0, 0, 0, 0);
    return d >= inicio && d <= fin ? row.color : 'white';
  };

  return (
    <div style={tableContainerStyle}>
      <button
        onClick={resetFilters}
        style={{
          margin: 8,
          padding: '6px 10px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: 4,
          cursor: 'pointer',
        }}
      >
        🔄 Limpiar filtros
      </button>

      <table style={{ borderCollapse: 'collapse', width: 'max-content' }}>
        <thead>
          <tr>
            <th style={thStyle}>Acciones</th>
            {campos.map((c) => (
              <th key={c} style={thStyle}>
                {c}
              </th>
            ))}
            <th style={thStyle}>Eliminar</th>
          </tr>
          <tr>
            <td />
            {campos.map((field) => {
              const opts = Array.from(new Set(rows.map((r) => r[field]))).filter(Boolean);
              return (
                <td key={field} style={{ padding: 4 }}>
                  <select
                    value={filters[field] || 'Todos'}
                    onChange={(e) => setFilters((f) => ({ ...f, [field]: e.target.value }))}
                    style={{ width: '100%', padding: 4 }}
                  >
                    <option>Todos</option>
                    {opts.map((o) => (
                      <option key={String(o)}>{String(o)}</option>
                    ))}
                  </select>
                </td>
              );
            })}
            <td />
          </tr>
        </thead>

        <tbody>
          {filteredRows.map((row) => (
            <tr key={row.id} style={{ backgroundColor: getDisplayColor(row) }}>
              <td style={rowActionStyle}>
                {(['orange', 'black', 'red', 'white'] as Color[]).map((c) => (
                  <button
                    key={c}
                    onClick={() => handleColorChange(row.id, c)}
                    style={{
                      marginRight: 4,
                      backgroundColor: c === 'white' ? '#f1f1f1' : c,
                      color: c === 'white' ? '#000' : '#fff',
                      border: c === 'black' ? '2px solid #000' : 'none',
                      padding: '4px 6px',
                      borderRadius: 4,
                      cursor: 'pointer',
                    }}
                  >
                    {c === 'orange'
                      ? 'Reservado'
                      : c === 'black'
                      ? 'No usar'
                      : c === 'red'
                      ? 'Montado'
                      : 'Resetear'}
                  </button>
                ))}
              </td>

              {campos.map((field) => (
                <td key={field} style={{ padding: 4 }}>
                  <input
                    type={field.startsWith('fecha_') ? 'datetime-local' : 'text'}
                    value={row[field] || ''}
                    onChange={(e) => {
                      let v = e.target.value;
                      if (field.startsWith('fecha_') && v.length === 16) v += ':00';
                      handleInputChange(row.id, field, v);
                    }}
                    style={{ width: '100%', padding: 4, borderRadius: 4, border: '1px solid #ccc' }}
                  />
                </td>
              ))}

              <td style={{ padding: 4, textAlign: 'center' }}>
                <button
                  onClick={() => handleDelete(row.codigo)}
                  style={{
                    backgroundColor: 'red',
                    color: 'white',
                    border: 'none',
                    borderRadius: 4,
                    padding: '4px 8px',
                    cursor: 'pointer',
                  }}
                >
                  🗑️
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CalendarTable1;
