
import { GoogleGenAI, Type } from "@google/genai";

// --- CONSTANTS ---
const QuestionType = {
  SHORT_ANSWER: 'Short Answer',
  LONG_ANSWER: 'Long Answer',
  MCQ: 'Multiple Choice Question',
  FILL_IN_THE_BLANKS: 'Fill in the Blanks',
  ASSERTION_REASON: 'Assertion & Reason',
  GROUPED: 'Grouped Questions',
};

const ICONS = {
    PLUS: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4"><path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" /></svg>`,
    TRASH: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4"><path fill-rule="evenodd" d="M8.75 1A2.75 2.75 0 0 0 6 3.75v.443c-.795.077-1.58.22-2.365.468a.75.75 0 1 0 .53 1.405A12.032 12.032 0 0 1 6 6v1.168l-1.621.81a.75.75 0 0 0 .81 1.366l2.121-1.06v3.161a.75.75 0 0 0 1.5 0V7.93l2.121 1.06a.75.75 0 0 0 .81-1.366L14 7.168V6a12.032 12.032 0 0 1 1.835-1.335.75.75 0 0 0 .53-1.405A13.532 13.532 0 0 0 14 4.193v-.443A2.75 2.75 0 0 0 11.25 1h-2.5ZM10 4c.84 0 1.673.025 2.5.075V3.75c0-.966-.784-1.75-1.75-1.75h-1.5c-.966 0-1.75.784-1.75 1.75v.325C8.327 4.025 9.16 4 10 4ZM8.58 7.72a.75.75 0 0 0-1.5.06l.3 7.5a.75.75 0 1 0 1.5-.06l-.3-7.5Zm4.34.06a.75.75 0 1 0-1.5-.06l-.3 7.5a.75.75 0 1 0 1.5.06l.3-7.5Z" clip-rule="evenodd" /></svg>`,
    TRASH_LG: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5"><path fill-rule="evenodd" d="M8.75 1A2.75 2.75 0 0 0 6 3.75v.443c-.795.077-1.58.22-2.365.468a.75.75 0 1 0 .53 1.405A12.032 12.032 0 0 1 6 6v1.168l-1.621.81a.75.75 0 0 0 .81 1.366l2.121-1.06v3.161a.75.75 0 0 0 1.5 0V7.93l2.121 1.06a.75.75 0 0 0 .81-1.366L14 7.168V6a12.032 12.032 0 0 1 1.835-1.335.75.75 0 0 0 .53-1.405A13.532 13.532 0 0 0 14 4.193v-.443A2.75 2.75 0 0 0 11.25 1h-2.5ZM10 4c.84 0 1.673.025 2.5.075V3.75c0-.966-.784-1.75-1.75-1.75h-1.5c-.966 0-1.75.784-1.75 1.75v.325C8.327 4.025 9.16 4 10 4ZM8.58 7.72a.75.75 0 0 0-1.5.06l.3 7.5a.75.75 0 1 0 1.5-.06l-.3-7.5Zm4.34.06a.75.75 0 1 0-1.5-.06l-.3 7.5a.75.75 0 1 0 1.5.06l.3-7.5Z" clip-rule="evenodd" /></svg>`,
    LOADING: `<svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>`
};

const EXAM_TYPES = ["Unit Test 1", "Unit Test 2", "Unit Test 3", "Unit Test 4", "Semester 1 Exam", "Semester 2 Exam"];

// --- STATE ---
let state = {
  schoolName: "Playway English School",
  subject: "",
  className: "",
  examType: "Unit Test 1",
  date: new Date().toISOString().split('T')[0],
  totalMarks: 100,
  duration: "3 Hours",
  questions: [
    { id: crypto.randomUUID(), type: QuestionType.SHORT_ANSWER, text: '', marks: 5, subQuestions: [] }
  ],
  isAiGenerating: false,
  isPdfGenerating: false,
  view: 'form', // 'form' or 'preview'
};

// --- DOM ELEMENTS ---
const formView = document.getElementById('form-view');
const previewView = document.getElementById('preview-view');
const subjectInput = document.getElementById('subject');
const classNameInput = document.getElementById('className');
const examTypeSelect = document.getElementById('examType');
const dateInput = document.getElementById('date');
const totalMarksInput = document.getElementById('totalMarks');
const durationInput = document.getElementById('duration');
const questionsContainer = document.getElementById('questions-container');
const addQuestionBtn = document.getElementById('add-question-btn');
const aiGenerateBtn = document.getElementById('ai-generate-btn');
const aiGenerateBtnText = document.getElementById('ai-generate-btn-text');
const previewBtn = document.getElementById('preview-btn');
const backToEditorBtn = document.getElementById('back-to-editor-btn');
const generatePdfBtn = document.getElementById('generate-pdf-btn');
const generatePdfBtnText = document.getElementById('generate-pdf-btn-text');
const pdfPreviewContainer = document.getElementById('pdf-preview');


