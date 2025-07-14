import React from "react";

interface InactivityWarningModalProps {
  onStayLoggedIn: () => void;
  onLogout: () => void;
}

const InactivityWarningModal: React.FC<InactivityWarningModalProps> = ({
  onStayLoggedIn,
  onLogout,
}) => {
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        zIndex: 2000,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          backgroundColor: "white",
          padding: "2rem",
          borderRadius: "8px",
          textAlign: "center",
          boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
        }}
      >
        <h2 style={{ marginTop: 0 }}>Are you still there?</h2>
        <p>You will be logged out due to inactivity in 1 minute.</p>
        <div>
          <button
            onClick={onLogout}
            style={{ marginRight: "1rem", padding: "10px 20px" }}
          >
            Logout Now
          </button>
          <button
            onClick={onStayLoggedIn}
            style={{
              padding: "10px 20px",
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
            }}
          >
            Stay Logged In
          </button>
        </div>
      </div>
    </div>
  );
};

export default InactivityWarningModal;
