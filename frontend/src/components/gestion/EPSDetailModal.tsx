// frontend/src/components/gestion/EPSDetailModal.tsx
import React from 'react';
import {
  XMarkIcon,
  BuildingOfficeIcon,
  PencilIcon,
  UserGroupIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  UserIcon,
  CalendarDaysIcon,
  CheckCircleIcon,
  XCircleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import { gestionUtils, type EPSDetailed } from '../../services/gestionApi';

interface EPSDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  eps: EPSDetailed | null;
  onEdit: (eps: EPSDetailed) => void;
  onAssignIPS: (eps: EPSDetailed) => void;
}

export const EPSDetailModal: React.FC<EPSDetailModalProps> = ({
  isOpen,
  onClose,
  eps,
  onEdit,
  onAssignIPS
}) => {
  if (!isOpen || !eps) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-elegant max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-900 to-primary-800 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                <BuildingOfficeIcon className="w-7 h-7" />
              </div>
              <div>
                <h2 className="text-xl font-bold">{eps.nombre}</h2>
                <p className="text-primary-100 text-sm">Detalles de la Entidad Promotora de Salud</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => onEdit(eps)}
                className="flex items-center space-x-2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-3 py-2 rounded-lg transition-all duration-200"
              >
                <PencilIcon className="w-4 h-4" />
                <span>Editar</span>
              </button>
              <button
                onClick={() => onAssignIPS(eps)}
                className="flex items-center space-x-2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-3 py-2 rounded-lg transition-all duration-200"
              >
                <UserGroupIcon className="w-4 h-4" />
                <span>IPS</span>
              </button>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Información Principal */}
            <div className="lg:col-span-2 space-y-6">
              {/* Información Básica */}
              <div className="card p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                  <InformationCircleIcon className="w-5 h-5 text-primary-600" />
                  <span>Información Básica</span>
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Nombre</label>
                    <div className="flex items-center space-x-2">
                      <span className="text-lg font-semibold text-gray-900">{eps.nombre}</span>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${gestionUtils.getStatusBadgeClasses(eps.activa)}`}>
                        {eps.activa ? (
                          <>
                            <CheckCircleIcon className="w-3 h-3 mr-1" />
                            Activa
                          </>
                        ) : (
                          <>
                            <XCircleIcon className="w-3 h-3 mr-1" />
                            Inactiva
                          </>
                        )}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Código</label>
                    <span className="font-mono text-sm bg-gray-100 px-3 py-2 rounded-lg inline-block">{eps.codigo}</span>
                  </div>

                  {eps.descripcion && (
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-600 mb-1">Descripción</label>
                      <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{eps.descripcion}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Información de Contacto */}
              <div className="card p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Información de Contacto</h3>
                
                <div className="space-y-4">
                  {eps.direccion && (
                    <div className="flex items-start space-x-3">
                      <MapPinIcon className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <label className="block text-sm font-medium text-gray-600">Dirección</label>
                        <p className="text-gray-900">{eps.direccion}</p>
                      </div>
                    </div>
                  )}

                  {eps.telefono && (
                    <div className="flex items-start space-x-3">
                      <PhoneIcon className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <label className="block text-sm font-medium text-gray-600">Teléfono</label>
                        <a href={`tel:${eps.telefono}`} className="text-primary-600 hover:text-primary-800 transition-colors">
                          {eps.telefono}
                        </a>
                      </div>
                    </div>
                  )}

                  {eps.email && (
                    <div className="flex items-start space-x-3">
                      <EnvelopeIcon className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <label className="block text-sm font-medium text-gray-600">Email</label>
                        <a href={`mailto:${eps.email}`} className="text-primary-600 hover:text-primary-800 transition-colors">
                          {eps.email}
                        </a>
                      </div>
                    </div>
                  )}

                  {eps.contacto && (
                    <div className="flex items-start space-x-3">
                      <UserIcon className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <label className="block text-sm font-medium text-gray-600">Persona de Contacto</label>
                        <p className="text-gray-900">{eps.contacto}</p>
                      </div>
                    </div>
                  )}

                  {!eps.direccion && !eps.telefono && !eps.email && !eps.contacto && (
                    <div className="text-center py-6">
                      <InformationCircleIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-500 text-sm">No hay información de contacto registrada</p>
                    </div>
                  )}
                </div>
              </div>

              {/* IPS Asignadas */}
              <div className="card p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                    <UserGroupIcon className="w-5 h-5 text-primary-600" />
                    <span>IPS Asignadas</span>
                    <span className="bg-primary-100 text-primary-800 text-xs font-medium px-2 py-1 rounded-full">
                      {eps.ipsAsignadas?.length || 0}
                    </span>
                  </h3>
                  <button
                    onClick={() => onAssignIPS(eps)}
                    className="text-primary-600 hover:text-primary-800 font-medium text-sm"
                  >
                    Gestionar IPS →
                  </button>
                </div>

                {eps.ipsAsignadas && eps.ipsAsignadas.length > 0 ? (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {eps.ipsAsignadas.map((ips) => (
                      <div key={ips.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className={`w-2 h-2 rounded-full ${ips.activa ? 'bg-success-500' : 'bg-gray-400'}`}></div>
                          <div>
                            <p className="font-medium text-gray-900">{ips.nombre}</p>
                            <p className="text-xs text-gray-500">{ips.codigo}</p>
                          </div>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full ${gestionUtils.getStatusBadgeClasses(ips.activa)}`}>
                          {ips.activa ? 'Activa' : 'Inactiva'}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <UserGroupIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm mb-3">No hay IPS asignadas a esta EPS</p>
                    <button
                      onClick={() => onAssignIPS(eps)}
                      className="btn-primary text-sm"
                    >
                      Asignar IPS
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Panel Lateral */}
            <div className="space-y-6">
              {/* Información del Sistema */}
              <div className="card p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                  <CalendarDaysIcon className="w-5 h-5 text-primary-600" />
                  <span>Información del Sistema</span>
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Fecha de Creación</label>
                    <p className="text-gray-900">{gestionUtils.formatDate(eps.createdAt)}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Última Actualización</label>
                    <p className="text-gray-900">{gestionUtils.formatDate(eps.updatedAt)}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">ID del Sistema</label>
                    <p className="font-mono text-xs bg-gray-100 px-2 py-1 rounded text-gray-600 break-all">
                      {eps.id}
                    </p>
                  </div>
                </div>
              </div>

              {/* Estadísticas Rápidas */}
              <div className="card p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumen</h3>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600">Estado</span>
                    <span className={`font-medium ${gestionUtils.getStatusColor(eps.activa)}`}>
                      {eps.activa ? 'Activa' : 'Inactiva'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600">IPS Asignadas</span>
                    <span className="font-medium text-gray-900">
                      {eps.ipsAsignadas?.length || 0}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600">Contacto Completo</span>
                    <span className="font-medium text-gray-900">
                      {(eps.telefono || eps.email) ? 'Sí' : 'No'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Acciones Rápidas */}
              <div className="card p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Acciones</h3>
                
                <div className="space-y-3">
                  <button
                    onClick={() => onEdit(eps)}
                    className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <PencilIcon className="w-5 h-5 text-primary-600" />
                    <div>
                      <p className="font-medium text-gray-900">Editar EPS</p>
                      <p className="text-xs text-gray-500">Modificar información básica</p>
                    </div>
                  </button>

                  <button
                    onClick={() => onAssignIPS(eps)}
                    className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <UserGroupIcon className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="font-medium text-gray-900">Gestionar IPS</p>
                      <p className="text-xs text-gray-500">Asignar o remover IPS</p>
                    </div>
                  </button>

                  {eps.telefono && (
                    <a
                      href={`tel:${eps.telefono}`}
                      className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <PhoneIcon className="w-5 h-5 text-success-600" />
                      <div>
                        <p className="font-medium text-gray-900">Llamar</p>
                        <p className="text-xs text-gray-500">Contactar por teléfono</p>
                      </div>
                    </a>
                  )}

                  {eps.email && (
                    <a
                      href={`mailto:${eps.email}`}
                      className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <EnvelopeIcon className="w-5 h-5 text-purple-600" />
                      <div>
                        <p className="font-medium text-gray-900">Enviar Email</p>
                        <p className="text-xs text-gray-500">Contactar por correo</p>
                      </div>
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};