const propertyApprovedEmail = (userName, propertyTitle, propertyId) => {
    return `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; background: #f5f5f5; margin: 0; padding: 0; }
                .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 15px; overflow: hidden; box-shadow: 0 5px 20px rgba(0,0,0,0.1); }
                .header { background: linear-gradient(135deg, #2563eb, #1e3a8a); color: white; padding: 30px; text-align: center; }
                .body { padding: 30px; }
                .footer { background: #f8fafc; padding: 20px; text-align: center; color: #64748b; font-size: 14px; }
                .badge { display: inline-block; background: #10b981; color: white; padding: 8px 20px; border-radius: 25px; font-weight: bold; margin: 15px 0; }
                .details { background: #f0f9ff; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0; border-radius: 8px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1 style="margin:0; font-size:28px;">🏠 PropertyBazzar</h1>
                    <p style="margin:10px 0 0; opacity:0.9;">Your trusted real estate platform</p>
                </div>
                <div class="body">
                    <h2 style="color:#1e3a8a;">Congratulations, ${userName}! 🎉</h2>
                    <p>Great news! Your property has been <strong>verified and approved</strong> by our team.</p>
                    
                    <div class="badge">✅ Approved & Active</div>
                    
                    <div class="details">
                        <h3 style="margin:0 0 10px; color:#1e3a8a;">${propertyTitle}</h3>
                        <p style="margin:5px 0;">Property ID: <strong>${propertyId}</strong></p>
                        <p style="margin:5px 0;">Status: <strong style="color:#10b981;">Active</strong></p>
                    </div>
                    
                    <p>Your property is now visible to thousands of potential buyers on PropertyBazzar!</p>
                    
                    <a href="http://localhost:5173/property/${propertyId}" 
                       style="display:inline-block; background:#2563eb; color:white; padding:12px 30px; text-decoration:none; border-radius:25px; font-weight:bold; margin-top:15px;">
                        View Your Listing →
                    </a>
                </div>
                <div class="footer">
                    <p>© 2026 PropertyBazzar. All rights reserved.</p>
                    <p>This is an automated email. Please do not reply.</p>
                </div>
            </div>
        </body>
        </html>
    `;
};

const propertyRejectedEmail = (userName, propertyTitle, reason) => {
    return `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; background: #f5f5f5; margin: 0; padding: 0; }
                .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 15px; overflow: hidden; box-shadow: 0 5px 20px rgba(0,0,0,0.1); }
                .header { background: linear-gradient(135deg, #dc2626, #991b1b); color: white; padding: 30px; text-align: center; }
                .body { padding: 30px; }
                .footer { background: #f8fafc; padding: 20px; text-align: center; color: #64748b; font-size: 14px; }
                .badge { display: inline-block; background: #ef4444; color: white; padding: 8px 20px; border-radius: 25px; font-weight: bold; margin: 15px 0; }
                .reason { background: #fef2f2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0; border-radius: 8px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1 style="margin:0; font-size:28px;">🏠 PropertyBazzar</h1>
                    <p style="margin:10px 0 0; opacity:0.9;">Your trusted real estate platform</p>
                </div>
                <div class="body">
                    <h2 style="color:#991b1b;">Update Required, ${userName}</h2>
                    <p>Your property listing <strong>"${propertyTitle}"</strong> has been reviewed but requires some changes.</p>
                    
                    <div class="badge">❌ Needs Revision</div>
                    
                    <div class="reason">
                        <h3 style="margin:0 0 10px; color:#991b1b;">Rejection Reason:</h3>
                        <p style="margin:5px 0; color:#4b5563;">${reason || 'Does not meet verification criteria'}</p>
                    </div>
                    
                    <p>Please review the reason above and resubmit your property with the necessary corrections.</p>
                    <p>If you have any questions, contact our support team.</p>
                    
                    <a href="http://localhost:5173/sell" 
                       style="display:inline-block; background:#dc2626; color:white; padding:12px 30px; text-decoration:none; border-radius:25px; font-weight:bold; margin-top:15px;">
                        Resubmit Property →
                    </a>
                </div>
                <div class="footer">
                    <p>© 2026 PropertyBazzar. All rights reserved.</p>
                    <p>This is an automated email. Please do not reply.</p>
                </div>
            </div>
        </body>
        </html>
    `;
};

module.exports = { propertyApprovedEmail, propertyRejectedEmail };