import csurf from 'csurf';
import cookieParser from 'cookie-parser';

// CSRF protection middleware
export const csrfProtection = csurf({
  cookie: true, // Store CSRF token in a cookie
});

export const parseCookies = cookieParser(); // Parse cookies to get the CSRF token from the cookie
