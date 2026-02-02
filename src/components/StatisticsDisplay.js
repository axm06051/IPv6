import React from 'react';

function calculateSuccessRate(correct, total) {
  return total > 0 ? Math.round((correct / total) * 100) : 0;
}

function createStatsItems(stats) {
  const successRate = calculateSuccessRate(stats.correct, stats.total);
  return [
    { value: stats.total, label: 'Total Questions', color: 'primary' },
    { value: stats.correct, label: 'Correct', color: 'success' },
    { value: stats.total - stats.correct, label: 'Incorrect', color: 'danger' },
    { value: `${successRate}%`, label: 'Success Rate', color: 'info' }
  ];
}

function determineSuccessRateBadgeClass(rate) {
  if (rate >= 80) return 'bg-success';
  if (rate >= 60) return 'bg-warning';
  return 'bg-danger';
}

function calculateCategorySuccessRate(data) {
  return Math.round((data.correct / data.total) * 100);
}

function formatCategoryName(category) {
  return category.replace(/-/g, ' ');
}

function hasCategoryData(stats) {
  return Object.keys(stats.byCategory).length > 0;
}

function StatisticsDisplay({ stats, showDetails = false }) {
  const statsItems = createStatsItems(stats);

  return (
    <div>
      <h5 className="mb-3">Session Statistics</h5>
      
      <div className="row g-3 mb-4">
        {statsItems.map((item, idx) => (
          <div key={idx} className="col-6 col-md-3">
            <div className={`card text-center border-${item.color}`}>
              <div className="card-body">
                <div className={`display-6 text-${item.color}`}>
                  {item.value}
                </div>
                <small className="text-muted">{item.label}</small>
              </div>
            </div>
          </div>
        ))}
      </div>

      {stats.total > 0 && (
        <div className="progress mb-4" style={{ height: '30px' }}>
          <div
            className="progress-bar bg-success"
            role="progressbar"
            style={{
              width: `${calculateSuccessRate(stats.correct, stats.total)}%`
            }}
            aria-valuenow={stats.correct}
            aria-valuemin="0"
            aria-valuemax={stats.total}
          >
            {calculateSuccessRate(stats.correct, stats.total)}%
          </div>
        </div>
      )}

      {showDetails && hasCategoryData(stats) && (
        <>
          <h6 className="mt-4 mb-3">Performance by Category</h6>
          <div className="table-responsive">
            <table className="table table-sm table-hover">
              <thead>
                <tr>
                  <th>Category</th>
                  <th className="text-center">Questions</th>
                  <th className="text-center">Correct</th>
                  <th className="text-center">Success Rate</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(stats.byCategory).map(([category, data]) => {
                  const rate = calculateCategorySuccessRate(data);
                  const badgeClass = determineSuccessRateBadgeClass(rate);
                  return (
                    <tr key={category}>
                      <td className="text-capitalize">
                        {formatCategoryName(category)}
                      </td>
                      <td className="text-center">{data.total}</td>
                      <td className="text-center">{data.correct}</td>
                      <td className="text-center">
                        <span className={`badge ${badgeClass}`}>{rate}%</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

export default StatisticsDisplay;