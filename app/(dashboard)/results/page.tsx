import { auth } from '@/lib/auth';
import { fetchResultsData } from '@/lib/data';
import { ResultsTable } from '../results-table';

const PredictionsPage = async () => {
  const session = await auth();
  const results = await fetchResultsData({ userId: session?.user?.id });

  return <ResultsTable results={results} isSignedIn={session !== null} />;
};

export default PredictionsPage;
