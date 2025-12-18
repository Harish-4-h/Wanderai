import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { Toaster } from 'sonner';

// Pages
import Home from './App.jsx';
import CreateTrip from './create-trip/index.jsx';
import ViewTrip from './view-trip/viewtrip/index.jsx';
import MyTrips from './my-trips/index.jsx';
import TermsOfService from './components/custom/TermsOfService.jsx';
import PrivacyPolicy from './components/custom/PrivacyPolicy.jsx';

// Layout components
import Navbar from './components/custom/Navbar.jsx';
import Footer from './components/custom/Footer.jsx';

// Layout wrapper
const Layout = () => (
  <>
    <Navbar />
    <Toaster richColors position="top-center" />

    {/* Push content below fixed navbar */}
    <main className="pt-28">
      <Outlet />
    </main>

    <Footer />
  </>
);

// Google OAuth client ID
const GOOGLE_CLIENT_ID =
  "380822855108-imdeg9fh473mtd3i5r4fqrnb9084oa.apps.googleusercontent.com";

// Router setup
const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { path: '/', element: <Home /> },
      { path: '/create-trip', element: <CreateTrip /> },
      { path: '/view-trip/:tripId', element: <ViewTrip /> },
      { path: '/my-trips', element: <MyTrips /> },
      { path: '/terms', element: <TermsOfService /> },
      { path: '/privacy', element: <PrivacyPolicy /> },
    ],
  },
]);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <RouterProvider router={router} />
    </GoogleOAuthProvider>
  </React.StrictMode>
);
