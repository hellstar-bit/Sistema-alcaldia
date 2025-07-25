// frontend/src/components/gestion/EPSFormModal.tsx
import React, { useState, useEffect } from 'react';
import {
  XMarkIcon,
  BuildingOfficeIcon,
  PlusIcon,
  PencilIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';
import { epsAPI, gestionUtils, type EPSDetailed, type CreateEPSRequest, type UpdateEPSRequest } from '../../services/gestionApi';
import { useSweetAlert } from '../../hooks/useSweetAlert';

interface EPSFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingEPS?: EPSDetailed | null;
  onSuccess: () => void;
}

interface FormData {
  nombre: string;
  codigo: string;
  descripcion: string;
  direccion: string;
  telefono: string;
  email: string;
  contacto: string;
  activa: boolean;
}

interface FormErrors {
  nombre?: string;
  codigo?: string;
  email?: string;
  telefono?: string;
}

export const EPSFormModal: React.FC<EPSFormModalProps> = ({
  isOpen,
  onClose,
  editingEPS,
  onSuccess
}) => {
  const [formData, setFormData] = useState<FormData>({
    nombre: '',
    codigo: '',
    descripcion: '',
    direccion: '',
    telefono: '',
    email: '',
    contacto: '',
    activa: true
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [generateCode, setGenerateCode] = useState(true);

  const { showSuccess, showError, showLoading, close } = useSweetAlert();

  const isEditing = !!editingEPS;

  useEffect(() => {
    if (isOpen) {
      if (editingEPS) {
        setFormData({
          nombre: editingEPS.nombre || '',
          codigo: editingEPS.codigo || '',
          descripcion: editingEPS.descripcion || '',
          direccion: editingEPS.direccion || '',
          telefono: editingEPS.telefono || '',
          email: editingEPS.email || '',
          contacto: editingEPS.contacto || '',
          activa: editingEPS.activa
        });
        setGenerateCode(false);
      } else {
        resetForm();
      }
      setErrors({});
    }
  }, [isOpen, editingEPS]);

  const resetForm = () => {
    setFormData({
      nombre: '',
      codigo: '',
      descripcion: '',
      direccion: '',
      telefono: '',
      email: '',
      contacto: '',
      activa: true
    });
    setGenerateCode(true);
    setErrors({});
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Auto-generar código basado en el nombre
    if (name === 'nombre' && generateCode && !isEditing) {
      const generatedCode = gestionUtils.generateEPSCode(value);
      setFormData(prev => ({
        ...prev,
        codigo: generatedCode
      }));
    }

    // Limpiar errores del campo modificado
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido';
    } else if (formData.nombre.trim().length < 3) {
      newErrors.nombre = 'El nombre debe tener al menos 3 caracteres';
    }

    if (!formData.codigo.trim()) {
      newErrors.codigo = 'El código es requerido';
    } else if (formData.codigo.trim().length < 3) {
      newErrors.codigo = 'El código debe tener al menos 3 caracteres';
    }

    if (formData.email && !gestionUtils.validateEmail(formData.email)) {
      newErrors.email = 'El email no es válido';
    }

    if (formData.telefono && !gestionUtils.validatePhone(formData.telefono)) {
      newErrors.telefono = 'El teléfono no es válido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    showLoading(
      isEditing ? 'Actualizando EPS...' : 'Creando EPS...',
      'Guardando información'
    );

    try {
      if (isEditing) {
        const updateData: UpdateEPSRequest = {
          nombre: formData.nombre.trim(),
          codigo: formData.codigo.trim(),
          descripcion: formData.descripcion.trim() || undefined,
          direccion: formData.direccion.trim() || undefined,
          telefono: formData.telefono.trim() || undefined,
          email: formData.email.trim() || undefined,
          contacto: formData.contacto.trim() || undefined,
          activa: formData.activa
        };

        const response = await epsAPI.update(editingEPS!.id, updateData);
        
        close();
        
        if (response.success) {
          showSuccess('EPS actualizada', {
            title: '¡EPS actualizada!',
            text: 'Los datos de la EPS han sido actualizados exitosamente'
          });
          onSuccess();
        } else {
          showError({
            title: 'Error al actualizar',
            text: response.message
          });
        }
      } else {
        const createData: CreateEPSRequest = {
          nombre: formData.nombre.trim(),
          codigo: formData.codigo.trim(),
          descripcion: formData.descripcion.trim() || undefined,
          direccion: formData.direccion.trim() || undefined,
          telefono: formData.telefono.trim() || undefined,
          email: formData.email.trim() || undefined,
          contacto: formData.contacto.trim() || undefined,
          activa: formData.activa
        };

        const response = await epsAPI.create(createData);
        
        close();
        
        if (response.success) {
          showSuccess('EPS creada', {
            title: '¡EPS creada exitosamente!',
            text: 'La nueva EPS ha sido registrada en el sistema'
          });
          onSuccess();
        } else {
          showError({
            title: 'Error al crear',
            text: response.message
          });
        }
      }
    } catch (error: any) {
      close();
      showError({
        title: isEditing ? 'Error al actualizar' : 'Error al crear',
        text: error.message || 'Ocurrió un error inesperado'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-elegant max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-900 to-primary-800 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                {isEditing ? <PencilIcon className="w-6 h-6" /> : <PlusIcon className="w-6 h-6" />}
              </div>
              <div>
                <h2 className="text-xl font-bold">
                  {isEditing ? 'Editar EPS' : 'Nueva EPS'}
                </h2>
                <p className="text-primary-100 text-sm">
                  {isEditing ? 'Modificar información de la EPS' : 'Registrar nueva Entidad Promotora de Salud'}
                </p>
              </div>
            </div>
            <button 
              onClick={handleClose}
              disabled={loading}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors disabled:opacity-50"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="space-y-6">
            {/* Información Básica */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <BuildingOfficeIcon className="w-5 h-5 text-primary-600" />
                <span>Información Básica</span>
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre de la EPS *
                  </label>
                  <input
                    type="text"
                    id="nombre"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors ${
                      errors.nombre ? 'border-danger-500 bg-danger-50' : 'border-gray-300'
                    }`}
                    placeholder="Ej: COMPENSAR, SURA, SANITAS..."
                    disabled={loading}
                  />
                  {errors.nombre && (
                    <p className="mt-1 text-sm text-danger-600 flex items-center">
                      <ExclamationCircleIcon className="w-4 h-4 mr-1" />
                      {errors.nombre}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="codigo" className="block text-sm font-medium text-gray-700 mb-2">
                    Código *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      id="codigo"
                      name="codigo"
                      value={formData.codigo}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors font-mono ${
                        errors.codigo ? 'border-danger-500 bg-danger-50' : 'border-gray-300'
                      }`}
                      placeholder="EPS_CODIGO_123"
                      disabled={loading}
                    />
                    {!isEditing && (
                      <div className="mt-2">
                        <label className="flex items-center text-sm text-gray-600">
                          <input
                            type="checkbox"
                            checked={generateCode}
                            onChange={(e) => setGenerateCode(e.target.checked)}
                            className="mr-2 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                            disabled={loading}
                          />
                          Generar código automáticamente
                        </label>
                      </div>
                    )}
                  </div>
                  {errors.codigo && (
                    <p className="mt-1 text-sm text-danger-600 flex items-center">
                      <ExclamationCircleIcon className="w-4 h-4 mr-1" />
                      {errors.codigo}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="activa" className="block text-sm font-medium text-gray-700 mb-2">
                    Estado
                  </label>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="activa"
                      name="activa"
                      checked={formData.activa}
                      onChange={handleInputChange}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      disabled={loading}
                    />
                    <label htmlFor="activa" className="ml-2 text-sm text-gray-600">
                      EPS activa
                    </label>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700 mb-2">
                    Descripción
                  </label>
                  <textarea
                    id="descripcion"
                    name="descripcion"
                    value={formData.descripcion}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors resize-none"
                    placeholder="Descripción opcional de la EPS..."
                    disabled={loading}
                  />
                </div>
              </div>
            </div>

            {/* Información de Contacto */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Información de Contacto</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label htmlFor="direccion" className="block text-sm font-medium text-gray-700 mb-2">
                    Dirección
                  </label>
                  <input
                    type="text"
                    id="direccion"
                    name="direccion"
                    value={formData.direccion}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                    placeholder="Dirección de la sede principal"
                    disabled={loading}
                  />
                </div>

                <div>
                  <label htmlFor="telefono" className="block text-sm font-medium text-gray-700 mb-2">
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    id="telefono"
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors ${
                      errors.telefono ? 'border-danger-500 bg-danger-50' : 'border-gray-300'
                    }`}
                    placeholder="(601) 234-5678"
                    disabled={loading}
                  />
                  {errors.telefono && (
                    <p className="mt-1 text-sm text-danger-600 flex items-center">
                      <ExclamationCircleIcon className="w-4 h-4 mr-1" />
                      {errors.telefono}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors ${
                      errors.email ? 'border-danger-500 bg-danger-50' : 'border-gray-300'
                    }`}
                    placeholder="contacto@eps.com"
                    disabled={loading}
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-danger-600 flex items-center">
                      <ExclamationCircleIcon className="w-4 h-4 mr-1" />
                      {errors.email}
                    </p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="contacto" className="block text-sm font-medium text-gray-700 mb-2">
                    Persona de Contacto
                  </label>
                  <input
                    type="text"
                    id="contacto"
                    name="contacto"
                    value={formData.contacto}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                    placeholder="Nombre del contacto principal"
                    disabled={loading}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Botones */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-end space-y-3 sm:space-y-0 sm:space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="w-full sm:w-auto px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>{isEditing ? 'Actualizando...' : 'Creando...'}</span>
                </>
              ) : (
                <>
                  {isEditing ? <PencilIcon className="w-5 h-5" /> : <PlusIcon className="w-5 h-5" />}
                  <span>{isEditing ? 'Actualizar EPS' : 'Crear EPS'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};