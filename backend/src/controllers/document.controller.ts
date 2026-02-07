import { AppDataSource } from "../config/db";
import { Document } from "../entities/Document";
import { PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3 } from "../config/s3";
import { v4 as uuid } from "uuid";
// import { redis } from '../config/redis';
import { getIo } from "../sockets/socket";
import { Notification } from "../entities/Notification";

export const uploadDocument = async (req: any, res: any) => {
  try {
    const file = req.file;
    const key = `documents/${uuid()}-${file.originalname}`;

    await s3.send(
      new PutObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET!,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      })
    );

    const docRepo: any = AppDataSource.getRepository(Document);
    const doc = docRepo.create({
      name: file.originalname,
      category: req.body.category,
      s3_key: key,
      s3_url: `${process.env.AWS_URL}/${key}`,
      file_size: file.size,
      file_type: file.mimetype,
      user: req?.body?.user_id || req.user.id,
      description: req.body.description || null,

    });

    await docRepo.save(doc);
    // create notification record
    try {
      const notifRepo = AppDataSource.getRepository(Notification);
      const notification = notifRepo.create({
        user_id: req?.body?.user_id || req.user.id,
        type: "document:uploaded",
        message: `Document uploaded: ${doc.name}`,
      });
      await notifRepo.save(notification);

      // emit socket event and notification
      const io = getIo();
      io.to(req?.body?.user_id || req.user.id).emit("document:uploaded", doc);
      io.to(req?.body?.user_id || req.user.id).emit("notification:new", notification);
    } catch (err) {
      console.warn("Socket or notification error after upload, continuing", err);
    }

    res.status(201).json(doc);


    // // ❗ cache document
    // await redis.setex(`doc:${doc.id}`, 600, JSON.stringify(doc));

    // // ❗ socket event
    // req.io.to(req?.body?.user_id || req.user.id).emit("document:uploaded", doc);

    // res.status(201).json({
    //   success: true,
    //   documentId: doc.id,
    //   s3_url: doc.s3_url,
    // });
  } catch (err) {
    res.status(500).json({ message: "Upload failed" });
  }
};

export const getDocuments = async (req: any, res: any) => {
  try {
    const userId = req.user.id;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const search = req.query.search || "";
    const categoryId = req.query.category;

    const repo = AppDataSource.getRepository(Document);

    const qb = repo
      .createQueryBuilder("doc")
      .leftJoinAndSelect("doc.user", "user")
      .leftJoinAndSelect("doc.category", "category")
      .where("user.id = :userId", { userId });

    // 🔍 Search by document name
    if (search) {
      qb.andWhere("doc.name LIKE :search", { search: `%${search}%` });
    }

    // 🗂️ Filter by category
    if (categoryId) {
      qb.andWhere("category.id = :categoryId", { categoryId });
    }

    // 📄 Pagination
    qb.skip((page - 1) * limit).take(limit);

    const docs = await qb.getMany();

    return res.json({
      page,
      limit,
      count: docs.length,
      data: docs,
    });
  } catch (error) {
    console.error("getDocuments error:", error);
    return res.status(500).json({ message: "Failed to fetch documents" });
  }
};


export const updateDocument = async (req: any, res: any) => {
  const { id } = req.params;
  const userId = req.user.id;

  const repo = AppDataSource.getRepository(Document);
  const doc = await repo.findOne({ where: { id, user: { id: userId } } });

  if (!doc) return res.status(404).json({ message: "Not found" });

  repo.merge(doc, req.body);
  await repo.save(doc);

  // await redis.del(`doc:${id}`);
  try {
    const notifRepo = AppDataSource.getRepository(Notification);
    const notification = notifRepo.create({
      user_id: userId,
      type: "document:updated",
      message: `Document updated: ${doc.name}`,
    });
    await notifRepo.save(notification);

    const io = getIo();
    io.to(userId).emit("document:updated", doc);
    io.to(userId).emit("notification:new", notification);
  } catch (err) {
    console.warn("Socket or notification error on update", err);
  }

  res.json(doc);
};



export const deleteDocument = async (req: any, res: any) => {
  const { id } = req.params;
  const userId = req.user.id;

  const repo = AppDataSource.getRepository(Document);
  const doc = await repo.findOne({ where: { id, user: { id: userId } } });

  if (!doc) return res.status(404).json({ message: "Not found" });

  // Delete S3 object
  await s3.send(new DeleteObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET!,
    Key: doc.s3_key,
  }));

  await repo.remove(doc);

  // Emit to user's room + create notification
  try {
    const notifRepo = AppDataSource.getRepository(Notification);
    const notification = notifRepo.create({
      user_id: userId,
      type: "document:deleted",
      message: `Document deleted: ${doc.name}`,
    });
    await notifRepo.save(notification);

    const io = getIo();
    io.to(userId).emit("document:deleted", { id });
    io.to(userId).emit("notification:new", notification);
  } catch (err) {
    console.warn("Socket or notification error on delete", err);
  }

  res.json({ message: "Deleted successfully" });
};


export const getDocumentById = async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // 🔹 1. (Optional) Redis cache
    // const cached = await redis.get(`doc:${id}`);
    // if (cached) {
    //   return res.json(JSON.parse(cached));
    // }

    // 🔹 2. DB fetch with ownership check
    const repo = AppDataSource.getRepository(Document);
    const doc = await repo.findOne({
      where: {
        id,
        user: { id: userId },
      },
    });

    if (!doc) {
      return res.status(404).json({ message: "Document not found" });
    }

    // 🔹 3. Generate signed URL (5 min)
    const signedUrl = await getSignedUrl(
      s3,
      new GetObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET!,
        Key: doc.s3_key,
      }),
      { expiresIn: 60 * 5 }
    );

    const response = {
      id: doc.id,
      name: doc.name,
      description: doc.description,
      category: doc.category,
      file_size: doc.file_size,
      file_type: doc.file_type,
      created_at: doc.created_at,
      signed_url: signedUrl,
    };

    // 🔹 4. Cache result (optional)
    // await redis.setex(`doc:${id}`, 600, JSON.stringify(response));

    return res.json(response);
  } catch (error) {
    console.error("getDocumentById error:", error);
    return res.status(500).json({ message: "Failed to fetch document" });
  }
};

