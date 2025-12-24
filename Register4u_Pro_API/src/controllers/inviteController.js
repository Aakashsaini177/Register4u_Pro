const { Invite, Category, Company } = require("../models");
const { asyncHandler } = require("../middleware/errorHandler");

// Helper to generate code
const generateCode = () => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Removed I, 1, 0, O for clarity
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

// Create a new invite
exports.createInvite = asyncHandler(async (req, res) => {
  console.log("📝 Creating invite:", req.body);
  console.log("👤 Creator:", req.user);

  const {
    name,
    contact,
    type,
    maxUses,
    validUntil,
    category,
    company,
    hostName,
    purpose,
  } = req.body;

  // Handle Legacy Admin ID (if user hasn't re-logged in)
  let creatorId = req.user.id;
  if (creatorId === 1 || creatorId === "1") {
    creatorId = "000000000000000000000001";
  }

  // Generate unique code
  let code = generateCode();
  let exists = await Invite.findOne({ code });
  while (exists) {
    code = generateCode();
    exists = await Invite.findOne({ code });
  }

  const invite = await Invite.create({
    code,
    name,
    contact,
    creator: creatorId,
    type: maxUses && maxUses > 1 ? "MULTI" : type || "SINGLE",
    maxUses: maxUses || 1,
    validUntil: validUntil || new Date(Date.now() + 24 * 60 * 60 * 1000), // Default 24h
    prefillData: {
      category: category ? category : undefined,
      company: company ? company : undefined,
      hostName,
      purpose,
    },
  });

  res.status(201).json({
    success: true,
    data: invite,
  });
});

// Get all invites (Admin/Staff)
exports.getAllInvites = asyncHandler(async (req, res) => {
  const invites = await Invite.find()
    .populate("creator", "username")
    .populate("prefillData.category", "category")
    .populate("prefillData.company", "company_name")
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    count: invites.length,
    data: invites,
  });
});

// Get invite by ID
exports.getInviteById = asyncHandler(async (req, res) => {
  const invite = await Invite.findById(req.params.id)
    .populate("creator", "username")
    .populate("prefillData.category", "category")
    .populate("prefillData.company", "company_name");

  if (!invite) {
    return res.status(404).json({
      success: false,
      message: "Invite not found",
    });
  }

  res.json({
    success: true,
    data: invite,
  });
});

// Validate invite (Public)
exports.validateInvite = asyncHandler(async (req, res) => {
  const { code } = req.params;

  // Find by code ONLY (don't filter by status yet) to give better errors
  const invite = await Invite.findOne({ code })
    .populate("prefillData.category", "category")
    .populate("prefillData.company", "company_name");

  if (!invite) {
    return res.status(404).json({
      success: false,
      message: "Invalid invite code",
    });
  }

  // Check status specifically
  if (invite.status === "EXPIRED") {
    return res.status(400).json({
      success: false,
      message: "This invite has expired",
    });
  }

  if (invite.status === "USED") {
    return res.status(400).json({
      success: false,
      message: "This invite has been fully used",
    });
  }

  // Double check calculated expiry (just in case status wasn't updated)
  if (new Date() > new Date(invite.validUntil)) {
    invite.status = "EXPIRED";
    await invite.save();
    return res.status(400).json({
      success: false,
      message: "This invite has expired",
    });
  }

  // Check usage limits
  if (invite.type === "SINGLE" && invite.usedCount > 0) {
    invite.status = "USED";
    await invite.save();
    return res.status(400).json({
      success: false,
      message: "This invite has already been used",
    });
  }

  if (
    invite.type === "MULTI" &&
    invite.maxUses > 0 &&
    invite.usedCount >= invite.maxUses
  ) {
    invite.status = "EXPIRED"; // or fully used
    await invite.save();
    return res.status(400).json({
      success: false,
      message: "Invite limit reached",
    });
  }

  res.json({
    success: true,
    data: invite,
  });
});

// Update Invite
exports.updateInvite = asyncHandler(async (req, res) => {
  const {
    name,
    contact,
    type,
    maxUses,
    validUntil,
    category,
    company,
    hostName,
    purpose,
  } = req.body;

  let invite = await Invite.findById(req.params.id);

  if (!invite) {
    return res
      .status(404)
      .json({ success: false, message: "Invite not found" });
  }

  invite.name = name || invite.name;
  invite.contact = contact || invite.contact;
  invite.maxUses = maxUses !== undefined ? parseInt(maxUses) : invite.maxUses;
  invite.validUntil = validUntil || invite.validUntil;

  // Force type based on maxUses
  if (invite.maxUses > 1) {
    invite.type = "MULTI";
  } else if (invite.maxUses === 1 && type) {
    invite.type = type; // Allow manual set if 1, but usually SINGLE
  }

  // Update prefill data properly
  if (category !== undefined) {
    invite.prefillData.category = category === "" ? null : category;
  }
  if (company !== undefined) {
    invite.prefillData.company = company === "" ? null : company;
  }
  if (hostName !== undefined) invite.prefillData.hostName = hostName;
  if (purpose !== undefined) invite.prefillData.purpose = purpose;

  // Reactivate logic
  // Calculate if it SHOULD be active
  const isNotExpired = new Date(invite.validUntil) > new Date();
  const hasUsesLeft =
    (invite.type === "SINGLE" && invite.usedCount === 0) ||
    (invite.type === "MULTI" && invite.usedCount < invite.maxUses);

  if (isNotExpired && hasUsesLeft) {
    invite.status = "ACTIVE";
  } else if (!isNotExpired) {
    invite.status = "EXPIRED";
  } else if (!hasUsesLeft) {
    // If time is okay but no uses left
    invite.status = invite.type === "SINGLE" ? "USED" : "EXPIRED";
  }

  await invite.save();

  res.json({
    success: true,
    data: invite,
  });
});

// Delete Invite
exports.deleteInvite = asyncHandler(async (req, res) => {
  const invite = await Invite.findById(req.params.id);
  if (!invite) {
    return res
      .status(404)
      .json({ success: false, message: "Invite not found" });
  }
  await invite.deleteOne();
  res.json({ success: true, message: "Invite deleted" });
});
