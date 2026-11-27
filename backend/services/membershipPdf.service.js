const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const LOGO_PATH = path.join(__dirname, '..', '..', 'frontend', 'public', 'logo.jpg');
const QR_PATH = path.join(__dirname, '..', '..', 'frontend', 'public', 'tmssa-qr.png');

const loadImageBuffer = async (fileUrl) => {
  if (!fileUrl) return null;
  try {
    // Check local /uploads/ path first
    if (fileUrl.includes('/uploads/')) {
      const filename = fileUrl.split('/uploads/').pop();
      const localPath = path.join(__dirname, '..', 'uploads', filename);
      if (fs.existsSync(localPath)) {
        return fs.readFileSync(localPath);
      }
    }
    if (fileUrl.startsWith('http://') || fileUrl.startsWith('https://')) {
      const res = await fetch(fileUrl);
      if (!res.ok) return null;
      const arr = await res.arrayBuffer();
      return Buffer.from(arr);
    }
    if (fs.existsSync(fileUrl)) {
      return fs.readFileSync(fileUrl);
    }
  } catch {
    return null;
  }
  return null;
};

const formatPaymentStatusLabel = (status) => {
  switch (status) {
    case 'VERIFIED':
      return 'VERIFIED';
    case 'REJECTED':
      return 'REJECTED';
    case 'PAYMENT_SUBMITTED':
      return 'PENDING VERIFICATION';
    default:
      return 'PENDING';
  }
};

const drawHeader = (doc, settings) => {
  // Outer official blue frame
  doc.rect(24, 24, 547, 794).lineWidth(2).stroke('#09246B');

  // Logo
  if (fs.existsSync(LOGO_PATH)) {
    doc.image(LOGO_PATH, 38, 34, { width: 58, height: 58 });
  }

  doc
    .fontSize(8.5)
    .fillColor('#09246B')
    .font('Helvetica-Bold')
    .text(settings?.regNumber || 'Regd : 23/2025', 34, 96, { width: 70, align: 'center' });

  doc
    .fontSize(15)
    .fillColor('#B91C1C')
    .font('Helvetica-Bold')
    .text(
      settings?.associationNameEn || 'TAMILNADU MOBILE SALES AND SERVICE ASSOCIATION',
      105,
      36,
      { width: 452, align: 'center' }
    );

  doc
    .fontSize(9.5)
    .fillColor('#111827')
    .font('Helvetica-Bold')
    .text(
      settings?.address || '234 Meenakshi Bazar, Scott Road, Madurai - 625001',
      105,
      74,
      { width: 452, align: 'center' }
    );

  doc
    .fontSize(9)
    .fillColor('#B91C1C')
    .font('Helvetica-Bold')
    .text(
      `${settings?.helpline1 || '+91 99447 73668'}   |   ${settings?.helpline2 || '+91 97879 75782'}`,
      105,
      89,
      { width: 452, align: 'center' }
    );

  // TNMSSA Pill Badge
  doc.roundedRect(240, 108, 115, 20, 10).fill('#09246B');
  doc.fontSize(11).fillColor('#FFFFFF').font('Helvetica-Bold').text('TNMSSA', 240, 112, {
    width: 115,
    align: 'center',
  });
};

