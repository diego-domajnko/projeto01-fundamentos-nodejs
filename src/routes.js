import { Database } from "./database.js";
import { randomUUID } from "node:crypto";
import { extractRoute } from "./utils/extractRoute.js";

const db = new Database();

export const routes = [
  {
    method: "GET",
    path: extractRoute("/tasks"),
    handler: (req, res) => {
      const { search } = req.query;
      const data = db.select("tasks", search ? { title: search, description: search } : null);
      res.writeHead(200).end(JSON.stringify(data));
    },
  },
  {
    method: "POST",
    path: extractRoute("/tasks"),
    handler: (req, res) => {
      const { title, description } = req.body ?? {};
      if (title && description) {
        const newTask = {
          id: randomUUID(),
          title,
          description,
          created_at: new Date(),
          completed_at: null,
          updated_at: null,
        };
        db.insert("tasks", newTask);
        return res.writeHead(201).end("Task created successfully!");
      }
      if (!title && !!description) {
        return res.writeHead(400).end("Title is required!");
      }
      if (!description && !!title) {
        return res.writeHead(400).end("Description is required!");
      }
      res.writeHead(400).end("Title and description are required!");
    },
  },
  {
    method: "PUT",
    path: extractRoute("/tasks/:id"),
    handler: (req, res) => {
      const { title, description } = req.body ?? {};
      if (title && description) {
        const { id } = req.params;
        if (id) {
          const updatedTask = { title, description, updated_at: new Date() };
          const success = db.update("tasks", id, updatedTask);
          if (success) {
            return res.writeHead(204).end();
          }
        }
        return res.writeHead(404).end("Task not found!");
      }
      if (!title && !!description) {
        return res.writeHead(400).end("Title is required!");
      }
      if (!description && !!title) {
        return res.writeHead(400).end("Description is required!");
      }
      res.writeHead(400).end("Title and description are required!");
    },
  },
  {
    method: "DELETE",
    path: extractRoute("/tasks/:id"),
    handler: (req, res) => {
      const { id } = req.params;
      if (id) {
        const success = db.delete("tasks", id);
        if (success) {
          return res.writeHead(204).end();
        }
      }
      res.writeHead(404).end("Task not found!");
    },
  },
  {
    method: "PATCH",
    path: extractRoute("/tasks/:id/complete"),
    handler: (req, res) => {
      const { id } = req.params;
      if (id) {
        const success = db.complete("tasks", id);
        if (success) {
          return res.writeHead(204).end();
        }
        return res.writeHead(400).end("Task already completed!");
      }
      res.writeHead(404).end("Task not found!");
    },
  },
];
