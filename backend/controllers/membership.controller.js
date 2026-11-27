const prisma = require('../config/database');
const { resolveUploadedFileUrl } = require('../middleware/upload.middleware');
const { logActivity } = require('../services/activityLog.service');
const {
  maskAadhaar,
  hashAadhaar,
  encryptAadhaar,
  signPdfDownloadToken,
  verifyPdfDownloadToken,
} = require('../utils/crypto');
const { generateApplicationPdf, generateReceiptPdf } = require('../services/membershipPdf.service');

const isValidAadhaarVerhoeff = (num) => {
  const digits = String(num).replace(/\D/g, '');
  if (!/^\d{12}$/.test(digits) || /^(\d)\1{11}$/.test(digits)) return false;
  const d = [
    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    [1, 2, 3, 4, 0, 6, 7, 8, 9, 5],
    [2, 3, 4, 0, 1, 7, 8, 9, 5, 6],
    [3, 4, 0, 1, 2, 8, 9, 5, 6, 7],
    [4, 0, 1, 2, 3, 9, 5, 6, 7, 8],
    [5, 9, 8, 7, 6, 0, 4, 3, 2, 1],
    [6, 5, 9, 8, 7, 1, 0, 4, 3, 2],
    [7, 6, 5, 9, 8, 2, 1, 0, 4, 3],
    [8, 7, 6, 5, 9, 3, 2, 1, 0, 4],
    [9, 8, 7, 6, 5, 4, 3, 2, 1, 0],
  ];
  const p = [
    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    [1, 5, 7, 6, 2, 8, 3, 0, 9, 4],
    [5, 8, 0, 3, 7, 9, 6, 1, 4, 2],
    [8, 9, 1, 6, 0, 4, 3, 5, 2, 7],
    [9, 4, 5, 3, 1, 2, 6, 8, 7, 0],
    [4, 2, 8, 6, 5, 7, 3, 9, 0, 1],
    [2, 7, 9, 3, 8, 0, 6, 4, 1, 5],
    [7, 0, 4, 6, 9, 1, 3, 2, 5, 8],
  ];
  let c = 0;
  const rev = digits.split('').reverse().map(Number);
  for (let i = 0; i < rev.length; i++) {
    c = d[c][p[i % 8][rev[i]]];
  }
  return c === 0;
};

const getOrCreateSettings = async () => {
  let settings = await prisma.membershipSetting.findFirst();
  if (!settings) {
    settings = await prisma.membershipSetting.create({ data: {} });
  }
  return settings;
};

const calculateAgeFromDob = (dobDate) => {
  const today = new Date();
  let age = today.getFullYear() - dobDate.getFullYear();
  const m = today.getMonth() - dobDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dobDate.getDate())) {
    age--;
  }
  return age;
};

const generateSerialNumber = async (tx) => {
  const year = new Date().getFullYear();
  const count = await tx.membershipApplication.count();
  const seq = String(count + 1).padStart(4, '0');
  return `TNMSSA-${year}-${seq}`;
};

