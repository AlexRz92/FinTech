import { useState, useEffect } from 'react';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import Layout from '../../components/layout/Layout';
import BadgePnL from '../../components/BadgePnL';
import Modal from '../../components/Modal';
import {
  getWeeksWithResults,
  createWeek,
  deleteWeek,
  updateWeek,
} from '../../lib/database';

interface WeekWithResult {
  id: string;
  week_number: number;
  start_date: string;
  end_date: string;
  percentage: number;
  result: {
    admin_pnl: number;
    user_pnl: number;
    admin_capital_end: number;
    user_capital_end: number;
  } | null;
}

export default function AdminWeeks() {
  const [weeks, setWeeks] = useState<WeekWithResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWeek, setSelectedWeek] = useState<WeekWithResult | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [percentage, setPercentage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadWeeks();
  }, []);

  async function loadWeeks() {
    try {
      setLoading(true);
      const data = await getWeeksWithResults();
      setWeeks(
        data.map((w) => ({
          ...w,
          result: w.result
            ? {
                admin_pnl: Number(w.result.admin_pnl),
                user_pnl: Number(w.result.user_pnl),
                admin_capital_end: Number(w.result.admin_capital_end),
                user_capital_end: Number(w.result.user_capital_end),
              }
            : null,
        }))
      );
    } catch (err) {
      setError('Error al cargar semanas');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateWeek() {
    if (!percentage) return;

    try {
      setSubmitting(true);
      setError('');

      const weekNumber = Math.max(...weeks.map((w) => w.week_number), 0) + 1;
      const startDate = new Date();
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 6);

      await createWeek({
        week_number: weekNumber,
        start_date: startDate.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0],
        percentage: parseFloat(percentage),
      });

      setSuccess('Semana creada exitosamente');
      setPercentage('');
      setShowCreateModal(false);
      await loadWeeks();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Error al crear semana');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteWeek() {
    if (!selectedWeek) return;

    try {
      setSubmitting(true);
      setError('');
      await deleteWeek(selectedWeek.id);
      setSuccess('Semana eliminada exitosamente');
      setSelectedWeek(null);
      await loadWeeks();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Error al eliminar semana');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleUpdatePercentage() {
    if (!selectedWeek || !percentage) return;

    try {
      setSubmitting(true);
      setError('');
      await updateWeek(selectedWeek.id, {
        percentage: parseFloat(percentage),
      });
      setSuccess('Semana actualizada exitosamente');
      setPercentage('');
      setSelectedWeek(null);
      await loadWeeks();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Error al actualizar semana');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  }

  const formatCurrency = (value: number) =>
    `$${value.toLocaleString('es-ES', { maximumFractionDigits: 2 })}`;
  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString('es-ES');

  if (loading) {
    return (
      <Layout userRole="admin" userName="Admin">
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout userRole="admin" userName="Admin">
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-white">Semanas</h1>
            <p className="text-gray-400">Gestionar semanas operadas</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 gradient-fintage-blue text-white rounded-lg hover-glow-blue transition-colors"
          >
            <Plus className="w-5 h-5" />
            Nueva Semana
          </button>
        </div>

        {error && (
          <div className="p-4 bg-red-900 bg-opacity-20 border border-red-500 border-opacity-30 rounded-lg text-red-400">
            {error}
          </div>
        )}

        {success && (
          <div className="p-4 bg-green-900 bg-opacity-20 border border-green-500 border-opacity-30 rounded-lg text-green-400">
            {success}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {weeks.map((week) => (
            <button
              key={week.id}
              onClick={() => {
                setSelectedWeek(week);
                setPercentage(week.percentage.toString());
              }}
              className="text-left p-4 rounded-lg border bg-gray-900 bg-opacity-40 border-gray-700 hover:border-blue-500 hover:border-opacity-50 transition-all"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-semibold text-white">
                    Semana {week.week_number}
                  </h3>
                  <p className="text-xs text-gray-400 mt-1">
                    {formatDate(week.start_date)} a {formatDate(week.end_date)}
                  </p>
                </div>
                <BadgePnL value={week.percentage} size="sm" />
              </div>
              {week.result && (
                <div className="space-y-1 text-sm">
                  <p className="text-gray-300">
                    PnL: {formatCurrency(week.result.admin_pnl + week.result.user_pnl)}
                  </p>
                  <p className="text-gray-300">
                    Capital Final:{' '}
                    {formatCurrency(
                      week.result.admin_capital_end + week.result.user_capital_end
                    )}
                  </p>
                </div>
              )}
            </button>
          ))}
        </div>

        {selectedWeek && (
          <div className="card-fintage rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              Editar Semana {selectedWeek.week_number}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Porcentaje (%)
                </label>
                <input
                  type="number"
                  value={percentage}
                  onChange={(e) => setPercentage(e.target.value)}
                  className="input-fintage w-full px-4 py-2 rounded-lg"
                  step="0.1"
                  disabled={submitting}
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleDeleteWeek}
                  disabled={submitting}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Eliminar
                </button>
                <button
                  onClick={() => setSelectedWeek(null)}
                  disabled={submitting}
                  className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleUpdatePercentage}
                  disabled={submitting}
                  className="ml-auto px-4 py-2 gradient-fintage-blue text-white rounded-lg hover-glow-blue transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  Guardar
                </button>
              </div>
            </div>
          </div>
        )}

        <Modal
          isOpen={showCreateModal}
          onClose={() => {
            setShowCreateModal(false);
            setPercentage('');
            setError('');
          }}
          title="Nueva Semana"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Porcentaje (%)
              </label>
              <input
                type="number"
                value={percentage}
                onChange={(e) => setPercentage(e.target.value)}
                className="input-fintage w-full px-4 py-2 rounded-lg"
                step="0.1"
                placeholder="5.5"
                disabled={submitting}
              />
            </div>
            <div className="flex gap-3 pt-4">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setPercentage('');
                  setError('');
                }}
                disabled={submitting}
                className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateWeek}
                disabled={submitting || !percentage}
                className="flex-1 px-4 py-2 gradient-fintage-blue text-white rounded-lg hover-glow-blue transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                Crear
              </button>
            </div>
          </div>
        </Modal>
      </div>
    </Layout>
  );
}
