// Browser Console Commands for Clean Testing
// Run these in your browser's developer console

// Clear tracking consent and doctor ID
localStorage.removeItem('lexxi-change-tracking');

// Verify cleanup
console.log('Tracking data cleared:', {
  trackingData: localStorage.getItem('lexxi-change-tracking'),
  allLocalStorage: Object.keys(localStorage)
});

// Force reload to reset React state
window.location.reload();
