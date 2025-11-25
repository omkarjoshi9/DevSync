import { RoomService } from '../services/room.service.js';

export const createRoom = async (req, res, next) => {
  try {
    const result = await RoomService.createRoom({
      ownerId: req.userId,
      ...req.body,
    });
    res.status(201).json({
      success: true,
      data: { room: result },
      message: 'Room created successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const joinRoom = async (req, res, next) => {
  try {
    const result = await RoomService.joinRoom({
      roomId: req.body.roomId,
      userId: req.userId,
      password: req.body.password,
    });
    res.json({
      success: true,
      data: result,
      message: 'Joined room successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const getRoom = async (req, res, next) => {
  try {
    // Decode the roomId parameter (it might be URL encoded)
    const roomId = decodeURIComponent(req.params.roomId);
    console.log('getRoom controller:', { original: req.params.roomId, decoded: roomId });
    const result = await RoomService.getRoom(roomId, req.userId);
    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const validateRoom = async (req, res, next) => {
  try {
    const result = await RoomService.validateRoom(
      req.params.roomId,
      req.body.password
    );
    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteRoom = async (req, res, next) => {
  try {
    const result = await RoomService.deleteRoom(req.params.roomId, req.userId);
    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const leaveRoom = async (req, res, next) => {
  try {
    const result = await RoomService.leaveRoom(req.params.roomId, req.userId);
    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getActiveRooms = async (req, res, next) => {
  try {
    const result = await RoomService.getActiveRooms(req.userId);
    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getParticipants = async (req, res, next) => {
  try {
    const result = await RoomService.getParticipants(req.params.roomId, req.userId);
    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

