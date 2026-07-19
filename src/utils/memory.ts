export const saveMemory = (
  memory: any
) => {

  localStorage.setItem(
    "adin-memory",
    JSON.stringify(memory)
  );

};

export const loadMemory = () => {

  const data =
    localStorage.getItem(
      "adin-memory"
    );

  return data
    ? JSON.parse(data)
    : [];

};

export const addMemory = (
  currentMemory: any,
  text: string
) => {

  const updated = [
    ...currentMemory,
    {
      id: Date.now(),
      text,
    },
  ];

  saveMemory(updated);

  return updated;

};

export const clearMemory = () => {

  localStorage.removeItem(
    "adin-memory"
  );

};