import './style.css';
import { elementMethods } from './baseline.js';
import { renderAddForm, renderWordList } from './renderers.js';
import { WordList } from './wordlist.js';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const { first } = elementMethods();
const root = first("#root");
const exportBtn = first("#export-pdf");
const gridContainer = first("#grid-container");
const placementModal = first("#placement-modal");

root.innerHTML = `
  <div id="app">
    <div class="words"></div>
    <div class="add-form"></div>
  </div>
`;

const app = root.first("#app");

// gridBtn
const gridBtn = document.createElement('button');
gridBtn.id = 'grid-btn';
gridBtn.textContent = 'Grid';
gridBtn.style.margin = '10px';
app.appendChild(gridBtn);

const generateGrid = () => {
  const grid = first("#grid");
  const realGrid = grid.el;
  if (realGrid.rows.length > 0) return;

  for (let i = 0; i < 10; i++) {
    const row = realGrid.insertRow();
    for (let j = 0; j < 10; j++) {
      const cell = row.insertCell();
      cell.classList.add('cell');
      cell.contentEditable = false;
      cell.textContent = '';
    }
  }
};

const gridTable = first("#grid");
gridTable.on('click', () => {
  openPlacementModal();
});

const openPlacementModal = () => {
  // Модифицируем контент модалки для 2 инпутов
  placementModal.el.innerHTML = `
    <div class="modal-content">
      <h1>Заполнить сетку</h1>
      <label>Горизонтальное слово:</label>
      <input type="text" id="horizontal-input" placeholder="Введите горизонтальное слово" maxlength="10">
      <label>Вертикальное слово:</label>
      <input type="text" id="vertical-input" placeholder="Введите вертикальное слово" maxlength="10">
      <button id="save-words">Сохранить</button>
      <button id="cancel-place">Отмена</button>
    </div>
  `;
  placementModal.el.style.display = 'block';

  // Обработчик "Сохранить" (динамически, после innerHTML)
  const saveBtn = placementModal.el.querySelector('#save-words');
  saveBtn.addEventListener('click', () => {
    const horizontalWord = placementModal.el.querySelector('#horizontal-input').value.trim().toUpperCase();
    const verticalWord = placementModal.el.querySelector('#vertical-input').value.trim().toUpperCase();

    if (!horizontalWord || !verticalWord) {
      alert('Введите оба слова!');
      return;
    }
    if (horizontalWord.length > 10 || verticalWord.length > 10) {
      alert('Слова не длиннее 10 букв!');
      return;
    }

    // Простая проверка пересечения: первая буква вертикального должна совпадать с буквой в позиции пересечения горизонтального
    // Размещаем горизонт в row 0, col 0; вертик в row 0, col 0 (пересечение в (0,0))
    if (horizontalWord[0] !== verticalWord[0]) {
      alert('Буквы в точке пересечения не совпадают! (Первая буква обоих слов должна быть одинаковой)');
      return;
    }

    fillGrid(horizontalWord, verticalWord);
    placementModal.el.style.display = 'none';
  });

  // Обработчик "Отмена"
  const cancelBtn = placementModal.el.querySelector('#cancel-place');
  cancelBtn.addEventListener('click', () => {
    placementModal.el.style.display = 'none';
  });
};

// Функция заполнения grid
const fillGrid = (horizontalWord, verticalWord) => {
  const grid = first("#grid").el;
  clearGrid();  // Очистка перед заполнением

  // Размещение горизонтального слова в row 0, начиная с col 0
  for (let j = 0; j < horizontalWord.length; j++) {
    grid.rows[0].cells[j].textContent = horizontalWord[j];
  }

  // Размещение вертикального слова в col 0, начиная с row 0
  for (let i = 0; i < verticalWord.length; i++) {
    grid.rows[i].cells[0].textContent = verticalWord[i];
  }
};

const clearGrid = () => {
  const grid = first("#grid").el;
  for (let i = 0; i < 10; i++) {
    for (let j = 0; j < 10; j++) {
      grid.rows[i].cells[j].textContent = '';
    }
  }
};

gridBtn.addEventListener('click', () => {
  if (gridContainer.el.style.display === 'none' || gridContainer.el.style.display === '') {
    generateGrid();
    gridContainer.el.style.display = 'block';
    gridBtn.textContent = 'Скрыть Grid';
  } else {
    gridContainer.el.style.display = 'none';
    gridBtn.textContent = 'Grid';
  }
});

exportBtn.on('click', () => {
  
});

const wl = new WordList();

const onChangeWordList = () => {
  app.first('.words').innerHTML = renderWordList(wl);
  const wlEl = app.first(".word-list");
  if (wlEl) {
    wlEl.on('click', (e) => {
      const target = e.target;
      if (target.classList.contains('remove')) {
        const row = target.closest('tr');
        const word = row.querySelector(".word");
        if (word) {
          wl.removeWord(word.innerText.trim());
        }
      }
    });
  }
};

wl.onChange = onChangeWordList;

wl.addWord("повар", "такая профессия");
wl.addWord("чай", "вкусный, делает меня человеком");
wl.addWord("яблоки", "с ананасами");
wl.addWord("сосисочки", "я — Никита Литвинков!");
onChangeWordList();

app.first('.add-form').innerHTML = renderAddForm();
const formEl = app.first('.add-form form');
if (formEl) {
  formEl.on('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(formEl.el);
    const word = formData.get('word')?.trim();
    const description = formData.get('description')?.trim();

    if (word && description) {
      try {
        wl.addWord(word, description);
        formEl.el.reset();
      } catch (e) {
        console.error('Ошибка добавления:', e);
      }
    }
  });
}