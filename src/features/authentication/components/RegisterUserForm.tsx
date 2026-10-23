import React, { useState } from 'react';
import { userService } from '../services/userService';
import type { RegisterUserInput } from '../services/userService';
import { useSessionStore } from '../hooks/useSessionStore.ts';
import { userRolesService } from '../../users/services/userRolesService';

export const RegisterUserForm: React.FC = () => {
  const sessionRoles = useSessionStore((state) => state.roles);
  const isAdmin = sessionRoles.includes('ADMIN');

  const [formData, setFormData] = useState<RegisterUserInput>({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    role: 'VIEWER',
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Si el usuario actual no es ADMIN, mostramos una alerta de acceso restringido
  if (!isAdmin) {
    return (
      <div style={{
        backgroundColor: '#fef2f2',
        border: '1px solid #fca5a5',
        color: '#991b1b',
        padding: '1.5rem',
        borderRadius: '0.75rem',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
        maxWidth: '500px',
        margin: '2rem auto'
      }}>
        <div style={{ fontWeight: '600', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ 
            backgroundColor: '#dc2626', 
            color: 'white', 
            borderRadius: '50%', 
            width: '20px', 
            height: '20px', 
            display: 'inline-flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            fontSize: '12px',
            fontWeight: 'bold'
          }}>!</span>
          Acceso restringido
        </div>
        <div style={{ fontSize: '0.9rem', color: '#7f1d1d' }}>
          No tienes los permisos de administración necesarios (rol ADMIN) para registrar nuevos usuarios en el sistema.
        </div>
      </div>
    );
  }

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    // Validar Nombre
    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es obligatorio';
    }

    // Validar Correo
    if (!formData.email.trim()) {
      newErrors.email = 'El correo electrónico es obligatorio';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.email = 'El correo electrónico no tiene un formato válido';
      }
    }

    // Validar Contraseña
    if (formData.password.length < 8) {
      newErrors.password = 'La contraseña debe tener al menos ocho caracteres';
    }

    // Validar Confirmación
    if (formData.password !== formData.password_confirmation) {
      newErrors.password_confirmation = 'Las contraseñas no coinciden';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage('');

    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const created = await userService.register({ ...formData, role: 'VIEWER' });
await userRolesService.assign(created.id, 'VIEWER');
      setSuccessMessage('Usuario registrado correctamente');
      setFormData({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        role: 'VIEWER',
      });
      setErrors({});
    } catch (error: any) {
      if (error?.response?.data?.message?.includes('email') || error?.status === 422) {
        setErrors((prev) => ({
          ...prev,
          email: 'El correo electrónico ya está registrado',
        }));
      } else {
        setErrors((prev) => ({
          ...prev,
          general: error.message || 'Error al registrar el usuario',
        }));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 border rounded shadow-sm">
      <h2>Registrar usuario</h2>
      <p>Define la identidad y el rol inicial del usuario.</p>

      {successMessage && (
        <div style={{
          backgroundColor: '#f0fdf4',
          border: '1px solid #86efac',
          color: '#166534',
          padding: '1rem 1.25rem',
          borderRadius: '0.75rem',
          marginBottom: '1.5rem',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.25rem'
        }}>
          <div style={{ fontWeight: '600', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ 
              backgroundColor: '#15803d', 
              color: 'white', 
              borderRadius: '50%', 
              width: '18px', 
              height: '18px', 
              display: 'inline-flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              fontSize: '11px',
              fontWeight: 'bold'
            }}>✓</span>
            Operación exitosa
          </div>
          <div style={{ fontSize: '0.85rem', color: '#14532d', paddingLeft: '1.5rem' }}>
            {successMessage}
          </div>
        </div>
      )}

      {errors.general && (
        <div style={{
          backgroundColor: '#fef2f2',
          border: '1px solid #fca5a5',
          color: '#991b1b',
          padding: '1rem 1.25rem',
          borderRadius: '0.75rem',
          marginBottom: '1.5rem',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.25rem'
        }}>
          <div style={{ fontWeight: '600', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ 
              backgroundColor: '#dc2626', 
              color: 'white', 
              borderRadius: '50%', 
              width: '18px', 
              height: '18px', 
              display: 'inline-flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              fontSize: '11px',
              fontWeight: 'bold'
            }}>!</span>
            Error en la operación
          </div>
          <div style={{ fontSize: '0.85rem', color: '#7f1d1d', paddingLeft: '1.5rem' }}>
            {errors.general}
          </div>
        </div>
      )}

      <div className="mb-3">
        <label>Nombre completo *</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="form-control"
          style={errors.name ? { borderColor: '#ef4444' } : {}}
        />
        {errors.name && <span style={{ color: '#ef4444', fontSize: '0.85rem', marginTop: '0.25rem', display: 'block' }}>{errors.name}</span>}
      </div>

      <div className="mb-3">
        <label>Correo electrónico *</label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="form-control"
          style={errors.email ? { borderColor: '#ef4444' } : {}}
        />
        {errors.email && <span style={{ color: '#ef4444', fontSize: '0.85rem', marginTop: '0.25rem', display: 'block' }}>{errors.email}</span>}
      </div>

      <div className="mb-3">
        <label>Contraseña *</label>
        <input
          type="password"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          className="form-control"
          style={errors.password ? { borderColor: '#ef4444' } : {}}
        />
        {errors.password && <span style={{ color: '#ef4444', fontSize: '0.85rem', marginTop: '0.25rem', display: 'block' }}>{errors.password}</span>}
      </div>

      <div className="mb-3">
        <label>Confirmar contraseña *</label>
        <input
          type="password"
          value={formData.password_confirmation}
          onChange={(e) => setFormData({ ...formData, password_confirmation: e.target.value })}
          className="form-control"
          style={errors.password_confirmation ? { borderColor: '#ef4444' } : {}}
        />
        {errors.password_confirmation && (
          <span style={{ color: '#ef4444', fontSize: '0.85rem', marginTop: '0.25rem', display: 'block' }}>
            {errors.password_confirmation}
          </span>
        )}
      </div>

      <div className="mb-3">
  <label>Rol inicial *</label>
  <select value="VIEWER" disabled className="form-control">
    <option value="VIEWER">VIEWER</option>
  </select>
</div>

      <button type="submit" disabled={isSubmitting} className="btn btn-primary">
        {isSubmitting ? 'Guardando...' : 'Guardar cambios'}
      </button>
    </form>
  );
};