// frontend/src/components/gestion/IPSDetailModal.tsx
import React from 'react';
import {
  XMarkIcon,
  AcademicCapIcon,
  PencilIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  UserIcon,
  CalendarDaysIcon,
  CheckCircleIcon,
  XCircleIcon,
  InformationCircleIcon,
  TagIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline';
import { gestionUtils, type IPSDetailed } from '../../services/gestionApi';

interface IPSDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  ips: IPSDetailed | null;
  onEdit: (ips: IPSDetailed) => void;
}

const getTipoServicioColor = (tipo: string): string => {
  const colorMap: { [key: string]: string } = {
    'Ambulatorio': 'blue',
    'Hospitalario': 'green',
    'Mixto': 'purple',
    'Especializado': 'orange',
    'Urgencias': 'red',
    'Rehabilitación': 'indigo',
    'Laboratorio': 'yellow',
    'Imágenes Diagnósticas': 'pink'
  };
  return colorMap[tipo] || 'gray';
};

const getTipoServicioBadgeClasses = (tipo: string): string => {
  const color = getTipoServicioColor(tipo);
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-800 border-blue-200',
    green: 'bg-green-100 text-green-800 border-green-200',
    purple: 'bg-purple-100 text-purple-800 border-purple-200',
    orange: 'bg-orange-100 text-orange-800 border-orange-200',
    red: 'bg-red-100 text-red-800 border-red-200',
    indigo: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    yellow: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    pink: 'bg-pink-100 text-pink-800 border-pink-200',
    gray: 'bg-gray-100 text-gray-800 border-gray-200'
  };
  return colorClasses[color as keyof typeof colorClasses] || colorClasses.gray;
};

