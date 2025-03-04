import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';
import Button from '../components/ui/Button';
import Layout from '../components/layout/Layout';

const NotFoundPage: React.FC = () => {
  return (
    <Layout requireAuth={false}>
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center">
        <AlertTriangle className="h-16 w-16 text-amber-500 mb-4" />
        <h1 className="text-4xl font-bold text-gray-900 mb-2">404</h1>
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Page Not Found</h2>
        <p className="text-gray-500 max-w-md mb-8">
          The page you are looking for doesn't exist or has been moved.
        </p>
        <Link to="/">
          <Button>Return to Home</Button>
        </Link>
      </div>
    </Layout>
  );
};

export default NotFoundPage;
