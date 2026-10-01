let notes = [
  { id: 1, text: "Buy milk and bread", category: "personal" },
  { id: 2, text: "Finish the Day 3 assignment", category: "study" },
  { id: 3, text: "Email the project report to Grace", category: "work" },
  { id: 4, text: "Revise JavaScript arrays", category: "study" },
  { id: 5, text: "Call mum", category: "personal" },
];

function searchNotes(word) {
  return notes.filter((note) =>
    note.text.toLowerCase().includes(word.toLowerCase()),
  );
}

function longestNote() {
  if (notes.length === 0) return null;
  return notes.reduce((longest, current) =>
    current.text.length > longest.text.length ? current : longest,
  );
}

function countByCategory() {
  const counts = {};
  notes.forEach((note) => {
    counts[note.category] = (counts[note.category] || 0) + 1;
  });
  return counts;
}

function getSummary() {
  const counts = countByCategory();
  const total = notes.length;
  const noteWord = total === 1 ? "note" : "notes";
  const parts = Object.entries(counts).map(
    ([category, count]) => `${count} ${category}`,
  );
  return `${total} ${noteWord}: ${parts.join(", ")}.`;
}

function isDuplicate(text) {
  const normalized = text.trim().toLowerCase();
  return notes.some((note) => note.text.trim().toLowerCase() === normalized);
}

function addNote(text, category) {
  const validCategories = ["personal", "work", "study"];

  if (text.length < 1 || text.length > 200) {
    console.log("Rejected: text must be 1-200 characters.");
    return false;
  }

  if (isDuplicate(text)) {
    console.log("Rejected: duplicate note.");
    return false;
  }

  if (!validCategories.includes(category)) {
    console.log("Rejected: invalid category.");
    return false;
  }

  notes.push({ id: notes.length + 1, text, category });
  console.log("Added successfully.");
  return true;
}

// searchNotes
console.log(searchNotes("milk")); // expect: [{ id: 1, text: "Buy milk and bread", category: "personal" }]
console.log(searchNotes("xyz")); // expect: [] (no matches)

// longestNote
console.log(longestNote()); // expect: { id: 3, text: "Email the project report to Grace", category: "work" }
const realNotes = notes;
notes = [];
console.log(longestNote()); // expect: null (empty array edge case)
notes = realNotes;

// countByCategory
console.log(countByCategory()); // expect: { personal: 2, study: 2, work: 1 }

// getSummary
console.log(getSummary()); // expect: "5 notes: 2 personal, 2 study, 1 work."

// isDuplicate
console.log(isDuplicate("buy milk and bread")); // expect: true (case/spacing insensitive match)
console.log(isDuplicate("Go to the gym")); // expect: false

// addNote
console.log(addNote("Go to the gym", "personal")); // expect: true, logs "Added successfully."
console.log(addNote("Buy milk and bread", "personal")); // expect: false, logs "Rejected: duplicate note."
