import { ReactNode } from "react";


// Table Component
const Table = ({ children, className }) => {
  return <table className={`min-w-full  ${className}`}>{children}</table>;
};

// TableHeader Component
const TableHeader = ({ children, className }) => {
  return <thead className={`${className} uppercase`}>{children}</thead>;
};

// TableBody Component 
const TableBody = ({ children, className }) => {
  return <tbody className={className}>{children}</tbody>;
};

// TableRow Component
const TableRow = ({ children, className }) => {
  return <tr className={className}>{children}</tr>;
};

// TableCell Component
const TableCell = ({
  children,
  isHeader = false,
  className,
}) => {
  const CellTag = isHeader ? "th" : "td";
  return <CellTag className={` ${className} border-gray-300 dark:border-gray-500 border-1 p-2`}>{children}</CellTag>;
};

export { Table, TableHeader, TableBody, TableRow, TableCell };
