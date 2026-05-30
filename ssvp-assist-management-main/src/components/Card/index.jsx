import "./style.css";

export default function Card({ label, value, icon: Icon }) {
  return (
    <div className="stat-card">
      <div>
        <p className="stat-card-label">{label}</p>
        <p className="stat-card-value">{value}</p>
      </div>
      {Icon && (
        <div className="stat-card-icon">
          <Icon className="h-5 w-5" />
        </div>
      )}
    </div>
  );
}