// --- RENDER FUNCTIONS ---
function render() {
    formView.classList.toggle('hidden', state.view !== 'form');
    previewView.classList.toggle('hidden', state.view !== 'preview');
    
    subjectInput.value = state.subject;
    classNameInput.value = state.className;
    examTypeSelect.value = state.examType;
    dateInput.value = state.date;
    totalMarksInput.value = state.totalMarks;
    durationInput.value = state.duration;

    if (state.view === 'form') {
        renderQuestionForms();
    }
    
    if (state.view === 'preview') {
        renderPreview();
    }

    aiGenerateBtn.disabled = state.isAiGenerating;
    aiGenerateBtnText.textContent = state.isAiGenerating ? 'Generating...' : 'Generate with AI';
    generatePdfBtn.disabled = state.isPdfGenerating;
    generatePdfBtnText.innerHTML = state.isPdfGenerating ? `${ICONS.LOADING} Generating...` : 'Generate PDF';
}

function renderQuestionForms() {
    questionsContainer.innerHTML = state.questions.map((q, qIndex) => `
        <div class="p-6 bg-slate-50 border border-slate-200 rounded-lg" data-question-id="${q.id}">
            <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4 gap-4">
                <div class="flex items-center gap-4">
                  <span class="text-lg font-bold text-slate-600">Q${qIndex + 1}.</span>
                  <select data-action="update-q-type" class="p-2 border border-slate-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition">
                      ${Object.values(QuestionType).map(type => `<option value="${type}" ${q.type === type ? 'selected' : ''}>${type}</option>`).join('')}
                  </select>
                </div>
                <div class="flex items-center gap-2 self-end sm:self-auto">
                    <input type="number" value="${q.marks}" data-action="update-q-marks" class="w-20 p-2 border border-slate-300 rounded-md shadow-sm"/>
                    <span class="text-sm text-slate-500">${q.type === QuestionType.GROUPED ? 'Marks/item' : 'Marks'}</span>
                    <button data-action="remove-q" class="p-2 text-red-500 hover:bg-red-100 rounded-full transition">${ICONS.TRASH_LG}</button>
                </div>
            </div>
            ${renderQuestionBody(q)}
        </div>
    `).join('');
}

function renderQuestionBody(q) {
    if (q.type === QuestionType.GROUPED) return renderGroupedQuestionForm(q);
    
    let subQuestionsHTML = '';
    if (q.type !== QuestionType.ASSERTION_REASON) {
        subQuestionsHTML = `
            <div class="pl-8 mt-4 space-y-4">
              ${(q.subQuestions || []).map((sq, sqIndex) => `
                <div class="flex items-start gap-3" data-sub-question-id="${sq.id}">
                  <span class="text-md font-semibold text-slate-500 mt-2">${String.fromCharCode(97 + sqIndex)})</span>
                  <div class="flex-grow"><input type="text" value="${sq.text}" data-action="update-sq-text" placeholder="Enter sub-question..." class="w-full p-2 border border-slate-300 rounded-md shadow-sm" /></div>
                  <div class="flex items-center gap-2"><input type="number" value="${sq.marks}" data-action="update-sq-marks" class="w-20 p-2 border border-slate-300 rounded-md shadow-sm" /><span class="text-sm text-slate-500">Marks</span></div>
                  <button data-action="remove-sq" class="p-2 text-red-500 hover:bg-red-100 rounded-full transition">${ICONS.TRASH}</button>
                </div>
              `).join('')}
              <button data-action="add-sq" class="flex items-center gap-1 text-sm text-blue-600 font-semibold hover:text-blue-800 transition">${ICONS.PLUS} Add Sub-question</button>
            </div>
        `;
    }

    return `
        <div class="flex-grow space-y-4">
            ${renderQuestionInput(q)}
            <div class="mt-4"><label class="block text-sm font-medium text-slate-600 mb-1">Add Image/Diagram</label>
                ${q.image ? `
                    <div class="relative w-fit">
                        <img src="${q.image.url}" alt="Question diagram" class="max-w-xs max-h-48 rounded-md border border-slate-300 p-1" />
                        <button data-action="remove-q-image" class="absolute top-0 right-0 m-1 bg-red-500 text-white rounded-full p-1 leading-none hover:bg-red-600">${ICONS.TRASH}</button>
                    </div>` : `
                    <input type="file" accept="image/*" data-action="upload-q-image" class="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition" />`
                }
            </div>
        </div>
        ${subQuestionsHTML}
    `;
}

