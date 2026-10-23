import React from 'react';
import { RegisterUserForm } from '../../authentication/components/RegisterUserForm';
import { UsersTable } from '../components/UsersTable.tsx';
import { useUsersWithRoles } from '../hooks/useUsersWithRoles.ts';
import tableStyles from '../../../shared/styles/dataTable.module.css';
import styles from './UsersPage.module.css';

export const UsersPage: React.FC = () => {
  const { users, rows, rolesError } = useUsersWithRoles();

  return (
    <div className={tableStyles.stack}>
      <div className={styles.pageHeader}>
        <h1>Gestión de usuarios</h1>
        <p>Consulta los usuarios registrados y registra nuevos.</p>
      </div>

      <section className={tableStyles.panel} aria-label="Usuarios registrados">
        {users.isPending && <p role="status">Cargando usuarios…</p>}
        {users.isError && (
          <p role="alert">
            {users.error.message}{' '}
            <button type="button" onClick={() => void users.refetch()}>Reintentar</button>
          </p>
        )}
        {users.isSuccess && <UsersTable rows={rows} />}
        {rolesError && <p role="alert">No se pudieron cargar los roles de algunos usuarios.</p>}
      </section>

      <div className={`${tableStyles.panel} ${styles.card}`}>
        <RegisterUserForm />
      </div>
    </div>
  );
};