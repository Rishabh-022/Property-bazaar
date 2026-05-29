const PDFDocument = require('pdfkit');

/**
 * Generates a PDF report buffer for a verified property
 * @param {Object} property - The property document (populated with owner)
 * @returns {Buffer}
 */
const generatePropertyReport = (property) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const buffers = [];
      doc.on('data', (chunk) => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);

      // ---------- Header ----------
      doc
        .fillColor('#1e3a8a')
        .fontSize(26)
        .font('Helvetica-Bold')
        .text('PropertyBazzar', { align: 'center' })
        .fontSize(14)
        .font('Helvetica')
        .fillColor('#64748b')
        .text('Verified Property Report', { align: 'center' })
        .moveDown(0.5);

      // Horizontal line
      doc
        .strokeColor('#3b82f6')
        .lineWidth(2)
        .moveTo(50, doc.y)
        .lineTo(545, doc.y)
        .stroke()
        .moveDown(1);

      // ---------- Property Title & ID ----------
      doc
        .fontSize(18)
        .fillColor('#0f172a')
        .font('Helvetica-Bold')
        .text(property.title, { align: 'left' })
        .fontSize(10)
        .fillColor('#64748b')
        .text(`Property ID: ${property._id.toString()}`)
        .text(`Registration Number: ${property.registrationNumber}`)
        .moveDown(0.5);

      // ---------- Verification Info ----------
      doc
        .fontSize(12)
        .fillColor('#1e3a8a')
        .font('Helvetica-Bold')
        .text('Verification Details')
        .moveDown(0.2);

      const verifiedAt = property.verifiedAt
        ? new Date(property.verifiedAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
        : new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

      doc
        .fontSize(10)
        .font('Helvetica')
        .fillColor('#334155')
        .text(`Status: Verified & Active`)
        .text(`Verified on: ${verifiedAt}`)
        .moveDown(0.5);

      // ---------- Property Details ----------
      doc
        .fontSize(12)
        .fillColor('#1e3a8a')
        .font('Helvetica-Bold')
        .text('Property Details')
        .moveDown(0.2);

      const details = [
        { label: 'Property Type', value: property.propertyType },
        { label: 'Sub Type', value: property.propertySubType || 'N/A' },
        { label: 'Area', value: `${property.dimensions?.area || 'N/A'} ${property.dimensions?.areaUnit || ''}` },
        { label: 'Price', value: `₹${(property.pricing?.expectedPrice || 0).toLocaleString('en-IN')}` },
        { label: 'Price Negotiable', value: property.pricing?.priceNegotiable ? 'Yes' : 'No' },
        { label: 'Location', value: `${property.address?.street || ''}, ${property.address?.locality || ''}, ${property.address?.city || ''}, ${property.address?.state || ''} - ${property.address?.pincode || ''}` },
        { label: 'Owner Name', value: property.owner?.fullName || property.sellerName },
        { label: 'Contact Phone', value: property.sellerPhone },
        { label: 'Aadhaar Number', value: property.aadhaarNumber },
        { label: 'PAN Number', value: property.panNumber || 'N/A' },
        { label: 'Khata Number', value: property.khataNumber },
        { label: 'Khasra Number', value: property.khasraNumber || 'N/A' },
      ];

      details.forEach(({ label, value }) => {
        doc
          .fontSize(10)
          .font('Helvetica-Bold')
          .fillColor('#1e293b')
          .text(`${label}: `, { continued: true })
          .font('Helvetica')
          .fillColor('#475569')
          .text(value)
          .moveDown(0.2);
      });

      doc.moveDown(0.5);

      // ---------- Legal Notice ----------
      doc
        .fontSize(9)
        .fillColor('#64748b')
        .font('Helvetica-Oblique')
        .text(
          'This document is a system-generated verification report from PropertyBazzar. ' +
          'It confirms that the listed property has been reviewed and approved based on the documents provided by the seller. ' +
          'PropertyBazzar does not guarantee the legal title or physical condition of the property.',
          { align: 'justify' }
        )
        .moveDown(0.5);

      // ---------- Footer ----------
      doc
        .strokeColor('#cbd5e1')
        .lineWidth(1)
        .moveTo(50, doc.y)
        .lineTo(545, doc.y)
        .stroke()
        .moveDown(0.5);

      doc
        .fontSize(8)
        .fillColor('#94a3b8')
        .font('Helvetica')
        .text('PropertyBazzar - India\'s Trusted Real Estate Platform', { align: 'center' })
        .text('This is an auto-generated document. For queries, contact support@propertybazzar.com', { align: 'center' });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = generatePropertyReport;