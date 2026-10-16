import React from 'react';
import { RegisterUserForm } from '../../authentication/components/RegisterUserForm';
import styles from './UsersPage.module.css';

export const UsersPage: React.FC = () => {
  return (
    <div className={styles.container}>
      <div className={styles.pageHeader}>
        <h1>Gestión de usuarios</h1>
        <p>Define la identidad y el rol inicial del usuario.</p>
      </div>

      <div className={styles.card}>
        <RegisterUserForm />
      </div>
    </div>
  );
};