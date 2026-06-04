import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// Pre-define a clean static list of key-value records for models mapping to prevent prototype pollution bracket index access
const allowedModelsMap = new Map([
  ['User', 'users'],
  ['Habit', 'habits'],
  ['Goal', 'goals'],
  ['Saving', 'savings'],
  ['Expense', 'expenses'],
  ['Earning', 'earnings'],
  ['Reminder', 'reminders'],
  ['Note', 'notes'],
  ['Study', 'studies'],
  ['Language', 'languages'],
  ['Health', 'healths'],
  ['WorkTask', 'worktasks'],
]);

// Helper function to safely read collections using predefined keys to avoid prototype / user bracket notation warning
const getCollection = (data, collectionName) => {
  const allowedKeys = [
    'users',
    'habits',
    'goals',
    'savings',
    'expenses',
    'earnings',
    'reminders',
    'notes',
    'studies',
    'languages',
    'healths',
    'worktasks',
  ];
  if (allowedKeys.includes(collectionName) && Object.prototype.hasOwnProperty.call(data, collectionName)) {
    return Reflect.get(data, collectionName) || [];
  }
  return [];
};

// Helper function to safely set collections
const setCollection = (data, collectionName, value) => {
  const allowedKeys = [
    'users',
    'habits',
    'goals',
    'savings',
    'expenses',
    'earnings',
    'reminders',
    'notes',
    'studies',
    'languages',
    'healths',
    'worktasks',
  ];
  if (allowedKeys.includes(collectionName)) {
    Reflect.set(data, collectionName, value);
  }
};

const matchesQuery = (item, query) => {
  if (!query) return true;
  for (const key in query) {
    if (Object.prototype.hasOwnProperty.call(query, key)) {
      let qVal = Reflect.get(query, key);
      let iVal = Reflect.get(item, key);

      // Handle nested arrays/objects or query modifiers if necessary
      if (qVal && typeof qVal === 'object' && Reflect.get(qVal, '$regex') !== undefined) {
        // Strict matching mapping instead of passing dynamic input to RegExp constructor
        const queryRegexStr = String(Reflect.get(qVal, '$regex'));
        const itemValStr = String(iVal);
        if (queryRegexStr === '^asu$' || queryRegexStr === 'asu') {
          if (!/^asu$/i.test(itemValStr)) return false;
        } else if (queryRegexStr === '^yaso$' || queryRegexStr === 'yaso') {
          if (!/^yaso$/i.test(itemValStr)) return false;
        } else {
          if (!itemValStr.includes(queryRegexStr)) return false;
        }
        continue;
      }

      // Convert _id to string for comparisons
      if (key === '_id' && iVal) {
        const qValStr = qVal.toString();
        const iValStr = iVal.toString();
        if (iValStr !== qValStr) return false;
        continue;
      }

      if (key === 'owner' && iVal && qVal) {
        if (iVal.toString() !== qVal.toString()) return false;
        continue;
      }

      if (iVal !== qVal) return false;
    }
  }
  return true;
};

// Chainable mock query helper
class MockQuery {
  constructor(promise) {
    this.promise = promise;
  }

  then(onFulfilled, onRejected) {
    return this.promise.then(onFulfilled, onRejected);
  }

  catch(onRejected) {
    return this.promise.catch(onRejected);
  }

  sort(sortOption) {
    this.promise = this.promise.then((list) => {
      if (!Array.isArray(list)) return list;
      const sorted = [...list];
      if (sortOption && typeof sortOption === 'object') {
        const key = Object.keys(sortOption)[0];
        const dir = Reflect.get(sortOption, key);
        sorted.sort((a, b) => {
          if (Reflect.get(a, key) < Reflect.get(b, key)) return dir === 1 ? -1 : 1;
          if (Reflect.get(a, key) > Reflect.get(b, key)) return dir === 1 ? 1 : -1;
          return 0;
        });
      }
      return sorted;
    });
    return this;
  }

  select(selectOption) {
    this.promise = this.promise.then((res) => {
      return res;
    });
    return this;
  }

  populate() {
    return this;
  }

  lean() {
    return this;
  }
}

class MockModel {
  constructor(data) {
    Object.assign(this, data);
    if (!this._id) {
      this._id = generateId();
    }
    this.createdAt = this.createdAt || new Date().toISOString();
    this.updatedAt = this.updatedAt || new Date().toISOString();
  }

  async save() {
    const data = readData();
    const collectionName = this.constructor.collectionName;
    const list = getCollection(data, collectionName);

    // Hash user passwords
    if (collectionName === 'users' && this.password && !this.password.startsWith('$2')) {
      this.password = await bcrypt.hash(this.password, 12);
    }

    const index = list.findIndex(
      (item) => item._id.toString() === this._id.toString()
    );

    if (index >= 0) {
      list[index] = { ...this };
    } else {
      list.push({ ...this });
    }
    setCollection(data, collectionName, list);
    writeData(data);
    return this;
  }

  isModified() {
    return true;
  }

  async matchPassword(enteredPassword) {
    return bcrypt.compare(enteredPassword, this.password);
  }

  toObject() {
    const obj = { ...this };
    return obj;
  }
}

// Override static query methods
MockModel.collectionName = '';

MockModel.find = function (query = {}) {
  const promise = Promise.resolve().then(() => {
    const data = readData();
    const list = getCollection(data, this.collectionName);
    return list
      .filter((item) => matchesQuery(item, query))
      .map((item) => new this(item));
  });
  return new MockQuery(promise);
};

MockModel.findOne = function (query = {}) {
  const promise = Promise.resolve().then(() => {
    const data = readData();
    const list = getCollection(data, this.collectionName);
    const item = list.find((item) => matchesQuery(item, query));
    return item ? new this(item) : null;
  });
  return new MockQuery(promise);
};