export const IPSDetailModal: React.FC<IPSDetailModalProps> = ({
  isOpen,
  onClose,
  ips,
  onEdit
}) => {
  if (!isOpen || !ips) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-elegant max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900 to-blue-800 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                <AcademicCapIcon className="w-7 h-7" />
              </div>
              <div>
                <h2 className="text-xl font-bold">{ips.nombre}</h2>
                <p className="text-blue-100 text-sm">Detalles de la Institución Prestadora de Servicios de Salud</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => onEdit(ips)}
                className="flex items-center space-x-2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-3 py-2 rounded-lg transition-all duration-200"
              >
                <PencilIcon className="w-4 h-4" />
                <span>Editar</span>
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
                  <InformationCircleIcon className="w-5 h-5 text-blue-600" />
                  <span>Información Básica</span>
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Nombre</label>
                    <div className="flex items-center space-x-2">
                      <span className="text-lg font-semibold text-gray-900">{ips.nombre}</span>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${gestionUtils.getStatusBadgeClasses(ips.activa)}`}>
                        {ips.activa ? (
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
                    <span className="font-mono text-sm bg-gray-100 px-3 py-2 rounded-lg inline-block">{ips.codigo}</span>
                  </div>

                  {ips.tipoServicio && (
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Tipo de Servicio</label>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getTipoServicioBadgeClasses(ips.tipoServicio)}`}>
                        <TagIcon className="w-4 h-4 mr-1" />
                        {ips.tipoServicio}
                      </span>
                    </div>
                  )}

                  {ips.descripcion && (
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-600 mb-1">Descripción</label>
                      <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{ips.descripcion}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Información de Contacto */}
              <div className="card p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Información de Contacto</h3>
                
                <div className="space-y-4">
                  {ips.direccion && (
                    <div className="flex items-start space-x-3">
                      <MapPinIcon className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <label className="block text-sm font-medium text-gray-600">Dirección</label>
                        <p className="text-gray-900">{ips.direccion}</p>
                      </div>
                    </div>
                  )}

                  {ips.telefono && (
                    <div className="flex items-start space-x-3">
                      <PhoneIcon className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <label className="block text-sm font-medium text-gray-600">Teléfono</label>
                        <a href={`tel:${ips.telefono}`} className="text-blue-600 hover:text-blue-800 transition-colors">
                          {ips.telefono}
                        </a>
                      </div>
                    </div>
                  )}

                  {ips.email && (
                    <div className="flex items-start space-x-3">
                      <EnvelopeIcon className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <label className="block text-sm font-medium text-gray-600">Email</label>
                        <a href={`mailto:${ips.email}`} className="text-blue-600 hover:text-blue-800 transition-colors">
                          {ips.email}
                        </a>
                      </div>
                    </div>
                  )}

                  {ips.contacto && (
                    <div className="flex items-start space-x-3">
                      <UserIcon className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <label className="block text-sm font-medium text-gray-600">Persona de Contacto</label>
                        <p className="text-gray-900">{ips.contacto}</p>
                      </div>
                    </div>
                  )}

                  {!ips.direccion && !ips.telefono && !ips.email && !ips.contacto && (
                    <div className="text-center py-6">
                      <InformationCircleIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-500 text-sm">No hay información de contacto registrada</p>
                    </div>
                  )}
                </div>
              </div>

              {/* EPS Asignadas */}
              <div className="card p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                    <BuildingOfficeIcon className="w-5 h-5 text-blue-600" />
                    <span>EPS Asignadas</span>
                    <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                      {ips.eps?.length || 0}
                    </span>
                  </h3>
                </div>

                {ips.eps && ips.eps.length > 0 ? (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {ips.eps.map((eps) => (
                      <div key={eps.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className={`w-2 h-2 rounded-full ${eps.activa ? 'bg-success-500' : 'bg-gray-400'}`}></div>
                          <div>
                            <p className="font-medium text-gray-900">{eps.nombre}</p>
                            <p className="text-xs text-gray-500">{eps.codigo}</p>
                          </div>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full ${gestionUtils.getStatusBadgeClasses(eps.activa)}`}>
                          {eps.activa ? 'Activa' : 'Inactiva'}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <BuildingOfficeIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm">Esta IPS no está asignada a ninguna EPS</p>
                  </div>
                )}
              </div>
            </div>

            {/* Panel Lateral */}
            <div className="space-y-6">
              {/* Información del Sistema */}
              <div className="card p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                  <CalendarDaysIcon className="w-5 h-5 text-blue-600" />
                  <span>Información del Sistema</span>
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Fecha de Creación</label>
                    <p className="text-gray-900">{gestionUtils.formatDate(ips.createdAt)}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Última Actualización</label>
                    <p className="text-gray-900">{gestionUtils.formatDate(ips.updatedAt)}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">ID del Sistema</label>
                    <p className="font-mono text-xs bg-gray-100 px-2 py-1 rounded text-gray-600 break-all">
                      {ips.id}
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
                    <span className={`font-medium ${gestionUtils.getStatusColor(ips.activa)}`}>
                      {ips.activa ? 'Activa' : 'Inactiva'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600">Tipo de Servicio</span>
                    <span className="font-medium text-gray-900">
                      {ips.tipoServicio || 'No especificado'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600">EPS Asignadas</span>
                    <span className="font-medium text-gray-900">
                      {ips.eps?.length || 0}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600">Contacto Completo</span>
                    <span className="font-medium text-gray-900">
                      {(ips.telefono || ips.email) ? 'Sí' : 'No'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Acciones Rápidas */}
              <div className="card p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Acciones</h3>
                
                <div className="space-y-3">
                  <button
                    onClick={() => onEdit(ips)}
                    className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <PencilIcon className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="font-medium text-gray-900">Editar IPS</p>
                      <p className="text-xs text-gray-500">Modificar información básica</p>
                    </div>
                  </button>

                  {ips.telefono && (
                    <a
                      href={`tel:${ips.telefono}`}
                      className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <PhoneIcon className="w-5 h-5 text-success-600" />
                      <div>
                        <p className="font-medium text-gray-900">Llamar</p>
                        <p className="text-xs text-gray-500">Contactar por teléfono</p>
                      </div>
                    </a>
                  )}

                  {ips.email && (
                    <a
                      href={`mailto:${ips.email}`}
                      className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <EnvelopeIcon className="w-5 h-5 text-purple-600" />
                      <div>
                        <p className="font-medium text-gray-900">Enviar Email</p>
                        <p className="text-xs text-gray-500">Contactar por correo</p>
                      </div>
                    </a>
                  )}

                  {ips.direccion && (
                    <a
                      href={`https://maps.google.com/?q=${encodeURIComponent(ips.direccion)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <MapPinIcon className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="font-medium text-gray-900">Ver Ubicación</p>
                        <p className="text-xs text-gray-500">Abrir en Google Maps</p>
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