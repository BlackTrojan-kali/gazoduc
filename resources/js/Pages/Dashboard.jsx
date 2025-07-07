import React from 'react'
import AppLayout from '../layout/AppLayout'

const Dashboard = () => {
  return (
    <div className='text-9xl'>Dashboard</div>
  )
}
Dashboard.layout = (page) => <AppLayout children={page}/>
export default Dashboard