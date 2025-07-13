import React from 'react';

const MaintenancePage: React.FC = () => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      backgroundColor: '#f8f9fa',
      fontFamily: 'sans-serif',
      textAlign: 'center'
    }}>
      <h1 style={{ fontSize: '48px', color: '#343a40' }}>Under Maintenance</h1>
      <p style={{ fontSize: '18px', color: '#6c757d' }}>
        Edufam is currently undergoing scheduled maintenance. We will be back online shortly.
      </p>
      <p style={{ fontSize: '18px', color: '#6c757d' }}>
        We apologize for any inconvenience.
      </p>
    </div>
  );
};

export default MaintenancePage;