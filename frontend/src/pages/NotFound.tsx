
import React from "react";
import { useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 text-center">
      <h1 className="text-6xl font-bold text-nobug-500 mb-4">404</h1>
      <h2 className="text-2xl font-semibold mb-6">Page Not Found</h2>
      <p className="text-gray-600 mb-8 max-w-md">
        We couldn't find the page you're looking for: <code className="text-sm bg-gray-100 p-1 rounded">{location.pathname}</code>
      </p>
      <Button onClick={() => navigate('/Dashboard')}>
        Return to Home
      </Button>
    </div>
  );
};

export default NotFound;