const getMembershipConfig = async (req, res, next) => {
  try {
    const settings = await getOrCreateSettings();
    const count = await prisma.membershipApplication.count();
    const nextSerialPreview = `TNMSSA-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;

    return res.status(200).json({
      success: true,
      data: {
        associationNameEn: settings.associationNameEn,
        associationNameTa: settings.associationNameTa,
        regNumber: settings.regNumber,
        address: settings.address,
        helpline1: settings.helpline1,
        helpline2: settings.helpline2,
        annualFee: settings.annualFee,
        halfYearlyFee: settings.halfYearlyFee,
        upiId: settings.upiId,
        qrCodeUrl: settings.qrCodeUrl,
        termsText: settings.termsText,
        nextSerialPreview,
      },
    });
  } catch (err) {
    next(err);
  }
};

const registerMembership = async (req, res, next) => {
  try {
    const {
      districtId,
      applicantName,
      fatherName,
      dob,
      bloodGroup,
      educationalQualification,
      aadhaarNumber,
      experience,
      shopName,
      shopAddress,
      phone,
      referName,
      email,
      socialId,
      alternateMobile,
      areaRtoNo,
      planType,
      upiTransactionId,
      termsAccepted,
      website_url,
    } = req.body;

    // Honeypot anti-bot check
    if (website_url) {
      return res.status(400).json({ success: false, message: 'Invalid form submission.' });
    }

    // Validate required fields
    if (
      !applicantName?.trim() ||
      !fatherName?.trim() ||
      !dob ||
      !bloodGroup?.trim() ||
      !educationalQualification?.trim() ||
      !experience?.trim() ||
      !shopName?.trim() ||
      !shopAddress?.trim() ||
      !phone?.trim() ||
      !email?.trim() ||
      !areaRtoNo?.trim()
    ) {
      return res.status(400).json({ success: false, message: 'Please fill all required applicant fields.' });
    }

    if (termsAccepted !== true && termsAccepted !== 'true') {
      return res.status(400).json({ success: false, message: 'You must accept the terms and conditions.' });
    }

    const cleanPhone = phone.replace(/\D/g, '');
    if (!/^[6-9]\d{9}$/.test(cleanPhone) || /^(\d)\1{9}$/.test(cleanPhone)) {
      return res.status(400).json({ success: false, message: 'Please enter a valid 10-digit Indian mobile number.' });
    }

    if (alternateMobile && alternateMobile.trim()) {
      const cleanAlt = alternateMobile.replace(/\D/g, '');
      if (!/^[6-9]\d{9}$/.test(cleanAlt) || /^(\d)\1{9}$/.test(cleanAlt)) {
        return res.status(400).json({ success: false, message: 'Alternate mobile must be a valid 10-digit number.' });
      }
      if (cleanAlt === cleanPhone) {
        return res.status(400).json({ success: false, message: 'Alternate mobile cannot be the same as primary mobile.' });
      }
    }

    const cleanEmail = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      return res.status(400).json({ success: false, message: 'Please enter a valid email address.' });
    }

    const cleanTxn = (upiTransactionId || '').trim();
    if (cleanTxn.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Valid UPI Transaction ID / UTR Number (at least 6 characters) is required.',
      });
    }

    const photoFile = req.files?.photo?.[0];
    if (!photoFile) {
      return res.status(400).json({ success: false, message: 'Applicant photograph (JPG/PNG) is required.' });
    }

    const dobDate = new Date(dob);
    if (Number.isNaN(dobDate.getTime())) {
      return res.status(400).json({ success: false, message: 'Invalid Date of Birth.' });
    }
    const age = calculateAgeFromDob(dobDate);
    if (age < 18 || age > 100) {
      return res.status(400).json({ success: false, message: 'Applicant must be at least 18 years old.' });
    }

    // Prevent duplicate applications or duplicate transaction IDs
    const [existingApp, existingTxn] = await Promise.all([
      prisma.membershipApplication.findFirst({
        where: {
          OR: [{ phone: cleanPhone }, { email: cleanEmail }],
          membershipStatus: { in: ['PENDING', 'APPROVED'] },
        },
      }),
      prisma.membershipPayment.findUnique({ where: { upiTransactionId: cleanTxn } }),
    ]);

    if (existingApp) {
      return res.status(409).json({
        success: false,
        message: `An active or pending application already exists for this mobile/email (Serial: ${existingApp.serialNumber}).`,
      });
    }

    if (existingTxn) {
      return res.status(409).json({
        success: false,
        message: 'This UPI Transaction ID / UTR Number has already been submitted.',
      });
    }

    const settings = await getOrCreateSettings();
    const selectedPlan = planType === 'HALF_YEARLY' ? 'HALF_YEARLY' : 'ANNUAL';
    const feeAmount = selectedPlan === 'HALF_YEARLY' ? settings.halfYearlyFee : settings.annualFee;

    const photoUrl = resolveUploadedFileUrl(req, photoFile);
    const sigFile = req.files?.signature?.[0];
    const sigUrl = sigFile ? resolveUploadedFileUrl(req, sigFile) : null;
    const screenshotFile = req.files?.paymentScreenshot?.[0];
    const screenshotUrl = screenshotFile ? resolveUploadedFileUrl(req, screenshotFile) : null;

    const aadhaarDigits = (aadhaarNumber || '').replace(/\D/g, '');
    if (aadhaarDigits) {
      if (!isValidAadhaarVerhoeff(aadhaarDigits)) {
        return res.status(400).json({ success: false, message: 'Please enter a valid 12-digit Aadhaar number.' });
      }
      const dupAadhaar = await prisma.membershipApplication.findFirst({
        where: { aadhaarHash: hashAadhaar(aadhaarDigits), membershipStatus: { in: ['PENDING', 'APPROVED'] } },
      });
      if (dupAadhaar) {
        return res.status(409).json({
          success: false,
          message: `An application with this Aadhaar already exists (Serial: ${dupAadhaar.serialNumber}).`,
        });
      }
    }

    const created = await prisma.$transaction(async (tx) => {
      const serialNumber = await generateSerialNumber(tx);

      const appRecord = await tx.membershipApplication.create({
        data: {
          serialNumber,
          districtId: districtId ? parseInt(districtId, 10) : null,
          applicantName: applicantName.trim(),
          age,
          fatherName: fatherName.trim(),
          dob: dobDate,
          bloodGroup: bloodGroup.trim(),
          educationalQualification: educationalQualification.trim(),
          aadhaarMasked: aadhaarDigits ? maskAadhaar(aadhaarDigits) : null,
          aadhaarEncrypted: aadhaarDigits ? encryptAadhaar(aadhaarDigits) : null,
          aadhaarHash: aadhaarDigits ? hashAadhaar(aadhaarDigits) : null,
          experience: experience.trim(),
          shopName: shopName.trim(),
          shopAddress: shopAddress.trim(),
          phone: cleanPhone,
          referName: referName?.trim() || null,
          email: cleanEmail,
          socialId: socialId?.trim() || null,
          alternateMobile: alternateMobile?.trim() || null,
          areaRtoNo: areaRtoNo.trim(),
          termsAccepted: true,
          membershipStatus: 'PENDING',
        },
      });

      const paymentRecord = await tx.membershipPayment.create({
        data: {
          applicationId: appRecord.id,
          planType: selectedPlan,
          amount: feeAmount,
          upiTransactionId: cleanTxn,
          paymentScreenshotUrl: screenshotUrl,
          paymentStatus: 'PAYMENT_SUBMITTED',
          verificationHistory: [
            {
              status: 'PAYMENT_SUBMITTED',
              at: new Date().toISOString(),
              note: `Submitted via static UPI QR (Ref: ${cleanTxn}). Pending admin verification.`,
            },
          ],
        },
      });

      const docs = [
        {
          applicationId: appRecord.id,
          docType: 'PHOTO',
          fileUrl: photoUrl,
          mimeType: photoFile.mimetype,
          fileSize: photoFile.size,
        },
      ];
      if (sigUrl) {
        docs.push({
          applicationId: appRecord.id,
          docType: 'SIGNATURE',
          fileUrl: sigUrl,
          mimeType: sigFile.mimetype,
          fileSize: sigFile.size,
        });
      }
      if (screenshotUrl) {
        docs.push({
          applicationId: appRecord.id,
          docType: 'PAYMENT_SCREENSHOT',
          fileUrl: screenshotUrl,
          mimeType: screenshotFile.mimetype,
          fileSize: screenshotFile.size,
        });
      }

      await tx.membershipDocument.createMany({ data: docs });

      return { appRecord, paymentRecord };
    });

    const pdfToken = signPdfDownloadToken(created.appRecord.serialNumber);

    await logActivity({
      action: 'NEW_MEMBERSHIP_APPLICATION',
      entityType: 'MEMBERSHIP',
      entityId: created.appRecord.id,
      details: `New application ${created.appRecord.serialNumber} from ${created.appRecord.applicantName} (UTR: ${cleanTxn})`,
      req,
    });

    return res.status(201).json({
      success: true,
      message: 'Membership application submitted. Payment is pending admin verification.',
      data: {
        id: created.appRecord.id,
        serialNumber: created.appRecord.serialNumber,
        registrationDate: created.appRecord.registrationDate,
        applicantName: created.appRecord.applicantName,
        membershipStatus: created.appRecord.membershipStatus,
        paymentStatus: created.paymentRecord.paymentStatus,
        amount: created.paymentRecord.amount,
        upiTransactionId: created.paymentRecord.upiTransactionId,
        pdfToken,
      },
    });
  } catch (err) {
    next(err);
  }
};

const authorizePdfRequest = (req, serialNumber) => {
  if (req.user && ['SUPER_ADMIN', 'DISTRICT_ADMIN'].includes(req.user.role)) {
    return true;
  }
  const token = req.query.token;
  if (!token) return false;
  try {
    return verifyPdfDownloadToken(token, serialNumber);
  } catch {
    return false;
  }
};

const downloadApplicationPdf = async (req, res, next) => {
  try {
    const { serialNumber } = req.params;
    if (!authorizePdfRequest(req, serialNumber)) {
      return res.status(401).json({ success: false, message: 'Unauthorized PDF access.' });
    }

    const application = await prisma.membershipApplication.findUnique({
      where: { serialNumber },
      include: {
        district: { select: { nameEn: true, nameTa: true } },
        payments: { orderBy: { submittedAt: 'desc' } },
        documents: true,
      },
    });

    if (!application) {
      return res.status(404).json({ success: false, message: 'Membership application not found.' });
    }

    const settings = await getOrCreateSettings();
    const pdfBuffer = await generateApplicationPdf(application, settings);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${serialNumber}-Application.pdf"`);
    return res.send(pdfBuffer);
  } catch (err) {
    next(err);
  }
};

