import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setAuth } from '../../../store/authSlice';
import api from '../../../shared/api/axios';

/**
 * This page handles the redirect from the backend after Google OAuth.
 */
export default function AuthCallback() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    let mounted = true;

    const completeAuth = async () => {
      try {
        const { data } = await api.get('/auth/me');
        const user = data?.data?.user || data?.user;

        if (user && mounted) {
          dispatch(setAuth({ user }));
          navigate('/partner/courses', { replace: true });
        } else if (mounted) {
          navigate('/login', { replace: true });
        }
      } catch (err) {
        if (mounted) navigate('/login', { replace: true });
      }
    };

    completeAuth();

    return () => {
      mounted = false;
    };
  }, [navigate, dispatch]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50">
      <div className="text-center">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-slate-600 font-medium">Signing you in…</p>
      </div>
    </div>
  );
}