function renderQuestionInput(q) {
    if (q.type === QuestionType.ASSERTION_REASON) {
        return `
            <div class="space-y-2">
                <div><label class="block text-sm font-medium text-slate-600 mb-1">Assertion (A)</label><textarea data-action="update-q-assertion" placeholder="Enter assertion text..." class="w-full p-2 border border-slate-300 rounded-md shadow-sm" rows="2">${q.assertion || ''}</textarea></div>
                <div><label class="block text-sm font-medium text-slate-600 mb-1">Reason (R)</label><textarea data-action="update-q-reason" placeholder="Enter reason text..." class="w-full p-2 border border-slate-300 rounded-md shadow-sm" rows="2">${q.reason || ''}</textarea></div>
            </div>`;
    } else if (q.type === QuestionType.MCQ) {
        return `
            <div>
                <label class="block text-sm font-medium text-slate-600 mb-1">Question Stem</label>
                <textarea data-action="update-q-text" placeholder="Enter question stem..." class="w-full p-2 border border-slate-300 rounded-md shadow-sm" rows="3">${q.text}</textarea>
                <div class="mt-4 space-y-2"><label class="block text-sm font-medium text-slate-600">Options</label>
                    ${(q.options || []).map((opt, optIndex) => `
                        <div class="flex items-center gap-2" data-option-id="${opt.id}">
                            <span>${String.fromCharCode(65 + optIndex)}.</span>
                            <input type="text" value="${opt.text}" data-action="update-option-text" class="w-full p-2 border border-slate-300 rounded-md shadow-sm" placeholder="Option ${optIndex + 1}" />
                            <button data-action="remove-option" class="p-2 text-red-500 hover:bg-red-100 rounded-full transition">${ICONS.TRASH}</button>
                        </div>
                    `).join('')}
                    <button data-action="add-option" class="flex items-center gap-1 text-sm text-blue-600 font-semibold hover:text-blue-800 transition">${ICONS.PLUS} Add Option</button>
                </div>
            </div>`;
    }
    return `<textarea data-action="update-q-text" placeholder="${q.type === QuestionType.FILL_IN_THE_BLANKS ? "Use '___' for blanks." : "Enter question text..."}" class="w-full p-2 border border-slate-300 rounded-md shadow-sm" rows="3">${q.text}</textarea>`;
}