const downloadReceiptPdf = async (req, res, next) => {
  try {
    const { serialNumber } = req.params;
    if (!authorizePdfRequest(req, serialNumber)) {
      return res.status(401).json({ success: false, message: 'Unauthorized PDF access.' });
    }

    const application = await prisma.membershipApplication.findUnique({
      where: { serialNumber },
      include: {
        payments: { orderBy: { submittedAt: 'desc' } },
      },
    });

    if (!application) {
      return res.status(404).json({ success: false, message: 'Membership application not found.' });
    }

    const settings = await getOrCreateSettings();
    const pdfBuffer = await generateReceiptPdf(application, settings);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${serialNumber}-Receipt.pdf"`);
    return res.send(pdfBuffer);
  } catch (err) {
    next(err);
  }
};

// ── Admin Membership Management ───────────────────────────────────────────────

const getMembershipStats = async (req, res, next) => {
  try {
    const [
      totalMembers,
      newApplications,
      approvedMembers,
      pendingPayments,
      verifiedPayments,
      rejectedPayments,
    ] = await Promise.all([
      prisma.membershipApplication.count(),
      prisma.membershipApplication.count({ where: { membershipStatus: 'PENDING' } }),
      prisma.membershipApplication.count({ where: { membershipStatus: 'APPROVED' } }),
      prisma.membershipPayment.count({ where: { paymentStatus: { in: ['PENDING', 'PAYMENT_SUBMITTED'] } } }),
      prisma.membershipPayment.count({ where: { paymentStatus: 'VERIFIED' } }),
      prisma.membershipPayment.count({ where: { paymentStatus: 'REJECTED' } }),
    ]);

    return res.status(200).json({
      success: true,
      stats: {
        totalMembers,
        newApplications,
        pendingPayments,
        verifiedPayments,
        rejectedPayments,
        approvedMembers,
      },
    });
  } catch (err) {
    next(err);
  }
};

