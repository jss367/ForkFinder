import React, { useState } from 'react';

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
      const response = await fetch(`https://api.github.com/repos/${repo}/forks?sort=stargazers&per_page=100`);
      if (!response.ok) throw new Error('Repository not found or API limit reached');
      const data = await response.json();
      const detailedForks = await Promise.all(data.map(async fork => {
        const detailsResponse = await fetch(fork.url);
        const details = await detailsResponse.json();
        return {
          name: fork.full_name,
          stars: details.stargazers_count,
          forks: details.forks_count,
          lastUpdated: new Date(details.updated_at),
          url: fork.html_url,
          description: details.description
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
    <div style={{ padding: '1rem', maxWidth: '1000px', margin: '0 auto' }}>
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
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th onClick={() => sortForks('name')} style={{ cursor: 'pointer', padding: '0.5rem', borderBottom: '1px solid #ddd' }}>
                Fork Name ↕
              </th>
              <th onClick={() => sortForks('stars')} style={{ cursor: 'pointer', padding: '0.5rem', borderBottom: '1px solid #ddd' }}>
                Stars ↕
              </th>
              <th onClick={() => sortForks('forks')} style={{ cursor: 'pointer', padding: '0.5rem', borderBottom: '1px solid #ddd' }}>
                Forks ↕
              </th>
              <th onClick={() => sortForks('lastUpdated')} style={{ cursor: 'pointer', padding: '0.5rem', borderBottom: '1px solid #ddd' }}>
                Last Updated ↕
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
                <td style={{ padding: '0.5rem', borderBottom: '1px solid #ddd' }}>{fork.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ForkFinder;