function renderGroupedQuestionForm(q) {
    return `
        <div class="space-y-4">
            <div><label class="block text-sm font-medium text-slate-600 mb-1">Group Title</label><textarea data-action="update-q-text" placeholder="e.g., Tick the correct option" class="w-full p-2 border border-slate-300 rounded-md shadow-sm" rows="2">${q.text}</textarea></div>
            <div><label class="block text-sm font-medium text-slate-600 mb-1">Item Type</label>
                <select data-action="update-group-type" class="p-2 border border-slate-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition">
                    <option value="${QuestionType.MCQ}" ${q.groupType === QuestionType.MCQ ? 'selected' : ''}>Multiple Choice</option>
                    <option value="${QuestionType.FILL_IN_THE_BLANKS}" ${q.groupType === QuestionType.FILL_IN_THE_BLANKS ? 'selected' : ''}>Fill in the Blanks</option>
                </select>
            </div>
            <div class="space-y-4 pl-4 border-l-2 border-slate-300">
                ${(q.items || []).map((item, itemIndex) => `
                    <div class="p-4 bg-white rounded-md border border-slate-300" data-item-id="${item.id}">
                        <div class="flex justify-between items-start mb-2"><span class="font-semibold text-slate-600">${String.fromCharCode(97 + itemIndex)})</span><button data-action="remove-item" class="p-1 text-red-500 hover:bg-red-100 rounded-full transition">${ICONS.TRASH}</button></div>
                        ${q.groupType === QuestionType.MCQ ? `
                            <div><textarea data-action="update-item-text" placeholder="Enter question stem..." class="w-full p-2 border border-slate-300 rounded-md shadow-sm" rows="2">${item.text}</textarea>
                                <div class="mt-2 space-y-2">
                                    ${(item.options || []).map((opt, optIndex) => `
                                        <div class="flex items-center gap-2 pl-4" data-option-id="${opt.id}"><span>${String.fromCharCode(65 + optIndex)}.</span><input type="text" data-action="update-item-option-text" value="${opt.text}" class="w-full p-2 border border-slate-300 rounded-md shadow-sm" placeholder="Option ${optIndex + 1}" /><button data-action="remove-item-option" class="p-2 text-red-500 hover:bg-red-100 rounded-full transition">${ICONS.TRASH}</button></div>`).join('')}
                                    <button data-action="add-item-option" class="flex items-center gap-1 text-sm text-blue-600 font-semibold hover:text-blue-800 transition ml-4">${ICONS.PLUS} Add Option</button>
                                </div>
                            </div>` : `
                            <textarea data-action="update-item-text" placeholder="Enter text, use '___' for blanks" class="w-full p-2 border border-slate-300 rounded-md shadow-sm" rows="2">${item.text}</textarea>`
                        }
                        <div class="mt-3"><label class="block text-xs font-medium text-slate-500 mb-1">Add Image to this item</label>
                            ${item.image ? `
                                <div class="relative w-fit"><img src="${item.image.url}" alt="Item diagram" class="max-w-xs max-h-32 rounded-md border border-slate-300 p-1" /><button data-action="remove-item-image" class="absolute top-0 right-0 m-1 bg-red-500 text-white rounded-full p-1 leading-none hover:bg-red-600">${ICONS.TRASH}</button></div>` : `
                                <input type="file" accept="image/*" data-action="upload-item-image" class="block w-full text-sm text-slate-500 file:mr-4 file:py-1 file:px-2 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition" />`
                            }
                        </div>
                    </div>
                `).join('')}
                <button data-action="add-item" class="flex items-center gap-1 text-sm text-blue-600 font-semibold hover:text-blue-800 transition">${ICONS.PLUS} Add Item</button>
            </div>
        </div>`;
}

function renderPreview() {
    pdfPreviewContainer.innerHTML = `
        <header class="text-center mb-6">
            <div class="flex justify-center items-center gap-4">
                <img src="./logo.png" alt="School Logo" style="height: 80px; width: auto;" />
                <div>
                    <h1 class="text-4xl font-bold font-merriweather">${state.schoolName}</h1>
                    <p class="text-lg">Fatehpur</p>
                </div>
            </div>
            <div class="mt-4 border-y-2 border-black py-2">
                <h2 class="text-2xl font-bold font-merriweather">${state.examType}</h2>
            </div>
        </header>
        <div class="flex justify-between items-center text-base font-bold my-4">
            <span>Class: ${state.className || 'N/A'}</span>
            <span>Subject: ${state.subject || 'N/A'}</span>
            <span>Max. Marks: ${state.totalMarks}</span>
        </div>
        <div class="flex justify-between items-center text-base font-bold mb-6">
            <span>Date: ${state.date ? new Date(state.date).toLocaleDateString('en-GB') : 'N/A'}</span>
            <span>Duration: ${state.duration || 'N/A'}</span>
        </div>
        <div class="border-t-2 border-black pt-4">
            <h3 class="text-lg font-bold font-merriweather text-center mb-4">General Instructions:</h3>
            <ol class="list-decimal list-inside text-sm space-y-1 px-4">
                <li>All questions are compulsory.</li>
                <li>The marks for each question are indicated against it.</li>
                <li>Read each question carefully before answering.</li>
                <li>Write legibly.</li>
            </ol>
        </div>
        <main class="mt-8 text-lg">
            ${state.questions.map((q, qIndex) => renderPreviewQuestion(q, qIndex)).join('')}
        </main>
        <footer class="text-center mt-12 pt-4 border-t-2 border-dashed border-gray-400">
            <p class="text-lg font-bold italic font-merriweather">*** ALL THE BEST ***</p>
        </footer>
    `;
    addDragAndResizeListeners();
}

