const nodemailer = require("nodemailer");

// Email configuration - you'll need to set these environment variables
const createTransporter = () => {
  console.log("🔧 Creating email transporter...");
  console.log(
    "📧 EMAIL_USER:",
    process.env.EMAIL_USER ? "Set ✅" : "NOT SET ❌"
  );
  console.log(
    "🔑 EMAIL_PASS:",
    process.env.EMAIL_PASS ? "Set ✅" : "NOT SET ❌"
  );

  return nodemailer.createTransporter({
    service: "gmail", // or your email service
    auth: {
      user: process.env.EMAIL_USER || "your-email@gmail.com",
      pass: process.env.EMAIL_PASS || "your-app-password",
    },
  });
};

const sendRSVPConfirmation = async (
  guest,
  event,
  rsvpData,
  emailAddress = null
) => {
  try {
    console.log("📤 Attempting to send RSVP confirmation email...");

    const transporter = createTransporter();

    // Use provided email address or fall back to guest's email
    const recipientEmail = emailAddress || guest.email;

    console.log("📬 Recipient email:", recipientEmail);
    console.log("👤 Guest name:", guest.name);
    console.log("🎉 Event:", event.title);
    console.log("✅ RSVP Status:", rsvpData.rsvpStatus);

    if (!recipientEmail) {
      throw new Error("No email address available for confirmation");
    }

    // Format event date nicely
    const eventDate = new Date(event.eventDate).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });

    // Create the email content based on RSVP status
    let subject, htmlContent;

    if (rsvpData.rsvpStatus === "confirmed") {
      subject = `RSVP Confirmation: ${event.title}`;
      htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #9c8164; text-align: center;">RSVP Confirmation</h2>
          
          <p>Dear ${guest.name},</p>
          
          <p>Thank you for confirming your attendance to our special day!</p>
          
          <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">Event Details:</h3>
            <p><strong>Event:</strong> ${event.title}</p>
            <p><strong>Date & Time:</strong> ${eventDate}</p>
            ${
              event.location
                ? `<p><strong>Location:</strong> ${event.location}</p>`
                : ""
            }
            <p><strong>Your RSVP Status:</strong> <span style="color: #28a745; font-weight: bold;">CONFIRMED</span></p>
          </div>
          
          ${
            rsvpData.dietaryRestrictions
              ? `
            <div style="background-color: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <h4 style="color: #856404; margin-top: 0;">Dietary Restrictions Noted:</h4>
              <p style="color: #856404;">${rsvpData.dietaryRestrictions}</p>
            </div>
          `
              : ""
          }
          
          ${
            rsvpData.specialRequests
              ? `
            <div style="background-color: #d1ecf1; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <h4 style="color: #0c5460; margin-top: 0;">Special Requests Noted:</h4>
              <p style="color: #0c5460;">${rsvpData.specialRequests}</p>
            </div>
          `
              : ""
          }
          
          <p>We can't wait to celebrate with you!</p>
          
          <p style="margin-top: 30px;">
            With love,<br>
            <strong>Rachel & John</strong>
          </p>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
          <p style="font-size: 12px; color: #666; text-align: center;">
            If you need to update your RSVP, please visit our wedding website or contact us directly.
          </p>
        </div>
      `;
    } else if (rsvpData.rsvpStatus === "declined") {
      subject = `RSVP Response Received: ${event.title}`;
      htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #9c8164; text-align: center;">RSVP Response Received</h2>
          
          <p>Dear ${guest.name},</p>
          
          <p>Thank you for letting us know about your attendance to our special day.</p>
          
          <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">Event Details:</h3>
            <p><strong>Event:</strong> ${event.title}</p>
            <p><strong>Date & Time:</strong> ${eventDate}</p>
            <p><strong>Your RSVP Status:</strong> <span style="color: #dc3545; font-weight: bold;">UNABLE TO ATTEND</span></p>
          </div>
          
          <p>We're sorry you won't be able to join us, but we understand. We'll miss having you there!</p>
          
          <p style="margin-top: 30px;">
            With love,<br>
            <strong>Sarrah & The Dumb Kid</strong>
          </p>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
          <p style="font-size: 12px; color: #666; text-align: center;">
            If you need to update your RSVP, please visit our wedding website or contact us directly.
          </p>
        </div>
      `;
    } else if (rsvpData.rsvpStatus === "maybe") {
      subject = `RSVP Response Received: ${event.title}`;
      htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #9c8164; text-align: center;">RSVP Response Received</h2>
          
          <p>Dear ${guest.name},</p>
          
          <p>Thank you for responding to our invitation!</p>
          
          <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">Event Details:</h3>
            <p><strong>Event:</strong> ${event.title}</p>
            <p><strong>Date & Time:</strong> ${eventDate}</p>
            <p><strong>Your RSVP Status:</strong> <span style="color: #ffc107; font-weight: bold;">MAYBE</span></p>
          </div>
          
          <p>We understand that plans can change. Please let us know as soon as you can confirm your attendance so we can plan accordingly.</p>
          
          <p style="margin-top: 30px;">
            With love,<br>
            <strong>Sarrah & The Dumb Kid</strong>
          </p>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
          <p style="font-size: 12px; color: #666; text-align: center;">
            Please update your RSVP on our wedding website when you can confirm your plans.
          </p>
        </div>
      `;
    }

    console.log("📧 Email subject:", subject);
    console.log("🔄 Sending email...");

    const mailOptions = {
      from: `"Sarrah & The Dumb Kid Wedding" <${
        process.env.EMAIL_USER || "your-email@gmail.com"
      }>`,
      to: recipientEmail,
      subject: subject,
      html: htmlContent,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log("✅ RSVP confirmation email sent successfully!");
    console.log("📧 Message ID:", result.messageId);

    return {
      success: true,
      messageId: result.messageId,
    };
  } catch (error) {
    console.error("❌ Error sending RSVP confirmation email:", error.message);
    console.error("🔍 Full error:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

module.exports = {
  sendRSVPConfirmation,
};
