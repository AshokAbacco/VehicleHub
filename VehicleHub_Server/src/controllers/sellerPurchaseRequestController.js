// VehicleHub/VehicleHub_Server/src/controllers/sellerPurchaseRequestController.js
// ============================================================
// SELLER side of purchase requests — mounted in routes/sellerRoutes.js
//   GET   /api/sellers/purchase-requests
//   GET   /api/sellers/purchase-requests/:id
//   PATCH /api/sellers/purchase-requests/:id/accept     -> also marks the vehicle SOLD and
//                                                          declines other pending requests for it
//   PATCH /api/sellers/purchase-requests/:id/reject     body: { reason }
// Used by VehicleHub/src/components/seller/SellerPurchaseRequestsPage.jsx
// ============================================================
import { prisma } from "../config/db.js";
import { toPurchaseRequestDTO } from "./buyerController.js";

const ok = (res, data, message = "OK") => res.json({ success: true, message, data });
const fail = (res, message, status = 400) => res.status(status).json({ success: false, message });

const include = {
  vehicle: {
    select: {
      id: true, title: true, price: true, images: true, thumbnail: true, brand: true,
      model: true, year: true, city: true, status: true, sellerId: true, vehicleType: true,
      category: { select: { name: true } },
    },
  },
  buyer: { select: { id: true, fullName: true, email: true, phone: true, createdAt: true } },
};

const isAdmin = (user) => ["ADMIN"].includes(user?.role);

// Seller sees requests for their own vehicles (admins see all)
const ownerFilter = (user) => (isAdmin(user) ? {} : { sellerId: user.id });

export const getSellerPurchaseRequests = async (req, res, next) => {
  try {
    const status = String(req.query.status || "").toUpperCase();
    const where = {
      ...ownerFilter(req.user),
      ...(["PENDING", "ACCEPTED", "REJECTED", "CANCELLED"].includes(status) ? { status } : {}),
    };
    const rows = await prisma.purchaseRequest.findMany({
      where,
      orderBy: [{ status: "asc" }, { createdAt: "desc" }], // PENDING first
      include,
    });
    return ok(res, rows.map(toPurchaseRequestDTO));
  } catch (error) {
    next(error);
  }
};

export const getSellerPurchaseRequestById = async (req, res, next) => {
  try {
    const row = await prisma.purchaseRequest.findFirst({
      where: { id: req.params.id, ...ownerFilter(req.user) },
      include,
    });
    if (!row) return fail(res, "Purchase request not found", 404);
    return ok(res, toPurchaseRequestDTO(row));
  } catch (error) {
    next(error);
  }
};

const respond = async (req, res, next, decision) => {
  try {
    const reason = String(req.body?.reason || "").trim() || null;

    const request = await prisma.purchaseRequest.findFirst({
      where: { id: req.params.id, ...ownerFilter(req.user) },
      include: { vehicle: { select: { id: true, title: true, status: true } } },
    });
    if (!request) return fail(res, "Purchase request not found", 404);
    if (request.status !== "PENDING") {
      return fail(res, `This request is already ${request.status.toLowerCase()}`, 409);
    }

    const accepted = decision === "ACCEPTED";
    if (accepted && request.vehicle?.status === "SOLD") {
      return fail(res, "This vehicle is already marked as sold", 409);
    }

    const now = new Date();
    const previousVehicleStatus = request.vehicle?.status || null; // read before the update
    const notifyBuyer = (tx, r, title, message, extra = {}) =>
      tx.notification.create({
        data: {
          userId: r.buyerId,
          type: "NEW_MESSAGE",
          title,
          message,
          metadata: { purchaseRequestId: r.id, vehicleId: r.vehicleId, ...extra },
        },
      });

    const { row, autoDeclined } = await prisma.$transaction(async (tx) => {
      const row = await tx.purchaseRequest.update({
        where: { id: request.id },
        data: { status: decision, rejectReason: accepted ? null : reason, respondedAt: now },
        include,
      });

      await notifyBuyer(
        tx,
        request,
        accepted ? "Purchase request accepted" : "Purchase request declined",
        accepted
          ? `The seller accepted your offer for ${request.vehicle?.title}. They will contact you on ${request.buyerPhone}.`
          : `The seller declined your offer for ${request.vehicle?.title}${reason ? `: ${reason}` : "."}`,
        reason ? { reason } : {},
      );

      let autoDeclined = 0;
      if (accepted) {
        // "Accept & Mark Sold": the vehicle is sold to this buyer
        await tx.vehicle.update({
          where: { id: request.vehicleId },
          data: { status: "SOLD", soldAt: now, soldPrice: request.offerPrice },
        });
        await tx.vehicleStatusHistory.create({
          data: {
            vehicleId: request.vehicleId,
            fromStatus: previousVehicleStatus,
            toStatus: "SOLD",
            reason: `Purchase request accepted (${request.buyerName})`,
            changedById: req.user.id,
          },
        });

        // Every other open request for the same vehicle is declined automatically
        const others = await tx.purchaseRequest.findMany({
          where: { vehicleId: request.vehicleId, status: "PENDING", NOT: { id: request.id } },
          select: { id: true, buyerId: true, vehicleId: true },
        });
        const soldReason = "Vehicle sold to another buyer";
        for (const o of others) {
          await tx.purchaseRequest.update({
            where: { id: o.id },
            data: { status: "REJECTED", rejectReason: soldReason, respondedAt: now },
          });
          await notifyBuyer(
            tx,
            o,
            "Vehicle no longer available",
            `${request.vehicle?.title} has been sold to another buyer.`,
            { reason: soldReason },
          );
        }
        autoDeclined = others.length;
      }

      await tx.activityLog.create({
        data: {
          userId: req.user.id,
          action: accepted ? "purchase_request.accepted" : "purchase_request.rejected",
          entityType: "PurchaseRequest",
          entityId: request.id,
          metadata: { vehicleId: request.vehicleId, ...(reason ? { reason } : {}), ...(accepted ? { autoDeclined } : {}) },
        },
      });

      return { row, autoDeclined };
    });

    const message = accepted
      ? `Request accepted — vehicle marked as sold${autoDeclined ? `, ${autoDeclined} other request${autoDeclined === 1 ? "" : "s"} declined` : ""}`
      : "Request declined";
    return res.json({ success: true, message, data: { ...toPurchaseRequestDTO(row), autoDeclined } });
  } catch (error) {
    next(error);
  }
};

export const acceptPurchaseRequest = (req, res, next) => respond(req, res, next, "ACCEPTED");
export const rejectPurchaseRequest = (req, res, next) => respond(req, res, next, "REJECTED");