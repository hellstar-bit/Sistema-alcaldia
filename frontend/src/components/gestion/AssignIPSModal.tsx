// frontend/src/components/gestion/AssignIPSModal.tsx
import React, { useState, useEffect } from 'react';
import {
  XMarkIcon,
  UserGroupIcon,
  MagnifyingGlassIcon,
  CheckIcon,
  PlusIcon,
  TrashIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { 
  epsAPI, 
  ipsAPI, 
  gestionUtils,
  type EPSDetailed, 
  type IPSDetailed 
} from '../../services/gestionApi';
import { useSweetAlert } from '../../hooks/useSweetAlert';

interface AssignIPSModalProps {
  isOpen: boolean;
  onClose: () => void;
  eps: EPSDetailed | null;
  onSuccess: () => void;
}

export const AssignIPSModal: React.FC<AssignIPSModalProps> = ({
  isOpen,
  onClose,
  eps,
  onSuccess
}) => {
  const [availableIPS, setAvailableIPS] = useState<IPSDetailed[]>([]);
  const [assignedIPS, setAssignedIPS] = useState<IPSDetailed[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedIPS, setSelectedIPS] = useState<Set<string>>(new Set());

  const { showSuccess, showError, showConfirm, showLoading, close } = useSweetAlert();

  useEffect(() => {
    if (isOpen && eps) {
      loadIPSData();
    }
  }, [isOpen, eps]);

  const loadIPSData = async () => {
    if (!eps) return;

    try {
      setLoading(true);

      // Cargar IPS asignadas y disponibles en paralelo
      const [assignedResponse, availableResponse] = await Promise.all([
        epsAPI.getAssignedIPS(eps.id),
        ipsAPI.getAll({ sinAsignar: true, soloActivas: true, limit: 1000 })
      ]);

      if (assignedResponse.success) {
        setAssignedIPS(assignedResponse.data);
      }

      if (availableResponse.success) {
        setAvailableIPS(availableResponse.data.data);
      }

    } catch (error: any) {
      console.error('Error loading IPS data:', error);
      showError({
        title: 'Error al cargar datos',
        text: 'No se pudieron cargar las IPS disponibles'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddIPS = (ips: IPSDetailed) => {
    setAssignedIPS(prev => [...prev, ips]);
    setAvailableIPS(prev => prev.filter(item => item.id !== ips.id));
    setSelectedIPS(prev => {
      const newSet = new Set(prev);
      newSet.delete(ips.id);
      return newSet;
    });
  };

  const handleRemoveIPS = (ips: IPSDetailed) => {
    setAvailableIPS(prev => [...prev, ips].sort((a, b) => a.nombre.localeCompare(b.nombre)));
    setAssignedIPS(prev => prev.filter(item => item.id !== ips.id));
  };

  const handleAddSelected = () => {
    const ipsToAdd = availableIPS.filter(ips => selectedIPS.has(ips.id));
    
    ipsToAdd.forEach(ips => handleAddIPS(ips));
    setSelectedIPS(new Set());
  };

  const handleSaveChanges = async () => {
    if (!eps) return;

    const result = await showConfirm({
      title: '¿Guardar cambios?',
      text: `¿Confirmas los cambios en las IPS asignadas a ${eps.nombre}?`,
      icon: 'question',
      confirmButtonText: 'Sí, guardar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        setSaving(true);
        showLoading('Guardando cambios...', 'Actualizando asignaciones de IPS');

        const ipsIds = assignedIPS.map(ips => ips.id);
        const response = await epsAPI.assignIPS(eps.id, ipsIds);

        close();

        if (response.success) {
          showSuccess('Cambios guardados', {
            title: '¡Asignaciones actualizadas!',
            text: 'Las IPS han sido asignadas correctamente'
          });
          onSuccess();
        } else {
          showError({
            title: 'Error al guardar',
            text: response.message
          });
        }
      } catch (error: any) {
        close();
        showError({
          title: 'Error al guardar',
          text: error.message
        });
      } finally {
        setSaving(false);
      }
    }
  };

  const filteredAvailableIPS = availableIPS.filter(ips =>
    ips.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ips.codigo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredAssignedIPS = assignedIPS.filter(ips =>
    ips.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ips.codigo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isOpen || !eps) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-elegant max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-900 to-purple-800 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                <UserGroupIcon className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Asignar IPS a {eps.nombre}</h2>
                <p className="text-purple-100 text-sm">
                  Gestionar las IPS asignadas a esta EPS
                </p>
              </div>
            </div>
            <button 
              onClick={onClose}
              disabled={saving}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors disabled:opacity-50"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          {/* Buscador */}
          <div className="mb-6">
            <div className="relative max-w-md">
              <input
                type="text"
                placeholder="Buscar IPS por nombre o código..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Cargando IPS...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* IPS Disponibles */}
              <div className="card p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                    <span>IPS Disponibles</span>
                    <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                      {filteredAvailableIPS.length}
                    </span>
                  </h3>
                  {selectedIPS.size > 0 && (
                    <button
                      onClick={handleAddSelected}
                      className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 font-medium text-sm"
                    >
                      <PlusIcon className="w-4 h-4" />
                      <span>Agregar ({selectedIPS.size})</span>
                    </button>
                  )}
                </div>

                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {filteredAvailableIPS.length === 0 ? (
                    <div className="text-center py-8">
                      <ExclamationTriangleIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-500 text-sm">
                        {searchTerm ? 'No se encontraron IPS disponibles con esa búsqueda' : 'No hay IPS disponibles para asignar'}
                      </p>
                    </div>
                  ) : (
                    filteredAvailableIPS.map((ips) => (
                      <div
                        key={ips.id}
                        className={`flex items-center justify-between p-3 border rounded-lg transition-all duration-200 cursor-pointer ${
                          selectedIPS.has(ips.id)
                            ? 'border-blue-300 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                        onClick={() => {
                          const newSet = new Set(selectedIPS);
                          if (newSet.has(ips.id)) {
                            newSet.delete(ips.id);
                          } else {
                            newSet.add(ips.id);
                          }
                          setSelectedIPS(newSet);
                        }}
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`w-4 h-4 border-2 rounded flex items-center justify-center ${
                            selectedIPS.has(ips.id)
                              ? 'border-blue-600 bg-blue-600'
                              : 'border-gray-300'
                          }`}>
                            {selectedIPS.has(ips.id) && (
                              <CheckIcon className="w-3 h-3 text-white" />
                            )}
                          </div>
                          <div className={`w-2 h-2 rounded-full ${ips.activa ? 'bg-success-500' : 'bg-gray-400'}`}></div>
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-gray-900 truncate">{ips.nombre}</p>
                            <div className="flex items-center space-x-2 text-xs text-gray-500">
                              <span className="font-mono">{ips.codigo}</span>
                              {ips.tipoServicio && (
                                <>
                                  <span>•</span>
                                  <span>{ips.tipoServicio}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddIPS(ips);
                          }}
                          className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                          title="Agregar IPS"
                        >
                          <PlusIcon className="w-4 h-4" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* IPS Asignadas */}
              <div className="card p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                    <span>IPS Asignadas</span>
                    <span className="bg-success-100 text-success-800 text-xs font-medium px-2 py-1 rounded-full">
                      {filteredAssignedIPS.length}
                    </span>
                  </h3>
                </div>

                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {filteredAssignedIPS.length === 0 ? (
                    <div className="text-center py-8">
                      <UserGroupIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-500 text-sm">
                        {searchTerm ? 'No se encontraron IPS asignadas con esa búsqueda' : 'No hay IPS asignadas a esta EPS'}
                      </p>
                    </div>
                  ) : (
                    filteredAssignedIPS.map((ips) => (
                      <div
                        key={ips.id}
                        className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:border-gray-300 hover:bg-gray-50 transition-all duration-200"
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`w-2 h-2 rounded-full ${ips.activa ? 'bg-success-500' : 'bg-gray-400'}`}></div>
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-gray-900 truncate">{ips.nombre}</p>
                            <div className="flex items-center space-x-2 text-xs text-gray-500">
                              <span className="font-mono">{ips.codigo}</span>
                              {ips.tipoServicio && (
                                <>
                                  <span>•</span>
                                  <span>{ips.tipoServicio}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemoveIPS(ips)}
                          className="p-2 text-danger-600 hover:bg-danger-100 rounded-lg transition-colors"
                          title="Remover IPS"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex flex-col sm:flex-row items-center justify-between space-y-3 sm:space-y-0">
            <div className="text-sm text-gray-600">
              {assignedIPS.length} IPS asignadas a {eps.nombre}
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={onClose}
                disabled={saving}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveChanges}
                disabled={saving}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Guardando...</span>
                  </>
                ) : (
                  <>
                    <CheckIcon className="w-5 h-5" />
                    <span>Guardar Cambios</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};