import type { ReactNode } from 'react'

import styles from './RootLayout.module.css'

type RootLayoutProps = {
  children: ReactNode
}

export function RootLayout({ children }: RootLayoutProps) {
  return <main className={styles.root}>{children}</main>
}
