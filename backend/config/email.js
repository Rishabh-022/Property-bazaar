const SibApiV3Sdk = require('@getbrevo/brevo');
const dotenv = require('dotenv');
dotenv.config();

const defaultClient = SibApiV3Sdk.ApiClient.instance;
const apiKey = defaultClient.authentications['api-key'];
apiKey.apiKey = process.env.BREVO_API_KEY;

const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

const sendEmail = async ({ to, subject, html }) => {
  const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
  
  // This uses your professional support email as the official sender
  sendSmtpEmail.sender = { email: 'propertybazzarsupport@gmail.com', name: 'PropertyBazzar' }; 
  
  sendSmtpEmail.to = [{ email: to }];
  sendSmtpEmail.subject = subject;
  sendSmtpEmail.htmlContent = html;

  try {
    const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log('Email sent successfully via Brevo API');
    return data;
  } catch (error) {
    console.error('Brevo API Error:', error);
    throw new Error('Failed to send email');
  }
};

module.exports = sendEmail;