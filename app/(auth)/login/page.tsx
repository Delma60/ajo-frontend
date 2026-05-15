'use client'
import { Auth } from '@/lib/auth'
import React from 'react'

const Login = () => {

  return (
    <div>
      <button className="" onClick={() => {
        Auth.attempt({ email: '', password: '' })
      }}>
        login
      </button>
    </div>
  )
}

export default Login