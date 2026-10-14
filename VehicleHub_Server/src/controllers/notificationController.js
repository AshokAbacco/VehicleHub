import notificationService from "../services/notificationService.js";
import { sendSuccess } from "../utils/response.js";

export const sendNotification = async (req, res, next) => {
  try {
    const notification = await notificationService.createNotification({
      ...req.body,
      userId: req.body.userId,
    });
    sendSuccess(res, "Notification sent", notification, 201);
  } catch (error) {
    next(error);
  }
};

export const getNotifications = async (req, res, next) => {
  try {
    const notifications = await notificationService.getNotifications(
      req.user.id,
    );
    sendSuccess(res, "Notifications fetched", notifications);
  } catch (error) {
    next(error);
  }
};

export const readNotification = async (req, res) =>
  sendSuccess(res, "Notification marked read");
export const deleteNotification = async (req, res) =>
  sendSuccess(res, "Notification deleted");