const listMembershipApplications = async (req, res, next) => {
  try {
    const {
      search,
      paymentStatus,
      membershipStatus,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 10,
    } = req.query;

    const where = {};
    if (membershipStatus && membershipStatus !== 'ALL') {
      where.membershipStatus = membershipStatus;
    }
    if (paymentStatus && paymentStatus !== 'ALL') {
      where.payments = { some: { paymentStatus } };
    }
    if (search && search.trim()) {
      const q = search.trim();
      where.OR = [
        { serialNumber: { contains: q, mode: 'insensitive' } },
        { applicantName: { contains: q, mode: 'insensitive' } },
        { phone: { contains: q, mode: 'insensitive' } },
        { email: { contains: q, mode: 'insensitive' } },
        { shopName: { contains: q, mode: 'insensitive' } },
        { payments: { some: { upiTransactionId: { contains: q, mode: 'insensitive' } } } },
      ];
    }

    const allowedSort = ['createdAt', 'serialNumber', 'applicantName'];
    const orderField = allowedSort.includes(sortBy) ? sortBy : 'createdAt';
    const orderDir = sortOrder === 'asc' ? 'asc' : 'desc';

    const pageNum = Math.max(1, parseInt(page, 10));
    const pageSize = Math.min(50, Math.max(1, parseInt(limit, 10)));

    const [applications, total] = await Promise.all([
      prisma.membershipApplication.findMany({
        where,
        skip: (pageNum - 1) * pageSize,
        take: pageSize,
        orderBy: { [orderField]: orderDir },
        select: {
          id: true,
          serialNumber: true,
          registrationDate: true,
          applicantName: true,
          phone: true,
          email: true,
          shopName: true,
          membershipStatus: true,
          createdAt: true,
          district: { select: { id: true, nameEn: true, nameTa: true } },
          payments: {
            orderBy: { submittedAt: 'desc' },
            take: 1,
          },
        },
      }),
      prisma.membershipApplication.count({ where }),
    ]);

    return res.status(200).json({
      success: true,
      data: applications,
      pagination: {
        total,
        page: pageNum,
        limit: pageSize,
        totalPages: Math.ceil(total / pageSize) || 1,
      },
    });
  } catch (err) {
    next(err);
  }
};

