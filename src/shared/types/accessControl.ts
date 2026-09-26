import type { PERMISSIONS, ROLES } from '../constants/accessControl.ts'

export type Role = (typeof ROLES)[number]

export type Permission = (typeof PERMISSIONS)[number]