function renderPreviewQuestion(q, qIndex) {
    if (q.type === QuestionType.GROUPED) {
        const totalGroupMarks = (q.items?.length || 0) * q.marks;
        return `
            <div class="mb-6" data-question-id="${q.id}">
                <div class="flex justify-between items-start">
                    <div class="flex-grow font-bold font-merriweather pr-4"><span class="mr-2">Q${qIndex + 1}.</span>${q.text}</div>
                    <p class="font-bold ml-4 whitespace-nowrap">[${q.items?.length || 0}x${q.marks}=${totalGroupMarks}]</p>
                </div>
                <div class="ml-8 mt-2 space-y-4">
                    ${(q.items || []).map((item, itemIndex) => `
                        <div data-item-id="${item.id}">
                            <p class="font-semibold"><span class="mr-2">${String.fromCharCode(97 + itemIndex)})</span>${item.text}</p>
                            ${item.image ? renderDraggableImage(item.image, q.id, item.id, '250px') : ''}
                            ${q.groupType === QuestionType.MCQ && item.options?.length > 0 ? `
                                <div class="grid grid-cols-2 gap-x-8 gap-y-1 ml-10 mt-2 text-base">
                                    ${item.options.map((opt, optIndex) => `<p>(${String.fromCharCode(97 + optIndex)}) ${opt.text}</p>`).join('')}
                                </div>` : ''
                            }
                        </div>`).join('')}
                </div>
            </div>`;
    }

    return `
        <div class="mb-6" data-question-id="${q.id}">
            <div class="flex justify-between items-start">
                <div class="flex-grow font-bold font-merriweather pr-4"><span class="mr-2">Q${qIndex + 1}.</span>
                    ${ q.type === QuestionType.MCQ || q.type === QuestionType.ASSERTION_REASON ? '' : q.text }
                    ${ q.type === QuestionType.MCQ ? q.text : '' }
                    ${ q.type === QuestionType.ASSERTION_REASON ? `For the following question, two statements are given- one labelled Assertion (A) and the other labelled Reason (R). Select the correct answer to this question from the codes (a), (b), (c) and (d) as given below.` : '' }
                </div>
                <p class="font-bold ml-4 whitespace-nowrap">[${q.marks}]</p>
            </div>
            ${q.image ? renderDraggableImage(q.image, q.id, undefined) : ''}
            ${q.type === QuestionType.ASSERTION_REASON ? `
                <div class="mt-2 ml-8 space-y-1">
                    <p><strong>Assertion (A):</strong> ${q.assertion || ''}</p>
                    <p><strong>Reason (R):</strong> ${q.reason || ''}</p>
                    <div class="ml-4 mt-2 space-y-1 text-base pt-2">
                        <p>(a) Both A and R are true and R is the correct explanation of A.</p>
                        <p>(b) Both A and R are true but R is not the correct explanation of A.</p>
                        <p>(c) A is true but R is false.</p>
                        <p>(d) A is false but R is true.</p>
                    </div>
                </div>` : ''
            }
            ${q.type === QuestionType.MCQ && q.options?.length > 0 ? `
                <div class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1 ml-12 mt-2 text-base">
                    ${q.options.map((opt, optIndex) => `<p>(${String.fromCharCode(97 + optIndex)}) ${opt.text}</p>`).join('')}
                </div>` : ''
            }
            ${q.subQuestions?.length > 0 ? `
                <div class="ml-8 mt-2 space-y-3">
                    ${q.subQuestions.map((sq, sqIndex) => `
                        <div class="flex justify-between items-start"><p class="flex-grow pr-4"><span class="mr-2 font-semibold">${String.fromCharCode(97 + sqIndex)})</span>${sq.text}</p><p class="font-semibold ml-4">[${sq.marks}]</p></div>`).join('')}
                </div>` : ''
            }
        </div>`;
}

function renderDraggableImage(image, questionId, itemId, maxHeight = '300px') {
    return `
        <div class="my-3 container-for-image" data-question-id="${questionId}" data-item-id="${itemId || ''}">
            <div class="relative image-wrapper group select-none cursor-move" 
                 style="width: ${image.width}%; transform: translate(${image.x || 0}px, ${image.y || 0}px); z-index: 10;">
                <img src="${image.url}" alt="Diagram" class="pointer-events-none w-full object-contain" style="max-height: ${maxHeight};" />
                <div class="resize-handle" data-action="resize-image"></div>
            </div>
        </div>`;
}

// --- STATE MANIPULATION & HELPERS ---
function updateState(newState) {
    state = { ...state, ...newState };
    render();
}

