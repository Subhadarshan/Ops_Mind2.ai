import { DocIcon, SearchIcon, AlertIcon } from '../components/Icons';
import '../styles/Analytics.css';

const topicsData = [
    { label: 'Leave Policy', value: 342 },
    { label: 'Remote Work', value: 287 },
    { label: 'Expense Claims', value: 231 },
    { label: 'Onboarding', value: 198 },
    { label: 'Performance', value: 164 },
    { label: 'IT Security', value: 121 },
    { label: 'Benefits', value: 95 },
];
const maxTopic = Math.max(...topicsData.map(d => d.value));

const accessedDocs = [
    { name: 'HR_Remote_Work_Policy_2025.pdf', views: 1284 },
    { name: 'Employee_Benefits_Handbook.pdf', views: 1037 },
    { name: 'Travel_Expense_Policy.pdf', views: 812 },
    { name: 'Onboarding_Checklist_2025.pdf', views: 644 },
    { name: 'Performance_Management_Guide.pdf', views: 531 },
];

export default function AnalyticsPage() {
    return (
        <div className="analytics-page">
            <header className="analytics-page-header">
                <div>
                    <h1 className="analytics-page-title">Admin Analytics</h1>
                    <p className="analytics-page-subtitle">Insights across your knowledge base usage</p>
                </div>
                <span className="time-range-badge">Last 30 days</span>
            </header>

            <div className="analytics-content">
                {/* Metric Cards */}
                <div className="metric-cards">
                    <div className="metric-card" id="metric-docs">
                        <div className="metric-icon docs"><DocIcon /></div>
                        <div className="metric-body">
                            <span className="metric-value">148</span>
                            <span className="metric-label">Total Documents</span>
                        </div>
                        <span className="metric-trend up">↑ 12%</span>
                    </div>
                    <div className="metric-card" id="metric-queries">
                        <div className="metric-icon queries"><SearchIcon /></div>
                        <div className="metric-body">
                            <span className="metric-value">3,842</span>
                            <span className="metric-label">Total Queries</span>
                        </div>
                        <span className="metric-trend up">↑ 24%</span>
                    </div>
                    <div className="metric-card" id="metric-unanswered">
                        <div className="metric-icon unanswered"><AlertIcon /></div>
                        <div className="metric-body">
                            <span className="metric-value">67</span>
                            <span className="metric-label">Unanswered Queries</span>
                        </div>
                        <span className="metric-trend down">↓ 8%</span>
                    </div>
                </div>

                {/* Charts */}
                <div className="charts-row">
                    {/* Bar chart */}
                    <div className="chart-card">
                        <h2 className="chart-title">Most Searched Topics</h2>
                        <div className="bar-chart">
                            {topicsData.map((d, i) => (
                                <div className="bar-item" key={i}>
                                    <span className="bar-label">{d.label}</span>
                                    <div className="bar-track">
                                        <div className="bar-fill" style={{ width: `${Math.round((d.value / maxTopic) * 100)}%` }}>
                                            <span className="bar-value">{d.value}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Accessed docs table */}
                    <div className="chart-card table-chart-card">
                        <h2 className="chart-title">Most Accessed Documents</h2>
                        <div className="table-wrapper">
                            <table className="data-table" id="access-table">
                                <thead>
                                    <tr><th>#</th><th>Document</th><th>Views</th></tr>
                                </thead>
                                <tbody>
                                    {accessedDocs.map((d, i) => (
                                        <tr key={i}>
                                            <td style={{ fontWeight: 600, color: 'var(--gray-400)', width: 40 }}>{i + 1}</td>
                                            <td style={{ fontWeight: 500 }}>{d.name}</td>
                                            <td style={{ fontWeight: 600 }}>{d.views.toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
