import React, { useMemo } from 'react'
import Input from '../../form/input/InputField'
import Select from "react-select"
import { useForm } from '@inertiajs/react'
import Button from '../../ui/button/Button'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSpinner } from '@fortawesome/free-solid-svg-icons'

const CreateClosureModal = ({isOpenCreateModal,setIsOpenCreateModal,agencies}) => {
    const handleCloseModal = ()=>{
        setIsOpenCreateModal(false) 
    }
    const agenciesOption = useMemo(()=>agencies.map(agency=>({
value:String(agency.id),
label:agency.name
    })))
    const {data,setData,post,processing,errors} = useForm({
        agency_id:"",
        starting_date: "",
        ending_date:"",
        
    })
    const handleSelectChange = (selectedOption)=>{
        setData("agency_id",selectedOption.value)
    }
    const handleSubmit = (e)=>{
        e.preventDefault()
        post(route("closures.store"))
    }
  return (
    <div
    className={`${isOpenCreateModal? "":"hidden"} bg-black/10 dark:bg-white/10 fixed top-0 h-full w-full rounded-md left-0 z-20`}>
    <div className='mt-40 md-[10%] ml-[20%] md:ml-[40%] bg-white dark:bg-slate-900 w-[400px] rounded-md'>
        <div className='p-4 flex justify-between '>Creer une nouvelle periode  <button className='font-bold' onClick={handleCloseModal}>X</button></div>
        <hr  className='w-ful h-[0.1px] border-gray-300 bg-white border-1'/>
        
        <form className='p-4' onSubmit={handleSubmit}>
            <div>
            <label htmlFor="">Agences:</label>
            <Select options={agenciesOption} onChange={e=>handleSelectChange(e)} className='text-black '/>
                <span className='text-red-600'>{errors?.agency_id}</span>
            </div>
            <br /> 
            <div>
            <label htmlFor="">Date de Debut:</label>
            <Input type='date'  value={data.starting_date} hint={errors?.starting_date}  onChange={(e)=>setData("starting_date",e.target.value)}/>
            </div>
            <br />
            <div>
            <label htmlFor="">Date de Fin:</label>
            <Input type='date' value={data.ending_date} hint={errors?.ending_date} onChange={(e)=>setData("ending_date",e.target.value)}/>
            </div>
            <div className='w-full flex justify-between mt-4'>
                <button className='text-red-500'
                type='reset'
                onClick={handleCloseModal}>
                        annuler
                </button>
                <Button
                type="submit"
                disabled={processing}

                >
                
                {processing ? (<><FontAwesomeIcon icon={faSpinner} spin /> en cour ...</>):<>Creer</>}
                </Button>
            </div>
        </form>
        </div>
    </div>
  )
}

export default CreateClosureModal
