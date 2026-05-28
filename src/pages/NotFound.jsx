import { Link } from "react-router-dom";

function NotFound() {
  return (
    <div style={{ padding: "60px 20px", textAlign: "center" }}>
      <h1 style={{ fontSize: "72px", margin: 0 }}>404</h1>
      <h2>Page Not Found</h2>
      <p>Sorry, the page you're looking for does not exist.</p>
      <Link to="/" style={{ color: "#6366f1", textDecoration: "underline" }}>
        Go back home
      </Link>
    </div>
  );
}

export default NotFound;