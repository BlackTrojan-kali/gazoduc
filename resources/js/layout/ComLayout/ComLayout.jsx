import { SidebarProvider, useSidebar } from "../../context/SidebarContext";

import ToastProvider from "../../components/ui/alert/ToastProvider";
import ComHeader from "./ComHeader";
import ComBackdrop from "./ComBackdrop";
import ComSidebar from "./ComSidebar";
import { useEffect } from "react";
import useLicenceChoice from "../../hooks/useLicenceChoice";
const LayoutContent = ({children}) => {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();

  return (
    <div className="min-h-screen xl:flex">
      <div>
        <ComSidebar />
        <ComBackdrop />
      </div>
      <div
        className={`flex-1 transition-all duration-300 ease-in-out ${
          isExpanded || isHovered ? "lg:ml-[290px]" : "lg:ml-[90px]"
        } ${isMobileOpen ? "ml-0" : ""}`}
      >
        <ComHeader />
        <div className="p-4 dark:bg-gray-900 h-full dark:text-gray-100 mx-auto max-w-(--breakpoint-2xl) md:p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

const ComLayout= ({children}) => {
  const {handleChangeLicence} = useLicenceChoice()
  useEffect(()=>{
    handleChangeLicence("gaz");
  },[])
  return (
    <SidebarProvider>
      <LayoutContent>

          <ToastProvider/>
        {children}
      </LayoutContent>
    </SidebarProvider>
  );
};

export default ComLayout;
