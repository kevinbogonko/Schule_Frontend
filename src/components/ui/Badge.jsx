const Badge = ({
  children,
  text,
  bgColor = "#8BC34A",
  className = "",
  ...props
}) => {
  return (
    <span
      className={`inline-flex items-center rounded-md px-4 py-2 text-xs font-bold ${className}`}
      style={{ backgroundColor: bgColor }}
      {...props}
    >
      {children}
      {text}
    </span>
  );
};

export default Badge;
