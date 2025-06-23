let rightclickcard = null;
function addTask(columnId) {
  const input = document.getElementById(`${columnId}-input`);
  const taskText = input.value.trim();
  if (taskText === "") {
    return;
  }
  const taskdiv = document.getElementById(`${columnId}-tasks`);
  const taskDate = new Date().toLocaleString();
  const taskELement = createTaskELement(taskText, taskDate);
  taskdiv.appendChild(taskELement);
  updateTaskCount(columnId);
  saveTaskFromlocalStorage(columnId, taskText, taskDate);
  input.value = "";
}
function createTaskELement(tasktext, taskdate) {
  const taskcard = document.createElement("div");
  taskcard.innerHTML = `<span>${tasktext}</span><br><small class="time">${taskdate}</small>`;
  taskcard.draggable = true;

  taskcard.classList.add("card");
  taskcard.addEventListener("dragstart", dragStart);
  taskcard.addEventListener("dragend", dragEnd);

  //right click
  taskcard.addEventListener("contextmenu", function (e) {
    e.preventDefault();
    // console.log(e.pageX, e.pageY);
    rightclickcard = this;
    showcontextmenu(e.pageX, e.pageY);
  });
  return taskcard;
}
const contextmenu = document.querySelector(".context-menu");

function showcontextmenu(x, y) {
  contextmenu.style.left = `${x}px`;
  contextmenu.style.top = `${y}px`;
  contextmenu.style.display = "block";
}
document.addEventListener("click", () => {
  contextmenu.style.display = "none";
});
function editTask() {
  if (rightclickcard !== null) {
    const taskSpan = rightclickcard.querySelector("span");
    const oldText = taskSpan.textContent;

    const newText = prompt("Edit Task -", oldText);

    if (newText && newText.trim() !== "") {
      taskSpan.textContent = newText.trim();
      updatelocalStorage();
    }
  }
  contextmenu.style.display = "none";
}

function deleteTask() {
  if (rightclickcard !== null) {
    const deleteTaskid = rightclickcard.parentElement.id.replace("-tasks", "");
    console.log("deletetaskid", deleteTaskid);
    rightclickcard.remove();
    updatelocalStorage();
    updateTaskCount(deleteTaskid);
  }
  contextmenu.style.display = "none";
}
function updateTaskCount(columnId) {
  const taskContainer = document.getElementById(`${columnId}-tasks`);
  const countSpan = document.getElementById(`${columnId}-count`);
  const taskCount = taskContainer.children.length;
  countSpan.textContent = taskCount;
}
function dragStart() {
  this.classList.add("dragging");
}
function dragEnd() {
  this.classList.remove("dragging");
  ["todo", "doing", "done"].forEach((columnId) => {
    updateTaskCount(columnId);
    updatelocalStorage();
  });
}
const column = document.querySelectorAll(".column .tasks");
column.forEach((item) => {
  item.addEventListener("dragover", dragOver);
  item.addEventListener("drop", drop);
});
function drop(event) {
  const card = document.querySelector(".dragging");
  event.currentTarget.appendChild(card);
}

function dragOver(event) {
  event.preventDefault();
  const draggedCard = document.querySelector(".dragging");
  const container = event.currentTarget;

  const afterElement = getDragAfterElement(container, event.clientY);
  //   console.log(" After Element:", afterElement?.textContent || "None");

  if (afterElement === null) {
    container.appendChild(draggedCard);
  } else {
    container.insertBefore(draggedCard, afterElement);
  }
}

function getDragAfterElement(container, y) {
  const cards = [...container.querySelectorAll(".card:not(.dragging)")];
  return cards.reduce(
    (closest, card) => {
      const box = card.getBoundingClientRect();
      const offset = y - box.top - box.height / 2;

      if (offset < 0 && offset > closest.offset) {
        return { offset, element: card };
      } else {
        return closest;
      }
    },
    { offset: Number.NEGATIVE_INFINITY }
  ).element;
}

function saveTaskFromlocalStorage(columnId, tasktext, taskdate) {
  const tasks = JSON.parse(localStorage.getItem(columnId) || "[]");
  tasks.push({ text: tasktext, date: taskdate });
  localStorage.setItem(columnId, JSON.stringify(tasks));
}
function loadFromLocalStorage() {
  const columnIds = ["todo", "doing", "done"];

  columnIds.forEach((cid) => {
    // console.log(" Column:", cid);

    const tasks = JSON.parse(localStorage.getItem(cid) || "[]");
    // console.log(" Tasks from Storage:", tasks);

    tasks.forEach((task) => {
      //   console.log(" Task:", task.text, task.date);

      const taskELement = createTaskELement(task.text, task.date);
      document.getElementById(`${cid}-tasks`).appendChild(taskELement);
    });

    updateTaskCount(cid);
  });
}
loadFromLocalStorage();
function updatelocalStorage() {
  ["todo", "doing", "done"].forEach((columnId) => {
    const tasks = [];
    document.querySelectorAll(`#${columnId}-tasks .card`).forEach((card) => {
      const taskText = card.querySelector("span").textContent;
      const taskDate = card.querySelector("small").textContent;
      tasks.push({ text: taskText, date: taskDate });
    });
    localStorage.setItem(columnId, JSON.stringify(tasks));
  });
}