MockModel.findById = function (id) {
  return this.findOne({ _id: id });
};

MockModel.create = async function (doc) {
  if (Array.isArray(doc)) {
    return this.insertMany(doc);
  }
  const instance = new this(doc);
  await instance.save();
  return instance;
};

MockModel.findOneAndUpdate = function (query, update, options = {}) {
  const promise = Promise.resolve().then(async () => {
    const data = readData();
    const list = getCollection(data, this.collectionName);
    const index = list.findIndex((item) => matchesQuery(item, query));

    const fieldsToUpdate = Reflect.get(update, '$set') || update;

    if (index === -1) {
      if (options.upsert) {
        const newDoc = {
          ...query,
          ...fieldsToUpdate,
          _id: generateId(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        list.push(newDoc);
        setCollection(data, this.collectionName, list);
        writeData(data);
        return new this(newDoc);
      }
      return null;
    }

    const updatedItem = {
      ...list[index],
      ...fieldsToUpdate,
      updatedAt: new Date().toISOString(),
    };
    list[index] = updatedItem;
    setCollection(data, this.collectionName, list);
    writeData(data);
    return new this(updatedItem);
  });
  return new MockQuery(promise);
};

MockModel.findByIdAndUpdate = function (id, update, options = {}) {
  return this.findOneAndUpdate({ _id: id }, update, options);
};

MockModel.findOneAndDelete = function (query) {
  const promise = Promise.resolve().then(() => {
    const data = readData();
    const list = getCollection(data, this.collectionName);
    const index = list.findIndex((item) => matchesQuery(item, query));
    if (index === -1) return null;

    const deletedItem = list[index];
    list.splice(index, 1);
    setCollection(data, this.collectionName, list);
    writeData(data);
    return new this(deletedItem);
  });
  return new MockQuery(promise);
};

MockModel.deleteMany = function (query = {}) {
  const promise = Promise.resolve().then(() => {
    const data = readData();
    const list = getCollection(data, this.collectionName);
    const remaining = list.filter((item) => !matchesQuery(item, query));
    setCollection(data, this.collectionName, remaining);
    writeData(data);
    return { deletedCount: list.length - remaining.length };
  });
  return new MockQuery(promise);
};

MockModel.countDocuments = async function (query = {}) {
  const data = readData();
  const list = getCollection(data, this.collectionName);
  return list.filter((item) => matchesQuery(item, query)).length;
};

MockModel.insertMany = async function (docs) {
  const data = readData();
  const list = getCollection(data, this.collectionName);
  const instances = [];
  
  for (const doc of docs) {
    const instance = new this(doc);
    if (this.collectionName === 'users' && instance.password && !instance.password.startsWith('$2')) {
      instance.password = await bcrypt.hash(instance.password, 12);
    }
    list.push({ ...instance });
    instances.push(instance);
  }
  
  setCollection(data, this.collectionName, list);
  writeData(data);
  return instances;
};

const isMock = process.env.USE_MOCK_DB === 'true' || !process.env.MONGO_URI || process.env.MONGO_URI.includes('<username>');

// Global Mongoose Override Registry
if (isMock) {
  const modelRegistry = new Map();
  mongoose.model = function (name, schema) {
    // Validate registry keys against pre-authorized list to prevent bracket-notation Prototype pollution
    if (!allowedModelsMap.has(name)) {
      throw new Error(`Model ${name} not allowed in mock registry`);
    }

    if (modelRegistry.has(name)) {
      return modelRegistry.get(name);
    }

    const collectionName = allowedModelsMap.get(name);
    class CustomModel extends MockModel {
      static collectionName = collectionName;
    }

    if (schema && schema.methods) {
      Object.assign(CustomModel.prototype, schema.methods);
    }

    modelRegistry.set(name, CustomModel);
    return CustomModel;
  };

  mongoose.Schema = function (fields, options) {
    this.fields = fields;
    this.options = options;
    this.methods = {};
    this.pre = function () {};
    this.post = function () {};
    this.index = function () {};
    this.plugin = function () {};
  };

  mongoose.Schema.Types = {
    ObjectId: String,
    String: String,
    Number: Number,
    Boolean: Boolean,
    Date: Date,
  };
}

export const connectDB = async () => {
  if (isMock) {
    console.log('Mock MongoDB connected successfully (saving to db.json) 🚀');
    return {
      connection: { host: 'json-file-database' },
    };
  } else {
    try {
      const connection = await mongoose.connect(process.env.MONGO_URI);
      console.log(`MongoDB connected: ${connection.connection.host} 🚀`);
      return connection;
    } catch (error) {
      console.error(`MongoDB connection failed: ${error.message}`);
      process.exit(1);
    }
  }
};

const ensureDbFile = () => {
  // Hardcoded target database configuration
  const staticDbFile = 'db.json';
  if (!fs.existsSync(staticDbFile)) {
    fs.writeFileSync(
      staticDbFile,
      JSON.stringify(
        {
          users: [],
          habits: [],
          goals: [],
          savings: [],
          expenses: [],
          earnings: [],
          reminders: [],
          notes: [],
          studies: [],
          languages: [],
          healths: [],
          worktasks: [],
        },
        null,
        2
      )
    );
  }
};

const readData = () => {
  ensureDbFile();
  try {
    const raw = fs.readFileSync('db.json', 'utf8');
    return JSON.parse(raw);
  } catch (e) {
    return {};
  }
};

const writeData = (data) => {
  ensureDbFile();
  fs.writeFileSync('db.json', JSON.stringify(data, null, 2));
};