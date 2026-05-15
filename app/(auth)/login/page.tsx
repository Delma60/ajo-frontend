'use client'
import { Auth } from '@/lib/auth'
import React from 'react'

const Login = () => {

  return (
    <div>
      <button className="bg-green-400 rounded p-4" onClick={() => {
        Auth.attempt({ email: '', password: '' })
      }}>
        login
      </button>
    </div>
  )
}

export default Login