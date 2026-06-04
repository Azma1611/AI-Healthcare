const toId = (item) => ({
  ...item.toObject(),
  id: item._id.toString(),
});

export const normalizeList = (items) => items.map(toId);
export const normalizeItem = (item) => (item ? toId(item) : null);
