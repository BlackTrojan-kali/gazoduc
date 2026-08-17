import React from 'react'
import SignInForm from '../../components/auth/SignInForm'
import { Head, usePage } from '@inertiajs/react'
import ToastProvider from '../../components/ui/alert/ToastProvider'
const loginPage = () => {
  return (
    <>
    <ToastProvider/>
    <Head title='Connexion'/>
    <SignInForm/>
    </>
  )
}

export default loginPage