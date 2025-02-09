const Alert = ({ children, ...props }) => (
    <div className="bg-gray-100 p-4 rounded-lg border" {...props}>
      {children}
    </div>
  );
  
  const AlertTitle = ({ children }) => (
    <h5 className="font-medium mb-1">{children}</h5>
  );
  
  const AlertDescription = ({ children }) => (
    <p className="text-gray-600">{children}</p>
  );
  
  export { Alert, AlertTitle, AlertDescription };