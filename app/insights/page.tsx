'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BackButton } from '@/components/ui/back-button';

interface MentalHealthData {
  _id: string;
  title?: string;
  description?: string;
  category?: string;
  severity?: string;
  recommendations?: string[];
}

export default function InsightsPage() {
  const [data, setData] = useState<MentalHealthData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // First check if the server is healthy
      const healthCheck = await fetch('http://localhost:5000/api/health');
      if (!healthCheck.ok) {
        throw new Error('Server is not responding');
      }

      const response = await fetch('http://localhost:5000/api/mental-health', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const jsonData = await response.json();
      if (!Array.isArray(jsonData)) {
        throw new Error('Invalid data format received');
      }

      setData(jsonData);
      setRetryCount(0); // Reset retry count on success
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch mental health data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [retryCount]); // Retry when retryCount changes

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="mb-6">
          <BackButton />
        </div>
        <h1 className="text-3xl font-bold mb-6">Mental Health Insights</h1>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-[250px]" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-[100px] w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="mb-6">
          <BackButton />
        </div>
        <h1 className="text-3xl font-bold mb-6">Mental Health Insights</h1>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
          <div className="mt-4">
            <button 
              onClick={handleRetry}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
            >
              Try Again
            </button>
            <p className="mt-2 text-sm text-red-600">
              If the problem persists, please check if the server is running at http://localhost:5000
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <BackButton />
      </div>
      <h1 className="text-3xl font-bold mb-6">Mental Health Insights</h1>
      {data.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No mental health data available.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {data.map((item) => (
            <Card key={item._id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle>{item.title || `Insight ${item._id}`}</CardTitle>
              </CardHeader>
              <CardContent>
                {item.description && (
                  <p className="text-gray-600 mb-4">{item.description}</p>
                )}
                {item.category && (
                  <div className="mb-2">
                    <span className="font-semibold">Category: </span>
                    <span className="text-blue-600">{item.category}</span>
                  </div>
                )}
                {item.severity && (
                  <div className="mb-2">
                    <span className="font-semibold">Severity: </span>
                    <span className="text-orange-600">{item.severity}</span>
                  </div>
                )}
                {item.recommendations && item.recommendations.length > 0 && (
                  <div>
                    <span className="font-semibold">Recommendations:</span>
                    <ul className="list-disc list-inside mt-2">
                      {item.recommendations.map((rec, index) => (
                        <li key={index} className="text-gray-600">{rec}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
} 