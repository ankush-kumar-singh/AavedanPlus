import { useEffect, useState } from "react";

function AdminDashboard() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  // Popup state
  const [popup, setPopup] = useState({
    show: false,
    type: "",
    title: "",
    message: "",
  });

  // --------------------------------
  // Applications load karo
  // --------------------------------
  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        "http://localhost:8000/admin/applications"
      );

      if (!response.ok) {
        throw new Error("Applications load failed");
      }

      const data = await response.json();

      console.log("ADMIN DATA:", data);

      setApplications(data.applications || []);
    } catch (error) {
      console.error("ADMIN ERROR:", error);

      setPopup({
        show: true,
        type: "error",
        title: "Error",
        message: "Applications load nahi ho paayi.",
      });
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------
  // Accept / Reject
  // --------------------------------
  const updateStatus = async (applicationId, status) => {
    console.log(
      "BUTTON CLICKED:",
      applicationId,
      status
    );

    try {
      setUpdatingId(applicationId);

      const response = await fetch(
        `http://localhost:8000/application-status/${applicationId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: status,
          }),
        }
      );

      const data = await response.json();

      console.log(
        "BACKEND RESPONSE:",
        response.status,
        data
      );

      // Backend error
      if (!response.ok || !data.success) {
        throw new Error(
          data.detail ||
            data.message ||
            "Status update failed"
        );
      }

      // --------------------------------
      // Screen par status immediately update
      // --------------------------------
      setApplications((oldApplications) =>
        oldApplications.map((application) =>
          application.application_id === applicationId
            ? {
                ...application,
                status: status,
                application_status: status,
              }
            : application
        )
      );

      // --------------------------------
      // Backend se latest applications lao
      // --------------------------------
      await loadApplications();

      // --------------------------------
      // SUCCESS POPUP
      // --------------------------------
      if (status === "APPROVED") {
        setPopup({
          show: true,
          type: "success",
          title: "Application Approved",
          message:
            "Your application has been approved successfully.",
        });
      }

      if (status === "REJECTED") {
        setPopup({
          show: true,
          type: "error",
          title: "Application Rejected",
          message:
            "Your application has been rejected.",
        });
      }
    } catch (error) {
      console.error(
        "STATUS UPDATE ERROR:",
        error
      );

      // --------------------------------
      // ERROR POPUP
      // --------------------------------
      setPopup({
        show: true,
        type: "error",
        title: "Update Failed",
        message:
          "Application status update nahi ho paya.",
      });
    } finally {
      setUpdatingId(null);
    }
  };

  // --------------------------------
  // Popup close
  // --------------------------------
  const closePopup = () => {
    setPopup({
      show: false,
      type: "",
      title: "",
      message: "",
    });
  };

  // --------------------------------
  // Loading
  // --------------------------------
  if (loading) {
    return (
      <div style={{ padding: "30px" }}>
        <h2>Admin Dashboard</h2>
        <p>Loading applications...</p>
      </div>
    );
  }

  // --------------------------------
  // Dashboard
  // --------------------------------
  return (
    <div
      style={{
        padding: "30px",
        minHeight: "100vh",
        background: "#f5f7fb",
      }}
    >
      <h1>Admin Dashboard</h1>

      <p>
        Welcome to Aavaedan+ Admin Panel
      </p>

      <hr />

      <h2>
        Applications ({applications.length})
      </h2>

      {applications.length === 0 ? (
        <p>No applications found.</p>
      ) : (
        applications.map((application) => {
          const isUpdating =
            updatingId ===
            application.application_id;

          const status =
            application.status ||
            application.application_status ||
            "SUBMITTED";

          return (
            <div
              key={application.application_id}
              style={{
                border: "1px solid #ddd",
                borderRadius: "10px",
                padding: "20px",
                marginTop: "20px",
                background: "white",
                boxShadow:
                  "0 2px 8px rgba(0,0,0,0.05)",
              }}
            >
              {/* Service */}
              <h3>
                {application.service_name ||
                  application.service ||
                  "Application"}
              </h3>

              {/* Application ID */}
              <p>
                <b>Application ID:</b>{" "}
                {application.application_id ||
                  "N/A"}
              </p>

              {/* Applicant */}
              <p>
                <b>Applicant:</b>{" "}
                {application.applicant_name ||
                  "N/A"}
              </p>

              {/* Status */}
              <p>
                <b>Status:</b>{" "}
                <span
                  style={{
                    fontWeight: "bold",
                    color:
                      status === "APPROVED"
                        ? "green"
                        : status === "REJECTED"
                        ? "red"
                        : "#d97706",
                  }}
                >
                  {status}
                </span>
              </p>

              {/* Submitted */}
              <p>
                <b>Submitted:</b>{" "}
                {application.submitted_at ||
                  "N/A"}
              </p>

              {/* Buttons */}
              <div
                style={{
                  marginTop: "15px",
                }}
              >
                {/* ACCEPT BUTTON */}
                <button
                  onClick={() =>
                    updateStatus(
                      application.application_id,
                      "APPROVED"
                    )
                  }
                  disabled={isUpdating}
                  style={{
                    padding:
                      "10px 20px",
                    marginRight:
                      "10px",
                    background:
                      isUpdating
                        ? "#aaa"
                        : "#198754",
                    color: "white",
                    border: "none",
                    borderRadius: "5px",
                    cursor:
                      isUpdating
                        ? "not-allowed"
                        : "pointer",
                    fontSize: "15px",
                  }}
                >
                  {isUpdating
                    ? "Updating..."
                    : "Accept"}
                </button>

                {/* REJECT BUTTON */}
                <button
                  onClick={() =>
                    updateStatus(
                      application.application_id,
                      "REJECTED"
                    )
                  }
                  disabled={isUpdating}
                  style={{
                    padding:
                      "10px 20px",
                    background:
                      isUpdating
                        ? "#aaa"
                        : "#dc3545",
                    color: "white",
                    border: "none",
                    borderRadius: "5px",
                    cursor:
                      isUpdating
                        ? "not-allowed"
                        : "pointer",
                    fontSize: "15px",
                  }}
                >
                  {isUpdating
                    ? "Updating..."
                    : "Reject"}
                </button>
              </div>
            </div>
          );
        })
      )}

      {/* ================================= */}
      {/* SUCCESS / ERROR POPUP */}
      {/* ================================= */}

      {popup.show && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background:
              "rgba(0, 0, 0, 0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
          }}
        >
          <div
            style={{
              width: "420px",
              maxWidth: "90%",
              background: "white",
              borderRadius: "15px",
              padding: "30px",
              textAlign: "center",
              boxShadow:
                "0 10px 40px rgba(0,0,0,0.25)",
            }}
          >
            {/* Icon */}
            <div
              style={{
                fontSize: "55px",
                marginBottom: "10px",
              }}
            >
              {popup.type === "success"
                ? "✅"
                : "❌"}
            </div>

            {/* Title */}
            <h2
              style={{
                margin:
                  "5px 0 10px 0",
                color:
                  popup.type === "success"
                    ? "#198754"
                    : "#dc3545",
              }}
            >
              {popup.title}
            </h2>

            {/* Message */}
            <p
              style={{
                fontSize: "16px",
                color: "#555",
                lineHeight: "1.5",
                marginBottom: "20px",
              }}
            >
              {popup.message}
            </p>

            {/* OK */}
            <button
              onClick={closePopup}
              style={{
                padding:
                  "10px 35px",
                border: "none",
                borderRadius: "6px",
                background:
                  popup.type ===
                  "success"
                    ? "#198754"
                    : "#dc3545",
                color: "white",
                fontSize: "15px",
                cursor: "pointer",
              }}
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;