const generateApplicationPdf = async (application, settings) => {
  const payment = application.payments?.[0] || {};
  const photoDoc = application.documents?.find((d) => d.docType === 'PHOTO');
  const sigDoc = application.documents?.find((d) => d.docType === 'SIGNATURE');

  const [photoBuf, sigBuf] = await Promise.all([
    loadImageBuffer(photoDoc?.fileUrl),
    loadImageBuffer(sigDoc?.fileUrl),
  ]);

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 24 });
    const chunks = [];
    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    drawHeader(doc, settings);

    // Serial No & Date
    const regDate = new Date(application.registrationDate || application.createdAt).toLocaleDateString('en-IN');
    doc.fontSize(10).fillColor('#09246B').font('Helvetica-Bold');
    doc.text(`Serial No : ${application.serialNumber}`, 40, 142);
    doc.text(`Date : ${regDate}`, 420, 142, { width: 135, align: 'right' });

    doc.moveTo(36, 158).lineTo(558, 158).lineWidth(0.8).stroke('#CBD5E1');

    // Photo Box on right
    doc.rect(450, 170, 100, 120).lineWidth(1.5).stroke('#09246B');
    if (photoBuf) {
      try {
        doc.image(photoBuf, 452, 172, { fit: [96, 116], align: 'center', valign: 'center' });
      } catch {
        doc.fontSize(8).fillColor('#64748B').text('PHOTO', 450, 224, { width: 100, align: 'center' });
      }
    } else {
      doc.fontSize(8).fillColor('#64748B').text('APPLICANT\nPHOTO', 450, 218, { width: 100, align: 'center' });
    }

    // Helper to draw labeled field
    const drawRow = (label, value, x, y, width = 395) => {
      doc.fontSize(9).fillColor('#09246B').font('Helvetica-Bold').text(`${label} :`, x, y);
      doc
        .fontSize(9.5)
        .fillColor('#111827')
        .font('Helvetica')
        .text(value || '—', x + 135, y, { width: width - 135 });
    };

    const dobStr = application.dob ? new Date(application.dob).toLocaleDateString('en-IN') : '—';

    drawRow('Applicant Name', application.applicantName, 40, 174, 400);
    drawRow('Age', `${application.age} Years`, 40, 196, 400);
    drawRow("Father's Name", application.fatherName, 40, 218, 400);
    drawRow('Date of Birth', dobStr, 40, 240, 400);
    drawRow('Blood Group', application.bloodGroup, 40, 262, 400);
    drawRow('Qualification', application.educationalQualification, 40, 284, 400);

    drawRow('Aadhaar No (Masked)', application.aadhaarMasked || 'Not Provided', 40, 312, 510);
    drawRow('Sales / Service Exp.', application.experience, 40, 334, 510);
    drawRow('Shop Name', application.shopName, 40, 356, 510);
    drawRow('Shop Address', application.shopAddress, 40, 378, 510);
    drawRow('District', application.district?.nameEn || 'Tamil Nadu', 40, 412, 510);
    drawRow('Phone / Mobile No', application.phone, 40, 434, 510);
    drawRow('Alternate Mobile No', application.alternateMobile || '—', 40, 456, 510);
    drawRow('Email ID', application.email, 40, 478, 510);
    drawRow('Insta / FB ID', application.socialId || '—', 40, 500, 510);
    drawRow('Refer Name', application.referName || '—', 40, 522, 510);
    drawRow('Area RTO No', application.areaRtoNo, 40, 544, 510);

    // Payment & QR Section
    doc.moveTo(36, 568).lineTo(558, 568).lineWidth(1).stroke('#09246B');

    if (fs.existsSync(QR_PATH)) {
      doc.image(QR_PATH, 40, 580, { width: 82, height: 82 });
    }

    const payStatusLabel = formatPaymentStatusLabel(payment.paymentStatus);
    doc.fontSize(9.5).fillColor('#09246B').font('Helvetica-Bold').text('PAYMENT DETAILS', 136, 580);
    doc.fontSize(9).fillColor('#111827').font('Helvetica');
    doc.text(`Membership Plan : ${payment.planType === 'HALF_YEARLY' ? 'Half-Yearly' : 'Annual'}`, 136, 597);
    doc.text(`Payment Amount  : Rs. ${payment.amount || 1200}/-`, 136, 612);
    doc.text(`UPI Transaction ID : ${payment.upiTransactionId || '—'}`, 136, 627);
    doc
      .font('Helvetica-Bold')
      .fillColor(payment.paymentStatus === 'VERIFIED' ? '#16A34A' : payment.paymentStatus === 'REJECTED' ? '#DC2626' : '#D97706')
      .text(`Payment Status  : ${payStatusLabel}`, 136, 642);
    doc
      .font('Helvetica-Bold')
      .fillColor('#09246B')
      .text(`Membership Status : ${application.membershipStatus || 'PENDING'}`, 136, 657);

    // Signature Box
    doc.rect(425, 580, 125, 55).lineWidth(1).stroke('#CBD5E1');
    if (sigBuf) {
      try {
        doc.image(sigBuf, 430, 584, { fit: [115, 45], align: 'center', valign: 'center' });
      } catch {
        // ignore invalid image
      }
    }
    doc.fontSize(8).fillColor('#475569').font('Helvetica-Bold').text('Applicant Signature', 425, 640, {
      width: 125,
      align: 'center',
    });

    // Terms & Conditions
    doc
      .fontSize(7.5)
      .fillColor('#334155')
      .font('Helvetica')
      .text(
        `Terms & Conditions: ${settings?.termsText || 'I agree to the terms and conditions of the Union. Payment must be made only to the official TNMSSA account.'}`,
        40,
        674,
        { width: 510 }
      );

    // Official Receipt Tear-off Section
    doc.moveTo(36, 710).lineTo(558, 710).dash(4, { space: 4 }).stroke('#09246B').undash();

    doc.roundedRect(225, 720, 145, 20, 4).fill('#B91C1C');
    doc.fontSize(10).fillColor('#FFFFFF').font('Helvetica-Bold').text('TNMSSA / RECEIPT', 225, 725, {
      width: 145,
      align: 'center',
    });

    doc.fontSize(9).fillColor('#09246B').font('Helvetica-Bold');
    doc.text(`S.No.: ${application.serialNumber}`, 40, 726);
    doc.text(`Date: ${regDate}`, 420, 726, { width: 135, align: 'right' });

    doc.fontSize(8.5).fillColor('#111827').font('Helvetica');
    doc.text(
      `Received application from ${application.applicantName} (${application.shopName}) with UPI Ref: ${payment.upiTransactionId || '—'} for Rs. ${payment.amount || 1200}/-. Status: ${payStatusLabel}.`,
      40,
      752,
      { width: 510 }
    );

    doc.fontSize(8).fillColor('#475569').text('Authorized Signatory (TNMSSA)', 400, 788, {
      width: 150,
      align: 'right',
    });

    doc.end();
  });
};