function findQuestion(id) { return state.questions.find(q => q.id === id); }
function updateQuestion(qId, field, value) {
    const questions = state.questions.map(q => {
        if (q.id === qId) {
            const updatedQuestion = { ...q, [field]: value };
            if (field === 'type') {
                delete updatedQuestion.options; delete updatedQuestion.assertion; delete updatedQuestion.reason;
                delete updatedQuestion.items; delete updatedQuestion.groupType; delete updatedQuestion.image;
                if (value === QuestionType.MCQ) updatedQuestion.options = [{ id: crypto.randomUUID(), text: '' }];
                else if (value === QuestionType.ASSERTION_REASON) { updatedQuestion.assertion = ''; updatedQuestion.reason = ''; } 
                else if (value === QuestionType.GROUPED) { updatedQuestion.groupType = QuestionType.MCQ; updatedQuestion.items = [{ id: crypto.randomUUID(), text: '', options: [{id: crypto.randomUUID(), text: ''}] }]; updatedQuestion.marks = 1; }
            }
            return updatedQuestion;
        }
        return q;
    });
    updateState({ questions });
}

// --- EVENT HANDLERS ---
function handleFormChange(e) {
    const { id, value, type } = e.target;
    if (id in state) {
        updateState({ [id]: type === 'number' ? Number(value) : value });
    }
}

function handleQuestionFormInput(e) {
    const target = e.target;
    const action = target.dataset.action;
    if (!action) return;
    
    const qEl = target.closest('[data-question-id]');
    if (!qEl) return;
    const qId = qEl.dataset.questionId;
    
    const value = target.type === 'number' ? Number(target.value) : target.value;
    
    if (action.startsWith('update-q-')) updateQuestion(qId, action.replace('update-q-', ''), value);

    const questions = JSON.parse(JSON.stringify(state.questions));
    const q = questions.find(q => q.id === qId);

    if (action === 'update-group-type') {
        q.groupType = value;
        q.items = q.items?.map(item => ({ ...item, options: value === QuestionType.MCQ ? (item.options || [{id: crypto.randomUUID(), text: ''}]) : undefined }));
    }
    
    if (target.closest('[data-sub-question-id]')) {
        const sqId = target.closest('[data-sub-question-id]').dataset.subQuestionId;
        const sq = q.subQuestions.find(s => s.id === sqId);
        if (action === 'update-sq-text') sq.text = value;
        if (action === 'update-sq-marks') sq.marks = value;
    }
    if (target.closest('[data-option-id]') && !target.closest('[data-item-id]')) {
        const optId = target.closest('[data-option-id]').dataset.optionId;
        if (action === 'update-option-text') q.options.find(o => o.id === optId).text = value;
    }
    if (target.closest('[data-item-id]')) {
        const itemId = target.closest('[data-item-id]').dataset.itemId;
        const item = q.items.find(i => i.id === itemId);
        if (action === 'update-item-text') item.text = value;
        if (target.closest('[data-option-id]')) {
            const optId = target.closest('[data-option-id]').dataset.optionId;
            if (action === 'update-item-option-text') item.options.find(o => o.id === optId).text = value;
        }
    }
    if (action.includes('image') && target.files.length) {
        const file = target.files[0];
        const reader = new FileReader();
        reader.onloadend = () => {
            const imageObject = { url: reader.result, width: 70, x: 0, y: 0 };
            const qToUpdate = state.questions.find(q => q.id === qId);
            if (action === 'upload-item-image') {
                const itemId = target.closest('[data-item-id]').dataset.itemId;
                qToUpdate.items.find(i => i.id === itemId).image = imageObject;
            } else {
                qToUpdate.image = imageObject;
            }
            updateState({ questions: state.questions });
        };
        reader.readAsDataURL(file);
        return; // Avoid double render
    }
    updateState({ questions });
}

function handleQuestionFormClicks(e) {
    const target = e.target.closest('[data-action]');
    if (!target) return;
    
    const action = target.dataset.action;
    const qEl = target.closest('[data-question-id]');
    if (!qEl) return;
    const qId = qEl.dataset.questionId;
    
    const questions = JSON.parse(JSON.stringify(state.questions));
    const q = questions.find(q => q.id === qId);

    if (action === 'remove-q') { updateState({ questions: state.questions.filter(qu => qu.id !== qId) }); return; }
    if (action === 'remove-q-image') q.image = undefined;
    if (action === 'add-option') q.options.push({ id: crypto.randomUUID(), text: '' });
    if (action === 'remove-option') q.options = q.options.filter(o => o.id !== target.closest('[data-option-id]').dataset.optionId);
    if (action === 'add-sq') q.subQuestions.push({ id: crypto.randomUUID(), text: '', marks: 1 });
    if (action === 'remove-sq') q.subQuestions = q.subQuestions.filter(s => s.id !== target.closest('[data-sub-question-id]').dataset.subQuestionId);
    if (action === 'add-item') {
        const newItem = { id: crypto.randomUUID(), text: '' };
        if (q.groupType === QuestionType.MCQ) newItem.options = [{ id: crypto.randomUUID(), text: '' }];
        q.items.push(newItem);
    }
    if (target.closest('[data-item-id]')) {
        const itemId = target.closest('[data-item-id]').dataset.itemId;
        const item = q.items.find(i => i.id === itemId);
        if (action === 'remove-item') q.items = q.items.filter(i => i.id !== itemId);
        if (action === 'remove-item-image') item.image = undefined;
        if (action === 'add-item-option') item.options.push({ id: crypto.randomUUID(), text: '' });
        if (action === 'remove-item-option') item.options = item.options.filter(o => o.id !== target.closest('[data-option-id]').dataset.optionId);
    }
    updateState({ questions });
}

