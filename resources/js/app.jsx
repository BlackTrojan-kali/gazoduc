import './bootstrap';
import { createInertiaApp } from '@inertiajs/react'
import { createRoot } from 'react-dom/client'
import { SidebarProvider } from './context/SidebarContext';
import { ThemeProvider } from './context/ThemeContext';
import { LicenceContextProvider } from './context/LicenceChoiceContext';

createInertiaApp({
  resolve: name => {
    const pages = import.meta.glob('./Pages/**/*.jsx', { eager: true })
    return pages[`./Pages/${name}.jsx`]
  },
  setup({ el, App, props }) {
    createRoot(el).render(
    <SidebarProvider>
      <ThemeProvider>
      <LicenceContextProvider>
    <App {...props} />
    </LicenceContextProvider>
    </ThemeProvider>
    </SidebarProvider>)
  },
})