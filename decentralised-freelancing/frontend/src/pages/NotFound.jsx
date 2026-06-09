
import { Link } from 'react-router-dom';
const NotFound = () => (
  <div className="max-w-7xl mx-auto px-4 py-20 text-center">
    <h1 className="text-6xl font-bold text-primary-500 mb-4">404</h1>
    <p className="text-gray-400 text-xl mb-8">Page not found</p>
    <Link to="/" className="btn-primary">Go Home</Link>
  </div>
);
export default NotFound;