// --- DRAG & RESIZE IMAGE LOGIC ---
function addDragAndResizeListeners() {
    pdfPreviewContainer.querySelectorAll('.image-wrapper').forEach(wrapper => {
        wrapper.addEventListener('mousedown', handleDragMouseDown);
    });
}

function handleDragMouseDown(e) {
    if (e.target.classList.contains('resize-handle')) {
        handleResizeMouseDown(e); return;
    }
    e.preventDefault(); e.stopPropagation();

    const wrapper = e.currentTarget;
    const container = wrapper.closest('.container-for-image');
    const { questionId, itemId } = container.dataset;
    const q = findQuestion(questionId);
    const imageObj = itemId ? findQuestion(questionId).items.find(i => i.id === itemId).image : q.image;

    const startX = e.clientX; const startY = e.clientY;
    const initialX = imageObj.x || 0; const initialY = imageObj.y || 0;
    
    const handleMouseMove = (moveEvent) => {
        imageObj.x = initialX + (moveEvent.clientX - startX);
        imageObj.y = initialY + (moveEvent.clientY - startY);
        wrapper.style.transform = `translate(${imageObj.x}px, ${imageObj.y}px)`;
    };
    const handleMouseUp = () => { window.removeEventListener('mousemove', handleMouseMove); window.removeEventListener('mouseup', handleMouseUp); };
    window.addEventListener('mousemove', handleMouseMove); window.addEventListener('mouseup', handleMouseUp);
}

function handleResizeMouseDown(e) {
    e.preventDefault(); e.stopPropagation();
    
    const wrapper = e.target.closest('.image-wrapper');
    const container = wrapper.closest('.container-for-image');
    if (!wrapper || !container) return;

    const { questionId, itemId } = container.dataset;
    const q = findQuestion(questionId);
    const imageObj = itemId ? findQuestion(questionId).items.find(i => i.id === itemId).image : q.image;

    const startX = e.clientX; const startWidth = wrapper.offsetWidth; const parentWidth = wrapper.parentElement.offsetWidth;

    const handleMouseMove = (moveEvent) => {
        const newWidthPx = startWidth + (moveEvent.clientX - startX);
        const newWidthPercent = Math.max(20, Math.min(100, (newWidthPx / parentWidth) * 100));
        imageObj.width = newWidthPercent;
        wrapper.style.width = `${newWidthPercent}%`;
    };
    const handleMouseUp = () => { window.removeEventListener('mousemove', handleMouseMove); window.removeEventListener('mouseup', handleMouseUp); };
    window.addEventListener('mousemove', handleMouseMove); window.addEventListener('mouseup', handleMouseUp);
}


