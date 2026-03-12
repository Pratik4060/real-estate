// Check if user is authenticated
export const isAuthenticated = () => {
  return localStorage.getItem('isAuthenticated') === 'true';
};

// Set user as authenticated
export const setAuthenticated = (userData, rememberMe = false) => {
  localStorage.setItem('isAuthenticated', 'true');
  localStorage.setItem('userData', JSON.stringify(userData));
  
  // Set token expiry (24 hours by default, 30 days if remember me)
  const expiryTime = rememberMe 
    ? new Date().getTime() + 30 * 24 * 60 * 60 * 1000 // 30 days
    : new Date().getTime() + 24 * 60 * 60 * 1000; // 24 hours
  
  localStorage.setItem('tokenExpiry', expiryTime.toString());
  localStorage.setItem('token', 'mock-token-' + Date.now());
};

// Logout user
export const logout = () => {
  localStorage.removeItem('isAuthenticated');
  localStorage.removeItem('userData');
  localStorage.removeItem('token');
  localStorage.removeItem('tokenExpiry');
};

// Verify token
export const verifyToken = () => {
  return new Promise((resolve, reject) => {
    const token = localStorage.getItem('token');
    const expiry = localStorage.getItem('tokenExpiry');
    
    if (!token || !isAuthenticated()) {
      reject('No token found');
      return;
    }

    // Check if token has expired
    if (expiry && new Date().getTime() > parseInt(expiry)) {
      logout();
      reject('Token expired');
      return;

    }

    // Get user data
    const userData = localStorage.getItem('userData');
    if (userData) {
      resolve(JSON.parse(userData));
    } else {
      resolve({ message: 'Valid token' });
    }
  });
};

// Get user data
export const getUserData = () => {
  const userData = localStorage.getItem('userData');
  return userData ? JSON.parse(userData) : null;
};