const getMembershipApplicationDetail = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const app = await prisma.membershipApplication.findUnique({
      where: { id },
      include: {
        district: { select: { id: true, nameEn: true, nameTa: true } },
        payments: { orderBy: { submittedAt: 'desc' } },
        documents: true,
      },
    });

    if (!app) {
      return res.status(404).json({ success: false, message: 'Application not found.' });
    }

    // Never expose raw/encrypted Aadhaar fields
    const { aadhaarEncrypted, aadhaarHash, ...safeApp } = app;
    return res.status(200).json({ success: true, data: safeApp });
  } catch (err) {
    next(err);
  }
};

const verifyOrRejectPayment = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { paymentStatus, rejectionReason } = req.body;

    if (!['VERIFIED', 'REJECTED'].includes(paymentStatus)) {
      return res.status(400).json({ success: false, message: 'paymentStatus must be VERIFIED or REJECTED.' });
    }
    if (paymentStatus === 'REJECTED' && !rejectionReason?.trim()) {
      return res.status(400).json({ success: false, message: 'Rejection reason is required when rejecting payment.' });
    }

    const app = await prisma.membershipApplication.findUnique({
      where: { id },
      include: { payments: { orderBy: { submittedAt: 'desc' }, take: 1 } },
    });

    if (!app || app.payments.length === 0) {
      return res.status(404).json({ success: false, message: 'Payment record not found.' });
    }

    const payment = app.payments[0];
    const history = Array.isArray(payment.verificationHistory) ? payment.verificationHistory : [];
    history.push({
      status: paymentStatus,
      at: new Date().toISOString(),
      adminEmail: req.user.email,
      reason: rejectionReason?.trim() || null,
    });

    const updated = await prisma.membershipPayment.update({
      where: { id: payment.id },
      data: {
        paymentStatus,
        rejectionReason: paymentStatus === 'REJECTED' ? rejectionReason.trim() : null,
        verifiedAt: paymentStatus === 'VERIFIED' ? new Date() : null,
        verifiedById: req.user.id,
        verificationHistory: history,
      },
    });

    await logActivity({
      userId: req.user.id,
      action: paymentStatus === 'VERIFIED' ? 'VERIFY_MEMBERSHIP_PAYMENT' : 'REJECT_MEMBERSHIP_PAYMENT',
      entityType: 'MEMBERSHIP_PAYMENT',
      entityId: payment.id,
      details: `${paymentStatus} payment for ${app.serialNumber} (UTR: ${payment.upiTransactionId})`,
      req,
    });

    return res.status(200).json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
};

