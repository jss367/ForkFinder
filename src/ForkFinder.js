import React, { useState } from 'react';
import { ArrowUpDown } from 'lucide-react';

const ForkFinder = () => {
  const [repo, setRepo] = useState('');
  const [forks, setForks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });

  const fetchForks = async () => {
    setLoading(true);
    setError('');
    try {
      console.log(`Fetching forks for repository: ${repo}`);
      const response = await fetch(`https://api.github.com/repos/${repo}/forks?sort=stargazers&per_page=100`);
      console.log(`Response status: ${response.status}`);
      
      if (response.status === 404) {
        throw new Error('Repository not found. Please check if the repository name is correct and the repository is public.');
      } else if (response.status === 403) {
        const rateLimitResponse = await fetch('https://api.github.com/rate_limit');
        const rateLimitData = await rateLimitResponse.json();
        console.log('Rate limit data:', rateLimitData);
        const resetTime = new Date(rateLimitData.rate.reset * 1000).toLocaleTimeString();
        throw new Error(`API rate limit reached. Limit resets at ${resetTime}. Please try again after this time.`);
      } else if (response.status === 301) {
        throw new Error('The repository has been moved permanently. Please check the new location.');
      } else if (response.status === 401) {
        throw new Error('Authentication error. Please check your credentials if you\'re using any.');
      } else if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log(`Fetched ${data.length} forks`);

      if (data.length === 0) {
        throw new Error('No forks found for this repository.');
      }

      const detailedForks = await Promise.all(data.map(async fork => {
        const detailsResponse = await fetch(fork.url);
        const details = await detailsResponse.json();
        return {
          name: fork.full_name,
          stars: details.stargazers_count,
          forks: details.forks_count,
          lastUpdated: new Date(details.updated_at),
          url: fork.html_url,
          description: details.description,
          openIssues: details.open_issues_count,
          watchers: details.watchers_count,
          createdAt: new Date(details.created_at),
          size: details.size,
          language: details.language
        };
      }));
      setForks(detailedForks);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const sortForks = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
    setForks(prevForks => [...prevForks].sort((a, b) => {
      if (a[key] < b[key]) return direction === 'ascending' ? -1 : 1;
      if (a[key] > b[key]) return direction === 'ascending' ? 1 : -1;
      return 0;
    }));
  };

  return (
    <div style={{ padding: '1rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem' }}>ForkFinder</h1>
      <p style={{ marginBottom: '1rem' }}>Analyze and explore GitHub repository forks with ease.</p>
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
        <input
          type="text"
          value={repo}
          onChange={(e) => setRepo(e.target.value)}
          placeholder="Enter GitHub repo (e.g., username/repository)"
          style={{ flexGrow: 1, padding: '0.5rem' }}
        />
        <button onClick={fetchForks} disabled={loading} style={{ padding: '0.5rem 1rem', backgroundColor: '#0066cc', color: 'white', border: 'none', borderRadius: '4px' }}>
          {loading ? 'Searching...' : 'Find Forks'}
        </button>
      </div>
      {error && <p style={{ color: 'red', marginBottom: '1rem' }}>{error}</p>}
      {forks.length > 0 && (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th onClick={() => sortForks('name')} style={{ cursor: 'pointer', padding: '0.5rem', borderBottom: '1px solid #ddd' }}>
                  Fork Name <ArrowUpDown size={16} />
                </th>
                <th onClick={() => sortForks('stars')} style={{ cursor: 'pointer', padding: '0.5rem', borderBottom: '1px solid #ddd' }}>
                  Stars <ArrowUpDown size={16} />
                </th>
                <th onClick={() => sortForks('forks')} style={{ cursor: 'pointer', padding: '0.5rem', borderBottom: '1px solid #ddd' }}>
                  Forks <ArrowUpDown size={16} />
                </th>
                <th onClick={() => sortForks('lastUpdated')} style={{ cursor: 'pointer', padding: '0.5rem', borderBottom: '1px solid #ddd' }}>
                  Last Updated <ArrowUpDown size={16} />
                </th>
                <th onClick={() => sortForks('openIssues')} style={{ cursor: 'pointer', padding: '0.5rem', borderBottom: '1px solid #ddd' }}>
                  Open Issues <ArrowUpDown size={16} />
                </th>
                <th onClick={() => sortForks('watchers')} style={{ cursor: 'pointer', padding: '0.5rem', borderBottom: '1px solid #ddd' }}>
                  Watchers <ArrowUpDown size={16} />
                </th>
                <th onClick={() => sortForks('createdAt')} style={{ cursor: 'pointer', padding: '0.5rem', borderBottom: '1px solid #ddd' }}>
                  Created At <ArrowUpDown size={16} />
                </th>
                <th onClick={() => sortForks('size')} style={{ cursor: 'pointer', padding: '0.5rem', borderBottom: '1px solid #ddd' }}>
                  Size (KB) <ArrowUpDown size={16} />
                </th>
                <th onClick={() => sortForks('language')} style={{ cursor: 'pointer', padding: '0.5rem', borderBottom: '1px solid #ddd' }}>
                  Language <ArrowUpDown size={16} />
                </th>
                <th style={{ padding: '0.5rem', borderBottom: '1px solid #ddd' }}>Description</th>
              </tr>
            </thead>
            <tbody>
              {forks.map((fork) => (
                <tr key={fork.name}>
                  <td style={{ padding: '0.5rem', borderBottom: '1px solid #ddd' }}>
                    <a href={fork.url} target="_blank" rel="noopener noreferrer" style={{ color: '#0066cc', textDecoration: 'none' }}>
                      {fork.name}
                    </a>
                  </td>
                  <td style={{ padding: '0.5rem', borderBottom: '1px solid #ddd' }}>{fork.stars}</td>
                  <td style={{ padding: '0.5rem', borderBottom: '1px solid #ddd' }}>{fork.forks}</td>
                  <td style={{ padding: '0.5rem', borderBottom: '1px solid #ddd' }}>{fork.lastUpdated.toLocaleDateString()}</td>
                  <td style={{ padding: '0.5rem', borderBottom: '1px solid #ddd' }}>{fork.openIssues}</td>
                  <td style={{ padding: '0.5rem', borderBottom: '1px solid #ddd' }}>{fork.watchers}</td>
                  <td style={{ padding: '0.5rem', borderBottom: '1px solid #ddd' }}>{fork.createdAt.toLocaleDateString()}</td>
                  <td style={{ padding: '0.5rem', borderBottom: '1px solid #ddd' }}>{fork.size}</td>
                  <td style={{ padding: '0.5rem', borderBottom: '1px solid #ddd' }}>{fork.language}</td>
                  <td style={{ padding: '0.5rem', borderBottom: '1px solid #ddd' }}>{fork.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ForkFinder;