// --- AI & PDF GENERATION ---
async function handleAiGenerate() {
    if (!state.subject || !state.className) {
        alert("Please provide a Subject and Class before generating questions."); return;
    }
    if (!window.confirm("This will replace all current questions with AI-generated ones. Are you sure?")) return;

    updateState({ isAiGenerating: true });
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const optionSchema = { type: Type.OBJECT, properties: { text: { type: Type.STRING } } };
        const groupedItemSchema = { type: Type.OBJECT, properties: { text: { type: Type.STRING }, options: { type: Type.ARRAY, items: optionSchema }}, required: ["text"] };
        const subQuestionSchema = { type: Type.OBJECT, properties: { text: { type: Type.STRING }, marks: { type: Type.NUMBER }}, required: ["text", "marks"] };
        const questionSchema = {
            type: Type.OBJECT,
            properties: {
                type: { type: Type.STRING, enum: Object.values(QuestionType) },
                text: { type: Type.STRING }, marks: { type: Type.NUMBER },
                options: { type: Type.ARRAY, items: optionSchema },
                assertion: { type: Type.STRING }, reason: { type: Type.STRING },
                groupType: { type: Type.STRING, enum: [QuestionType.MCQ, QuestionType.FILL_IN_THE_BLANKS] },
                items: { type: Type.ARRAY, items: groupedItemSchema },
                subQuestions: { type: Type.ARRAY, items: subQuestionSchema }
            },
            required: ["type", "text", "marks"]
        };
        const prompt = `You are an expert question paper setter for an Indian school. Generate a set of questions for the following exam:
        - Subject: ${state.subject}
        - Class: ${state.className}
        - Examination: ${state.examType}
        - Total Marks: Approximately ${state.totalMarks}
        Please create a balanced paper with a mix of question types like Short Answer, Long Answer, Multiple Choice, and Grouped Questions. The response must be a valid JSON array of question objects that strictly follows the provided JSON schema. Ensure the content is appropriate for the specified class level.`;
        
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash", contents: prompt,
            config: { responseMimeType: "application/json", responseSchema: { type: Type.ARRAY, items: questionSchema } },
        });

        const generatedQuestions = JSON.parse(response.text);
        const questionsWithIds = generatedQuestions.map((q) => ({
            ...q, id: crypto.randomUUID(),
            options: q.options?.map((opt) => ({ ...opt, id: crypto.randomUUID() })),
            subQuestions: q.subQuestions?.map((sq) => ({ ...sq, id: crypto.randomUUID() })),
            items: q.items?.map((item) => ({...item, id: crypto.randomUUID(), options: item.options?.map((opt) => ({ ...opt, id: crypto.randomUUID() })) }))
        }));
        updateState({ questions: questionsWithIds });
    } catch (error) {
        console.error("AI Generation Error:", error);
        alert("Failed to generate questions. Please check the console for details.");
    } finally {
        updateState({ isAiGenerating: false });
    }
}

function handleGeneratePdf() {
    updateState({ isPdfGenerating: true });
    const input = document.getElementById('pdf-preview');
    if (!input) { updateState({ isPdfGenerating: false }); return; }

    const interactiveElements = input.querySelectorAll('.resize-handle, .image-wrapper');
    interactiveElements.forEach(el => el.style.cursor = 'default');
    input.querySelectorAll('.resize-handle').forEach(el => el.style.opacity = '0');

    html2canvas(input, { scale: 2.5, useCORS: true, logging: false })
        .then(canvas => {
            const imgData = canvas.toDataURL('image/png');
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
            const imgProps = pdf.getImageProperties(imgData);
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
            let heightLeft = pdfHeight; let position = 0;
            pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
            heightLeft -= pdf.internal.pageSize.getHeight();
            while (heightLeft >= 0) {
                position = heightLeft - pdfHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
                heightLeft -= pdf.internal.pageSize.getHeight();
            }
            pdf.save(`${state.subject.replace(/ /g, '_') || 'Question'}_Paper.pdf`);
            updateState({ isPdfGenerating: false });
        })
        .catch(err => {
            console.error("Error generating PDF", err);
            updateState({ isPdfGenerating: false });
        })
        .finally(() => {
            interactiveElements.forEach(el => el.style.cursor = '');
        });
}


// --- INITIALIZATION ---
function init() {
    examTypeSelect.innerHTML = EXAM_TYPES.map(type => `<option value="${type}">${type}</option>`).join('');

    [subjectInput, classNameInput, examTypeSelect, dateInput, totalMarksInput, durationInput].forEach(el => {
        el.addEventListener('input', handleFormChange);
    });

    questionsContainer.addEventListener('input', handleQuestionFormInput);
    questionsContainer.addEventListener('change', handleQuestionFormInput);
    questionsContainer.addEventListener('click', handleQuestionFormClicks);
    
    addQuestionBtn.addEventListener('click', () => {
        const questions = [...state.questions, { id: crypto.randomUUID(), type: QuestionType.SHORT_ANSWER, text: '', marks: 5, subQuestions: [] }];
        updateState({ questions });
    });
    
    aiGenerateBtn.addEventListener('click', handleAiGenerate);
    generatePdfBtn.addEventListener('click', handleGeneratePdf);
    previewBtn.addEventListener('click', () => updateState({ view: 'preview' }));
    backToEditorBtn.addEventListener('click', () => updateState({ view: 'form' }));

    render();
}

init();
