import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './styles/Estadisticas.css';

// Librería de rechart para graficos
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const Estadisticas = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statsData, setStatsData] = useState({
    incidenciasPorEstado: [],
    tiempoPromedioPorPrioridad: [],
    incidenciasResueltasPorDia: [],
    incidenciasPorArea: []
  });

  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/incidencias/estadisticas/ver`);
        const formattedData = {
          incidenciasPorEstado: response.data.incidenciasPorEstado.map(item => ({
            ...item,
            estado: item.estado.charAt(0).toUpperCase() + item.estado.slice(1)
          })),
          tiempoPromedioPorPrioridad: response.data.tiempoPromedioPorPrioridad.map(item => ({
            ...item,
            prioridad: item.prioridad.charAt(0).toUpperCase() + item.prioridad.slice(1)
          })),
          incidenciasResueltasPorDia: response.data.incidenciasResueltasPorDia.map(item => ({
            ...item,
            fecha: new Date(item.fecha).toLocaleDateString()
          })),
          incidenciasPorArea: response.data.incidenciasPorArea.map(item => ({
            ...item,
            area: item.area
          }))
        };

        setStatsData(formattedData);
      } catch (err) {
        console.error('Error al cargar estadísticas:', err.response?.data);
        setError('No se pudieron cargar las estadísticas.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  const COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD'];

  if (error) {
    return (
      <div className="error-card">
        <h3 className="error-title">Error</h3>
        <p className="error-message">{error}</p>
        <button onClick={() => window.location.reload()} className="btn-retry">
          Recargar
        </button>
      </div>
    );
  }

  return (
    <>
      {isLoading ? (
        <div className="loading-card">
          <div className="spinner"></div>
          <p>Cargando estadísticas...</p>
        </div>
      ) : (
        <div className="stats-container">
          <h1 className="stats-title">Dashboard de Estadísticas</h1>
          <p className="stats-subtitle">Medición de tiempos de ciclo y tasa de incidentes resueltos para mejora continua.</p>

          <div className="kpi-grid">
            <div className="kpi-card">
                <h3>Total Incidencias</h3>
                <p className="kpi-value">
                  {statsData.incidenciasPorEstado.reduce((sum, item) => sum + item.cantidad, 0)}
                </p>
            </div>
            <div className="kpi-card">
              <h3>Incidencias Resueltas</h3>
              <p className="kpi-value">
                {statsData.incidenciasPorEstado.find(item => item.estado === 'Resuelto')?.cantidad || 0}
              </p>
            </div>
            <div className="kpi-card">
              <h3>Tiempo Promedio Resolución</h3>
              <p className="kpi-value">
                {statsData.tiempoPromedioPorPrioridad.length > 0 
                  ? `${Math.round(statsData.tiempoPromedioPorPrioridad.reduce((sum, item) => sum + parseFloat(item.promedio_horas), 0) / statsData.tiempoPromedioPorPrioridad.length)}h`
                  : 'N/A'}
              </p>
            </div>
          </div>

          {/* Gráfico 1: Incidencias por Estado */}
          <div className="chart-card">
            <h2 className="chart-title">Incidencias por Estado</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={statsData.incidenciasPorEstado}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="estado" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="cantidad" fill="#2563eb" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Gráfico 2: Tiempo Promedio de Ciclo por Prioridad */}
          <div className="chart-card">
            <h2 className="chart-title">Tiempo Promedio de Resolución por Prioridad</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={statsData.tiempoPromedioPorPrioridad}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="prioridad" />
                <YAxis unit="h" />
                <Tooltip formatter={(value) => `${value} horas`} />
                <Legend />
                <Bar dataKey="promedio_horas" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Gráfico 3: Incidencias Resueltas por Día (últimos 30 días) */}
          <div className="chart-card">
            <h2 className="chart-title">Incidencias Resueltas por Día (Últimos 30 días)</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={statsData.incidenciasResueltasPorDia}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="fecha" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="resueltas" stroke="#f59e0b" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Gráfico 4: Incidencias por Área */}
          <div className="chart-card">
            <h2 className="chart-title">Incidencias por Área</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statsData.incidenciasPorArea}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="cantidad"
                >
                  {statsData.incidenciasPorArea.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>  
      )}
    </>
  );
};

export default Estadisticas;