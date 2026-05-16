import { seedServerCookies } from '@/lib/token-storage';
import React from 'react'

const Layout = async ({ children }:{ children:React.ReactNode }) => {
    await seedServerCookies();
  return children
}

export default Layout