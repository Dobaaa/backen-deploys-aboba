import axios from "axios";
import appointmentModel from "../models/appointmentModel.js";

// Paymob configuration
const PAYMOB_API_KEY = process.env.PAYMOB_API_KEY;
const PAYMOB_INTEGRATION_ID = process.env.PAYMOB_INTEGRATION_ID;
const PAYMOB_IFRAME_ID = process.env.PAYMOB_IFRAME_ID;
const PAYMOB_HMAC_SECRET = process.env.PAYMOB_HMAC_SECRET;

// Initialize payment
const initializePayment = async (req, res) => {
  try {
    const { appointmentId } = req.body;

    if (!appointmentId) {
      return res
        .status(400)
        .json({ success: false, message: "Appointment ID is required" });
    }

    // Get appointment details
    const appointment = await appointmentModel.findById(appointmentId);
    if (!appointment) {
      return res
        .status(404)
        .json({ success: false, message: "Appointment not found" });
    }

    if (!appointment.amount || !appointment.userData) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid appointment data" });
    }

    // Step 1: Get authentication token
    const authResponse = await axios.post(
      "https://accept.paymob.com/api/auth/tokens",
      {
        api_key: PAYMOB_API_KEY,
      }
    );

    if (!authResponse.data.token) {
      return res
        .status(500)
        .json({
          success: false,
          message: "Failed to get authentication token",
        });
    }

    const token = authResponse.data.token;

    // Step 2: Create order
    const orderResponse = await axios.post(
      "https://accept.paymob.com/api/ecommerce/orders",
      {
        auth_token: token,
        delivery_needed: false,
        amount_cents: Math.round(appointment.amount * 100), // Convert to cents and ensure it's an integer
        currency: "EGP",
        items: [],
      }
    );

    if (!orderResponse.data.id) {
      return res
        .status(500)
        .json({ success: false, message: "Failed to create order" });
    }

    const orderId = orderResponse.data.id;

    // Step 3: Get payment key
    const paymentKeyResponse = await axios.post(
      "https://accept.paymob.com/api/acceptance/payment_keys",
      {
        auth_token: token,
        amount_cents: Math.round(appointment.amount * 100),
        expiration: 3600,
        order_id: orderId,
        billing_data: {
          apartment: "NA",
          email: appointment.userData.email || "user@example.com",
          floor: "NA",
          first_name: appointment.userData.name?.split(" ")[0] || "User",
          street: "NA",
          building: "NA",
          phone_number: appointment.userData.phone || "01000000000",
          shipping_method: "NA",
          postal_code: "NA",
          city: "NA",
          country: "NA",
          last_name: appointment.userData.name?.split(" ")[1] || "NA",
          state: "NA",
        },
        currency: "EGP",
        integration_id: PAYMOB_INTEGRATION_ID,
      }
    );

    if (!paymentKeyResponse.data.token) {
      return res
        .status(500)
        .json({ success: false, message: "Failed to get payment key" });
    }

    res.json({
      success: true,
      paymentKey: paymentKeyResponse.data.token,
      iframeId: PAYMOB_IFRAME_ID,
    });
  } catch (error) {
    console.error(
      "Payment initialization error:",
      error.response?.data || error.message
    );
    res.status(500).json({
      success: false,
      message: error.response?.data?.message || error.message,
    });
  }
};

// Handle payment callback
const handlePaymentCallback = async (req, res) => {
  try {
    const { obj } = req.body;
    const { order } = obj;
    const { amount_cents, id } = order;

    // Verify HMAC
    const data =
      obj.amount_cents +
      obj.created_at +
      obj.currency +
      obj.error_occured +
      obj.has_parent_transaction +
      obj.id +
      obj.integration_id +
      obj.is_3d_secure +
      obj.is_auth +
      obj.is_capture +
      obj.is_refunded +
      obj.is_standalone_payment +
      obj.is_voided +
      obj.order.id +
      obj.owner +
      obj.pending +
      obj.source_data_pan +
      obj.source_data_sub_type +
      obj.source_data_type +
      obj.success;

    const hmac = crypto.createHmac("sha512", PAYMOB_HMAC_SECRET);
    hmac.update(data);
    const calculatedHmac = hmac.digest("hex");

    if (calculatedHmac !== req.query.hmac) {
      return res.status(400).json({ success: false, message: "Invalid HMAC" });
    }

    // Update appointment payment status
    if (obj.success) {
      await appointmentModel.findByIdAndUpdate(id, {
        paymentStatus: "paid",
        paymentId: obj.id,
      });
    }

    res.json({ success: true });
  } catch (error) {
    console.error("Payment callback error:", error);
    res.json({ success: false, message: error.message });
  }
};

export { initializePayment, handlePaymentCallback };
