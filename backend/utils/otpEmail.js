const otpEmailTemplate = (userName, otp) => {
    return `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; background: #f0f4ff; padding: 20px; border-radius: 10px;">
            <h2 style="color: #1e3a8a;">Welcome to PropertyBazzar! 🏠</h2>
            <p>Hi ${userName},</p>
            <p>Thank you for registering. Use the OTP below to verify your email address:</p>
            <div style="text-align: center; margin: 30px 0;">
                <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; background: #2563eb; color: white; padding: 10px 30px; border-radius: 8px;">${otp}</span>
            </div>
            <p>This OTP is valid for <strong>10 minutes</strong>. Do not share it with anyone.</p>
            <p>If you didn’t create this account, please ignore this email.</p>
            <hr style="border: none; border-top: 1px solid #ccc;" />
            <p style="font-size: 12px; color: #666;">© PropertyBazzar</p>
        </div>
    `;
};

module.exports = otpEmailTemplate;