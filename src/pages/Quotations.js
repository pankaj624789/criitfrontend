import React from "react";

const Quotations = () => {
  return (
    <div style={styles.container}>
      <h1>Quotations Section</h1>
      <p>This page will show Quotations details later.</p>
    </div>
  );
};

const styles = {
  container: {
    minHeight: "100vh",
    background: "#fff3e0",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
};

export default Quotations;
