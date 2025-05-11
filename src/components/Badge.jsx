const Badge = ({
    children,
    text,
    bgColor = '#8BC34A',
    // textColor = 'text-indigo-800',
    className = '',
    ...props
}) => {
    return (
      <span
        className={`inline-flex items-center rounded-md px-4 py-2 text-xs font-bold bg-[${bgColor}] ${className}`}
        {...props}
      >
        {children}
        {text}
      </span>
    );
};
  

export default Badge

//   // Example usage:
//   const ExamplePage = () => {
//     return (
//       <div className="p-4 space-y-4">
//         {/* Default */}
//         <HeroBadge text="Default Badge" />
        
//         {/* Custom colors */}
//         <HeroBadge 
//           text="Success" 
//           bgColor="bg-green-100" 
//           textColor="text-green-800" 
//         />
        
//         {/* With additional styling */}
//         <HeroBadge 
        //   text="Warning" 
        //   bgColor="bg-yellow-100" 
        //   textColor="text-yellow-800"
        //   className="uppercase tracking-wide" 
//         />
//       </div>
//     );
//   };

{/* <Badge text="A" bgColor="#FF9800" className="px-2 py-2 uppercase tracking-wide" />
<Badge text="B" className="bg-[#8BC34A] px-2 py-2 uppercase tracking-wide" />
<Badge text="C" className="bg-[#FFEB3B] px-2 py-2 uppercase tracking-wide" />
<Badge text="D" className="bg-[#FF9800] px-2 py-2 uppercase tracking-wide" />
<Badge text="E" className="bg-[#F44336] px-2 py-2 uppercase tracking-wide" /> */}