const approveOrRejectMembership = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { membershipStatus, rejectionReason } = req.body;

    if (!['APPROVED', 'REJECTED'].includes(membershipStatus)) {
      return res.status(400).json({ success: false, message: 'membershipStatus must be APPROVED or REJECTED.' });
    }

    const app = await prisma.membershipApplication.findUnique({
      where: { id },
      include: { payments: { orderBy: { submittedAt: 'desc' }, take: 1 } },
    });

    if (!app) {
      return res.status(404).json({ success: false, message: 'Application not found.' });
    }

    const latestPayment = app.payments[0];
    if (membershipStatus === 'APPROVED' && latestPayment?.paymentStatus !== 'VERIFIED') {
      return res.status(400).json({
        success: false,
        message: 'Payment must be VERIFIED before approving the membership application.',
      });
    }

    if (membershipStatus === 'REJECTED' && !rejectionReason?.trim()) {
      return res.status(400).json({ success: false, message: 'Rejection reason is required.' });
    }

    const updated = await prisma.membershipApplication.update({
      where: { id },
      data: {
        membershipStatus,
        rejectionReason: membershipStatus === 'REJECTED' ? rejectionReason.trim() : null,
        approvedAt: membershipStatus === 'APPROVED' ? new Date() : null,
        reviewedById: req.user.id,
      },
    });

    await logActivity({
      userId: req.user.id,
      action: membershipStatus === 'APPROVED' ? 'APPROVE_MEMBERSHIP' : 'REJECT_MEMBERSHIP',
      entityType: 'MEMBERSHIP',
      entityId: app.id,
      details: `${membershipStatus} membership ${app.serialNumber} (${app.applicantName})`,
      req,
    });

    return res.status(200).json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
};

const getMembershipSettingsAdmin = async (req, res, next) => {
  try {
    const settings = await getOrCreateSettings();
    return res.status(200).json({ success: true, data: settings });
  } catch (err) {
    next(err);
  }
};

const updateMembershipSettings = async (req, res, next) => {
  try {
    const existing = await getOrCreateSettings();
    const {
      annualFee,
      halfYearlyFee,
      upiId,
      helpline1,
      helpline2,
      address,
      termsText,
      qrCodeUrl,
    } = req.body;

    const resolvedQr = req.file ? resolveUploadedFileUrl(req, req.file) : qrCodeUrl;

    const updated = await prisma.membershipSetting.update({
      where: { id: existing.id },
      data: {
        ...(annualFee !== undefined && { annualFee: Math.max(0, parseInt(annualFee, 10) || 1200) }),
        ...(halfYearlyFee !== undefined && { halfYearlyFee: Math.max(0, parseInt(halfYearlyFee, 10) || 600) }),
        ...(upiId !== undefined && { upiId: upiId.trim() }),
        ...(helpline1 !== undefined && { helpline1: helpline1.trim() }),
        ...(helpline2 !== undefined && { helpline2: helpline2.trim() }),
        ...(address !== undefined && { address: address.trim() }),
        ...(termsText !== undefined && { termsText: termsText.trim() }),
        ...(resolvedQr && { qrCodeUrl: resolvedQr }),
      },
    });

    await logActivity({
      userId: req.user.id,
      action: 'UPDATE_MEMBERSHIP_SETTINGS',
      entityType: 'MEMBERSHIP_SETTINGS',
      entityId: updated.id,
      details: `Updated membership QR/Fee settings (Annual: ₹${updated.annualFee}, Half-Yearly: ₹${updated.halfYearlyFee}, UPI: ${updated.upiId})`,
      req,
    });

    return res.status(200).json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
};

const deleteMembershipApplication = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const existing = await prisma.membershipApplication.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Membership application not found.' });
    }

    await prisma.membershipApplication.delete({ where: { id } });

    await logActivity({
      userId: req.user.id,
      action: 'DELETE_MEMBERSHIP',
      entityType: 'MEMBERSHIP',
      entityId: id,
      details: `Deleted membership application ${existing.serialNumber} (${existing.applicantName})`,
      req,
    });

    return res.status(200).json({ success: true, message: 'Membership application deleted successfully.' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getMembershipConfig,
  registerMembership,
  downloadApplicationPdf,
  downloadReceiptPdf,
  getMembershipStats,
  listMembershipApplications,
  getMembershipApplicationDetail,
  verifyOrRejectPayment,
  approveOrRejectMembership,
  getMembershipSettingsAdmin,
  updateMembershipSettings,
  deleteMembershipApplication,
};
