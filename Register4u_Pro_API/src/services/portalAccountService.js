const PortalAccount = require("../models/PortalAccount");

const ensurePortalAccount = async ({
  role,
  loginId,
  entityId,
  defaultPassword,
}) => {
  if (!role || !loginId || !entityId) {
    throw new Error(
      "Role, loginId and entityId are required to create portal account"
    );
  }

  // Map loginId to username
  let account = await PortalAccount.findOne({ username: loginId });

  if (account) {
    // Check if entityId matches. If it doesn't, it's a reclaimed ID (e.g. driver deleted and recreated).
    // In this case, we must update the entityId and reset the password to default to ensure access.
    if (account.entityId.toString() !== entityId.toString()) {
      console.log(
        `♻️  Reclaiming Portal Account for ${loginId}: Updating entityId and resetting password.`
      );
      account.entityId = entityId;
      account.password = defaultPassword || loginId; // This triggers pre-save hash
      await account.save();
    }
    return account;
  }

  account = await PortalAccount.create({
    role,
    username: loginId,
    entityId,
    password: defaultPassword || loginId,
  });

  return account;
};

const deletePortalAccount = async ({ role, entityId }) => {
  const result = await PortalAccount.deleteOne({ role, entityId });
  return result.deletedCount > 0;
};

const resetPortalPassword = async (
  loginId,
  newPassword,
  mustChangePassword = false
) => {
  const account = await PortalAccount.findOne({ username: loginId });

  if (!account) {
    throw new Error("Portal account not found");
  }

  account.password = newPassword;
  // account.mustChangePassword = mustChangePassword; // Not in schema yet
  await account.save();

  return account;
};

const updatePortalAccountStatus = async ({ role, entityId, status }) => {
  const account = await PortalAccount.findOne({
    role,
    entityId,
  });

  if (!account) {
    return null;
  }

  if (status) {
    account.isActive = status === "active";
  }

  await account.save();

  return account;
};

const syncAllPortalAccounts = async () => {
  const Hotel = require("../models/Hotel");
  const Driver = require("../models/Driver");
  const TravelDetail = require("../models/TravelDetail");
  const Visitor = require("../models/Visitor");

  const results = {
    hotel: 0,
    driver: 0,
    travel: 0,
  };

  const hotels = await Hotel.find();
  for (const hotel of hotels) {
    if (!hotel.hotelId) continue;

    const account = await PortalAccount.findOne({
      role: "hotel",
      entityId: hotel._id,
    });
    if (!account) {
      await ensurePortalAccount({
        role: "hotel",
        loginId: hotel.hotelId,
        entityId: hotel._id,
        defaultPassword: hotel.hotelId,
      });
      results.hotel += 1;
    }
  }

  const drivers = await Driver.find();
  for (const driver of drivers) {
    if (!driver.driverId) continue;

    const account = await PortalAccount.findOne({
      role: "driver",
      entityId: driver._id,
    });

    if (!account) {
      await ensurePortalAccount({
        role: "driver",
        loginId: driver.driverId,
        entityId: driver._id,
        defaultPassword: driver.driverId,
      });
      results.driver += 1;
    }
  }

  // Travel sync
  // We need visitor string ID for login
  const travels = await TravelDetail.find();
  for (const travel of travels) {
    if (!travel.visitorId) {
      continue;
    }
    const visitorStringId = travel.visitorId;

    const account = await PortalAccount.findOne({
      role: "travel",
      entityId: travel._id,
    });
    if (!account) {
      await ensurePortalAccount({
        role: "travel",
        loginId: visitorStringId,
        entityId: travel._id,
        defaultPassword: visitorStringId,
      });
      results.travel += 1;
    }
  }

  return results;
};

module.exports = {
  ensurePortalAccount,
  resetPortalPassword,
  updatePortalAccountStatus,
  syncAllPortalAccounts,
};
