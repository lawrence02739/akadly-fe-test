import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useFormBuilderStore } from '../store/useFormBuilderStore';
import { PublicFormView } from './PublicFormView';

export const PublicFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { loadForm } = useFormBuilderStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadForm(id, true)
        .then(() => setLoading(false))
        .catch((err) => {
          const message = String(err?.response?.data?.message || '');
          if (message.includes('expired')) {
            setError('This form has expired and is no longer accepting responses.');
          } else if (err?.response?.status === 403) {
            setError('This form is currently not accepting responses.');
          } else {
            setError('Form not found or an error occurred.');
          }
          setLoading(false);
        });
    }
  }, [id, loadForm]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-sm border border-slate-200 p-8 text-center">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-500 text-2xl font-bold">!</span>
          </div>
          <h1 className="text-xl font-semibold text-slate-800 mb-2">Access Denied</h1>
          <p className="text-slate-600">{error}</p>
        </div>
      </div>
    );
  }

  return <PublicFormView />;
};
