"use client";

import { useEffect, useState } from "react";

export default function AttendanceReport() {
  const [data, setData] = useState([]);

  // 🔴 Optional filter values
  const teacherId = ""; // paste teacher _id or leave empty
  const institutionCode = "5445CE57";

  useEffect(() => {
    fetchReport();
  }, []);

  const fetchReport = async () => {
    let url = `http://localhost:5000/api/attendance/report?institutionCode=${institutionCode}`;

    if (teacherId) url += `&teacherId=${teacherId}`;

    const res = await fetch(url);
    const result = await res.json();
    setData(result);
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>📊 Attendance Report</h1>

      <table border="1" cellPadding="8">
        <thead>
          <tr>
            <th>Student Name</th>
            <th>Roll No</th>
            <th>Teacher</th>
            <th>Subject</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={row._id}>
              <td>{row.studentId?.name}</td>
              <td>{row.studentId?.rollNo}</td>
              <td>{row.teacherId?.name}</td>
              <td>{row.subject}</td>
              <td>{new Date(row.date).toDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
