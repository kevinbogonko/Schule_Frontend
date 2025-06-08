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
