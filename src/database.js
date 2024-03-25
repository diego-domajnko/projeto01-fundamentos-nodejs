import fs from "node:fs/promises";

const databasePath = new URL("db.json", import.meta.url);

export class Database {
  #database = {};

  constructor() {
    fs.readFile(databasePath, "utf-8")
      .then((data) => {
        this.#database = JSON.parse(data);
      })
      .catch(() => {
        this.#persist();
      });
  }

  #persist() {
    fs.writeFile(databasePath, JSON.stringify(this.#database));
  }

  select(table, search) {
    let data = this.#database[table] || [];
    if (search) {
      data = data.filter((item) => {
        return Object.entries(search).some(([key, value]) => item[key].toLowerCase().includes(value.toLowerCase()));
      });
    }
    return data;
  }

  insert(table, data) {
    const tableFounded = this.#database[table];
    if (tableFounded) {
      tableFounded.push(data);
    } else {
      this.#database[table] = [data];
    }
    this.#persist();
  }

  delete(table, id) {
    const idx = this.#database[table].findIndex((item) => item.id === id);
    const founded = idx > -1;
    if (founded) {
      this.#database[table].splice(idx, 1);
      this.#persist();
    }
    return founded;
  }

  update(table, id, data) {
    const idx = this.#database[table].findIndex((item) => item.id === id);
    const founded = idx > -1;
    if (founded) {
      const task = this.#database[table][idx];
      this.#database[table][idx] = { ...task, ...data };
      this.#persist();
    }
    return founded;
  }

  complete(table, id) {
    const idx = this.#database[table].findIndex((item) => item.id === id);
    const founded = idx > -1;
    let alreadyCompleted = false;
    if (founded) {
      const task = this.#database[table][idx];
      if (!task.completed_at) {
        this.#database[table][idx] = { ...task, completed_at: new Date() };
        this.#persist();
      }
      {
        alreadyCompleted = true;
      }
    }
    return founded && !alreadyCompleted;
  }
}
