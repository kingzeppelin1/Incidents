// localStorage-based data store that replaces the Base44 SDK
// Provides the same API shape: base44.entities.EntityName.{list, filter, create, update, delete}

const STORE_PREFIX = 'incidents_app_';

function getStore(entityName) {
  const raw = localStorage.getItem(STORE_PREFIX + entityName);
  return raw ? JSON.parse(raw) : [];
}

function setStore(entityName, data) {
  localStorage.setItem(STORE_PREFIX + entityName, JSON.stringify(data));
}

let idCounter = parseInt(localStorage.getItem(STORE_PREFIX + '_id_counter') || '1000', 10);

function nextId() {
  idCounter++;
  localStorage.setItem(STORE_PREFIX + '_id_counter', String(idCounter));
  return idCounter;
}

function createEntityAPI(entityName) {
  return {
    list(sortField, limit) {
      let items = getStore(entityName);
      if (sortField) {
        const desc = sortField.startsWith('-');
        const field = desc ? sortField.slice(1) : sortField;
        items.sort((a, b) => {
          const va = a[field] || '';
          const vb = b[field] || '';
          return desc ? (vb > va ? 1 : vb < va ? -1 : 0) : (va > vb ? 1 : va < vb ? -1 : 0);
        });
      }
      if (limit) items = items.slice(0, limit);
      return Promise.resolve(items);
    },

    filter(criteria, sortField) {
      let items = getStore(entityName);
      items = items.filter(item => {
        return Object.entries(criteria).every(([key, value]) => {
          return String(item[key]) === String(value);
        });
      });
      if (sortField) {
        const desc = sortField.startsWith('-');
        const field = desc ? sortField.slice(1) : sortField;
        items.sort((a, b) => {
          const va = a[field] || '';
          const vb = b[field] || '';
          return desc ? (vb > va ? 1 : vb < va ? -1 : 0) : (va > vb ? 1 : va < vb ? -1 : 0);
        });
      }
      return Promise.resolve(items);
    },

    create(data) {
      const items = getStore(entityName);
      const now = new Date().toISOString();
      const newItem = {
        ...data,
        id: nextId(),
        created_date: now,
        updated_date: now,
      };
      items.push(newItem);
      setStore(entityName, items);
      return Promise.resolve(newItem);
    },

    update(id, data) {
      const items = getStore(entityName);
      const idx = items.findIndex(item => String(item.id) === String(id));
      if (idx === -1) return Promise.reject(new Error('Not found'));
      items[idx] = { ...items[idx], ...data, updated_date: new Date().toISOString() };
      setStore(entityName, items);
      return Promise.resolve(items[idx]);
    },

    delete(id) {
      let items = getStore(entityName);
      items = items.filter(item => String(item.id) !== String(id));
      setStore(entityName, items);
      return Promise.resolve();
    },
  };
}

export const base44 = {
  auth: {
    me: () => Promise.resolve({ name: 'Local User', email: 'user@local.app', role: 'admin' }),
    logout: () => {},
    redirectToLogin: () => {},
  },
  entities: {
    Incident: createEntityAPI('Incident'),
    CorrectiveAction: createEntityAPI('CorrectiveAction'),
    Consequence: createEntityAPI('Consequence'),
    RootCause: createEntityAPI('RootCause'),
    Connection: createEntityAPI('Connection'),
    MessageLog: createEntityAPI('MessageLog'),
    ChangelogEntry: createEntityAPI('ChangelogEntry'),
    Investigation: createEntityAPI('Investigation'),
  },
};
