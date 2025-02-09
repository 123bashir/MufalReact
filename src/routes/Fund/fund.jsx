import { useContext, useState } from "react";
import axios from "axios";
import { AuthContext } from "../../context/AuthContext";

function Fund() {
  const { currentUser } = useContext(AuthContext);

  const [amount, setAmount] = useState("");
  const [totalAmount, setTotalAmount] = useState(0);
  const [paymentUrl, setPaymentUrl] = useState(null); 
  const [loading, setLoading] = useState(false);

  const apiKey = "MK_TEST_APYH15682J"; 
  const secretKey = "LSGV28Q2ND84GGCZHDV2W7N03ZEERZ09"; 
  const contractCode = "8042227522"; 
  const baseUrl = "https://sandbox.monnify.com"; 

  const authToken = btoa(`${apiKey}:${secretKey}`);

  const handleAmountChange = (e) => {
    const inputAmount = e.target.value;
    if (/^\d*$/.test(inputAmount)) {
      setAmount(inputAmount);
      setTotalAmount((parseFloat(inputAmount) * 1.014).toFixed(2)); // Adds 1.4% fee
    }
  };

  const initiatePayment = async () => {
    setLoading(true);

    const paymentData = {
      amount: totalAmount,
      customerName: currentUser.username,
      customerEmail: currentUser.email,
      paymentReference: `monnify_${Date.now()}`,
      paymentDescription: "Payment for services",
      currencyCode: "NGN",
      contractCode: contractCode,
      redirectUrl: "http://localhost:8800/api/auth/fund",
      paymentMethods: ["CARD", "ACCOUNT_TRANSFER"],
    };

    try {
      const response = await axios.post(
        `${baseUrl}/api/v1/merchant/transactions/init-transaction`,
        paymentData,
        {
          headers: {
            Authorization: `Basic ${authToken}`,
            "Content-Type": "application/json",
          },
        }
      );
      setPaymentUrl(response.data.responseBody.paymentUrl);
      const checkoutUrl = response.data.responseBody.checkoutUrl;
      window.location.href = checkoutUrl;
    } catch (error) {
      console.error("Error initiating payment:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "auto", padding: "20px", fontFamily: "Arial, sans-serif", backgroundColor: "#f9f9f9", borderRadius: "8px", boxShadow: "0 4px 8px rgba(0,0,0,0.1)" }}>
      <h2 style={{ textAlign: "center", color: "#333" }}>Make a Payment</h2>
      <div style={{ marginBottom: "15px" }}>
        <label htmlFor="amount" style={{ display: "block", marginBottom: "8px", color: "#555" }}>Amount (in Naira):</label>
        <input 
          type="text" 
          id="amount" 
          value={amount} 
          onChange={handleAmountChange} 
          placeholder="Enter in Naira" 
          style={{ width: "100%", padding: "10px", fontSize: "16px", borderRadius: "4px", border: "1px solid #ccc" }} 
        />
      </div>
      <div style={{ marginBottom: "20px" }}>
        <label htmlFor="totalAmount" style={{ display: "block", marginBottom: "8px", color: "#555" }}>Amount To Pay (include 1.4% fee):</label>
        <input 
          type="text" 
          id="totalAmount" 
          value={totalAmount} 
          readOnly 
          style={{ width: "100%", padding: "10px", fontSize: "16px", borderRadius: "4px", border: "1px solid #ccc", backgroundColor: "#e9ecef", color: "#333" }} 
        />
      </div>
      {loading ? (
        <p style={{ textAlign: "center", color: "#888" }}>Loading...</p>
      ) : (
        <button 
          onClick={initiatePayment} 
          style={{ width: "100%", padding: "12px", fontSize: "18px", borderRadius: "4px", backgroundColor: "#007bff", color: "#fff", border: "none", cursor: "pointer" }}>
          Pay Now
        </button>
      )}
    </div>
  );
}

export default Fund;