const generateReceiptPdf = async (application, settings) => {
  const payment = application.payments?.[0] || {};
  const regDate = new Date(payment.submittedAt || application.createdAt).toLocaleDateString('en-IN');
  const payStatusLabel = formatPaymentStatusLabel(payment.paymentStatus);

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A5', layout: 'landscape', margin: 24 });
    const chunks = [];
    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    doc.rect(18, 18, 559, 384).lineWidth(2).stroke('#09246B');

    if (fs.existsSync(LOGO_PATH)) {
      doc.image(LOGO_PATH, 30, 28, { width: 50, height: 50 });
    }

    doc
      .fontSize(13)
      .fillColor('#B91C1C')
      .font('Helvetica-Bold')
      .text(settings?.associationNameEn || 'TAMILNADU MOBILE SALES AND SERVICE ASSOCIATION', 90, 30, {
        width: 470,
        align: 'center',
      });
    doc
      .fontSize(8.5)
      .fillColor('#111827')
      .font('Helvetica')
      .text(settings?.address || '234 Meenakshi Bazar, Scott Road, Madurai - 625001', 90, 50, {
        width: 470,
        align: 'center',
      });

    doc.roundedRect(225, 70, 145, 22, 4).fill('#B91C1C');
    doc.fontSize(10.5).fillColor('#FFFFFF').font('Helvetica-Bold').text('TNMSSA / RECEIPT', 225, 76, {
      width: 145,
      align: 'center',
    });

    doc.fontSize(9.5).fillColor('#09246B').font('Helvetica-Bold');
    doc.text(`Serial No : ${application.serialNumber}`, 36, 112);
    doc.text(`Receipt Date : ${regDate}`, 380, 112, { width: 175, align: 'right' });

    doc.moveTo(32, 130).lineTo(560, 130).lineWidth(0.8).stroke('#CBD5E1');

    const rows = [
      ['Applicant Name', application.applicantName],
      ['Shop Name', application.shopName],
      ['Mobile Number', application.phone],
      ['Membership Plan', payment.planType === 'HALF_YEARLY' ? 'Half-Yearly Subscription' : 'Annual Subscription'],
      ['Amount Paid', `Rs. ${payment.amount || 1200}/-`],
      ['UPI Transaction ID / UTR', payment.upiTransactionId || '—'],
      ['Payment Verification Status', payStatusLabel],
      ['Membership Status', application.membershipStatus || 'PENDING'],
    ];

    let y = 148;
    for (const [k, v] of rows) {
      doc.fontSize(9.5).fillColor('#475569').font('Helvetica-Bold').text(`${k}:`, 36, y);
      doc
        .fontSize(10)
        .fillColor(
          k.includes('Payment Verification')
            ? payment.paymentStatus === 'VERIFIED'
              ? '#16A34A'
              : payment.paymentStatus === 'REJECTED'
              ? '#DC2626'
              : '#D97706'
            : '#111827'
        )
        .font('Helvetica-Bold')
        .text(String(v), 215, y);
      y += 24;
    }

    doc
      .fontSize(8)
      .fillColor('#64748B')
      .font('Helvetica')
      .text(
        'Note: Static UPI payments remain PENDING VERIFICATION until verified by the TNMSSA Administration.',
        36,
        355
      );

    doc.end();
  });
};

module.exports = { generateApplicationPdf, generateReceiptPdf };
