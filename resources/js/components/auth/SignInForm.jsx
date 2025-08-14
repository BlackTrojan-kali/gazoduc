import { useState } from "react";
import  EyeCloseIcon from "../../icons/";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Checkbox from "../form/input/Checkbox";
import Button from "../ui/button/Button";
import { Link, useForm, usePage } from "@inertiajs/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";

export default function SignInForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [email,setEmail] = useState("");
  const [password,setPassword] = useState("");
  const {data,setData,post,processing,errors} = useForm({
    "email":"",
    "password":""
  })
  const onSubmit = (e)=>{
    e.preventDefault()
    post(route("login"))
  }
  return (
    <div className="flex flex-col flex-1 px-10 dark:bg-gray-900 h-full">
      <div className="w-full max-w-md pt-10 mx-auto">
        <center>
        <img src="/images/logo-erp.png" className="w-20" alt="" />
     </center>
      </div>
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-center text-title-sm dark:text-white/90  sm:text-title-md">
              Connexion
            </h1>
            <p className="text-sm text-center text-gray-500 dark:text-gray-400">
              Bienvenue sur ikarootech-erp scms
            </p>
          </div>
          <div>
            <div className="relative py-3 sm:py-5">
              
            </div>
            <form onSubmit={onSubmit}>
              <div className="space-y-6">
                <div>
                  <Label>
                    Email <span className="text-error-500">*</span>{" "}
                  </Label>
                  <Input placeholder="info@gmail.com" name="email" 
                  onChange={e=>setData("email",e.target.value)}
                  error={errors.email ? true:false}
                  hint={errors.email ? errors.email:""}
                  />
                </div>
                <div>
                  <Label>
                    Mot de passe <span className="text-error-500">*</span>{" "}
                  </Label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Entrez votre mot de passe"
                      name="password"
                      onChange={e=>setData("password",e.target.value)}
                      error={errors.password ? true:false}
                      hint={errors.password ? errors.password:""}
                    />
                    <span
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                    >
                      {showPassword ? (
                    
                    <FontAwesomeIcon icon={faEyeSlash} className="text-gray-500 dark:text-gray-400 size-5"/>  
                    ) : (
                      <FontAwesomeIcon icon={faEye} className="text-gray-500 dark:text-gray-400 size-5"/>  
                    )}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Checkbox checked={isChecked} onChange={setIsChecked} />
                    <span className="block font-normal text-gray-700 text-theme-sm dark:text-gray-400">
                      Rester Connecte
                    </span>
                  </div>
                  <Link
                    to="/reset-password"
                    className="text-sm text-brand-500 hover:text-brand-600 dark:text-brand-400"
                  >
                    Mot de passe oublie?
                  </Link>
                </div>
                <div>
                  <Button className="w-full" size="sm" disabled={processing}>
                    Se Connecter
                  </Button>
                </div>
              </div>
            </form>
 <br /><br /><br /><br /><br /><br /> <br /> <br />
          </div>
        </div>
      </div>
    </div>
  );
}
