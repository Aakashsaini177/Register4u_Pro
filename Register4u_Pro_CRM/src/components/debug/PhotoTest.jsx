import React, { useState, useEffect } from 'react';
import { getPhotoFromFileManager, getImageUrl } from '@/lib/api';

const PhotoTest = () => {
  const [testResults, setTestResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    testPhotos();
  }, []);

  const testPhotos = async () => {
    const testCases = ['EX1001', 'EX1002', 'EX1247'];
    const results = [];

    for (const visitorId of testCases) {
      try {
        // Test direct URL construction
        const directUrl = getImageUrl(`${visitorId}.jpg`);
        
        // Test File Manager lookup
        const fileManagerUrl = await getPhotoFromFileManager(visitorId);
        
        results.push({
          visitorId,
          directUrl,
          fileManagerUrl,
          directWorks: false,
          fileManagerWorks: false
        });
      } catch (error) {
        results.push({
          visitorId,
          error: error.message
        });
      }
    }

    setTestResults(results);
    setLoading(false);
  };

  const testImageLoad = (url, index, type) => {
    const img = new Image();
    img.onload = () => {
      setTestResults(prev => prev.map((result, i) => 
        i === index ? { ...result, [`${type}Works`]: true } : result
      ));
    };
    img.onerror = () => {
      setTestResults(prev => prev.map((result, i) => 
        i === index ? { ...result, [`${type}Works`]: false } : result
      ));
    };
    img.src = url;
  };

  useEffect(() => {
    testResults.forEach((result, index) => {
      if (result.directUrl) {
        testImageLoad(result.directUrl, index, 'direct');
      }
      if (result.fileManagerUrl) {
        testImageLoad(result.fileManagerUrl, index, 'fileManager');
      }
    });
  }, [testResults]);

  if (loading) return <div>Testing photos...</div>;

  return (
    <div style={{ padding: '20px', background: '#f0f0f0', margin: '10px' }}>
      <h3>Photo Test Results</h3>
      {testResults.map((result, index) => (
        <div key={index} style={{ marginBottom: '20px', border: '1px solid #ccc', padding: '10px' }}>
          <h4>Visitor ID: {result.visitorId}</h4>
          {result.error ? (
            <p style={{ color: 'red' }}>Error: {result.error}</p>
          ) : (
            <>
              <div>
                <strong>Direct URL:</strong> {result.directUrl}<br/>
                <span style={{ color: result.directWorks ? 'green' : 'red' }}>
                  {result.directWorks ? '✓ Works' : '✗ Failed'}
                </span>
                {result.directUrl && (
                  <img 
                    src={result.directUrl} 
                    alt={`Direct ${result.visitorId}`}
                    style={{ width: '50px', height: '50px', marginLeft: '10px' }}
                    onError={(e) => e.target.style.display = 'none'}
                  />
                )}
              </div>
              <div>
                <strong>File Manager URL:</strong> {result.fileManagerUrl || 'Not found'}<br/>
                <span style={{ color: result.fileManagerWorks ? 'green' : 'red' }}>
                  {result.fileManagerWorks ? '✓ Works' : '✗ Failed'}
                </span>
                {result.fileManagerUrl && (
                  <img 
                    src={result.fileManagerUrl} 
                    alt={`FM ${result.visitorId}`}
                    style={{ width: '50px', height: '50px', marginLeft: '10px' }}
                    onError={(e) => e.target.style.display = 'none'}
                  />
                )}
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  );
};

export default PhotoTest;