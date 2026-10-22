import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { TestDashboard } from './components/TestDashboard';

export default function TestStudioPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const testIdParam = searchParams.get('testId');

  useEffect(() => {
    if (testIdParam) {
      navigate(`/partner/test-studio/${testIdParam}/details`, { replace: true });
    }
  }, [testIdParam, navigate]);

  return <TestDashboard />;
}
