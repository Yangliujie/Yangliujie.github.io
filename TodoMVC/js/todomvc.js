// 当前任务总数
let todoCount = 0;
// 最大任务id
let maxTodoId = 0;
// 当前进行中任务数
let currentRemainTodo = 0;
// 当前过滤器 0-全部 1-进行中 2-已完成
const FILTER_ALL = 0;
const FILTER_REMAIN = 1;
const FILTER_COMPLETED = 2;
let currentFilter = FILTER_ALL;


// 各种页面元素
const mainDiv = document.getElementById('main');
const toggleAllCheckbox = document.getElementById('toggle-all');
const todoListUl = document.getElementById('todo-list');
const footerDiv = document.getElementById('footer');
const todoCountNumSpan = document.getElementById('todo-count-num');
const filterAllLink = document.getElementById('filter-all');
const filterRemainLink = document.getElementById('filter-remain');
const filterCompletedLink = document.getElementById('filter-completed');
const clearCompletedBtn = document.getElementById('clear-completed');

/**
 * 从本地存储中初始化数据
 */
function initData() {
    todoCount = localStorage.getItem('todoCount');
    maxTodoId = localStorage.getItem('maxTodoId');
    currentRemainTodo = localStorage.getItem('remainTodo');
    currentFilter = localStorage.getItem('filter');
}

/**
 * 保存数据到本地存储
 */
function saveData() {
    localStorage.setItem('todoCount', todoCount);
    localStorage.setItem('remainTodo', currentRemainTodo);
    localStorage.setItem('filter', currentFilter);
}

/**
 * 新任务输入框按键弹起事件
 * @param e 事件
 */
function onNewTodoKeyup(e) {
    const evt = window.event || e;
    if (evt.key === 'Enter') {
        const newTodo = document.getElementById('new-todo').value;
        if (newTodo && newTodo.trim() !== '') {
            document.getElementById('new-todo').value = '';
            const currentTodoId = maxTodoId++;
            const newLi = createNewTodoItem(currentTodoId, newTodo.trim(), false);
            document.getElementById('todo-list').appendChild(newLi);
            todoCount++;
            currentRemainTodo++;
            updateRemainTodoState();
            updateFilter(currentFilter);
        }
    }
}

/**
 * 创建新任务条目
 * @param newTodo 新任务内容
 * @param isCompleted 是否完成
 * @returns {HTMLLIElement} 新条目<li>DOM对象
 */
function createNewTodoItem(currentTodoId, newTodo, isCompleted) {
    /*
    <li id="todo-li-0" class="todo">
        <div class="view">
            <input id="todo-toggle-0" type="checkbox" class="toggle" onchange="onTodoItemToggleChange()">
            <label id="todo-label-0" ondblclick="onTodoItemDoubleClick()">test</label>
            <button id="todo-destroy-0" class="destroy" onclick="onDestroyTodoItemClick()"></button>
        </div>
        <input id="todo-edit-0" type="text" class="edit" onblur="onTodoItemEditBlur()">
    </li>
     */

    // 构建HTML元素
    const newLi = document.createElement('li');
    newLi.id = 'todo-li-' + currentTodoId;
    newLi.className = 'todo';
    const newDiv = document.createElement('div');
    newDiv.className = 'view';
    newLi.appendChild(newDiv);
    const newCheckbox = document.createElement('input');
    newCheckbox.id = 'todo-toggle-' + currentTodoId;
    newCheckbox.type = 'checkbox';
    newCheckbox.className = 'toggle';
    newCheckbox.onchange = onTodoItemToggleChange;
    newDiv.appendChild(newCheckbox);
    const newLabel = document.createElement('label');
    newLabel.id = 'todo-label-' + currentTodoId;
    newLabel.ondblclick = onTodoItemDoubleClick;
    newLabel.innerText = newTodo;
    newDiv.appendChild(newLabel);
    const newDestroyButton = document.createElement('button');
    newDestroyButton.id = 'todo-destroy-' + currentTodoId;
    newDestroyButton.className = 'destroy';
    newDestroyButton.onclick = onDestroyTodoItemClick;
    newDiv.appendChild(newDestroyButton);
    const newEditInput = document.createElement('input');
    newEditInput.id = 'todo-edit-' + currentTodoId;
    newEditInput.type = 'text';
    newEditInput.className = 'edit';
    newEditInput.onblur = onTodoItemEditBlur;
    newEditInput.onkeyup = onTodoItemEditKeyup;
    newLi.appendChild(newEditInput);

    return newLi;
}

/**
 * 更新剩余任务状态信息（剩余任务数、清除已完成按钮显示以及任务列表是否展示）
 */
function updateRemainTodoState() {
    todoCountNumSpan.innerText = currentRemainTodo.toString();
    toggleAllCheckbox.checked = currentRemainTodo === 0 && todoCount !== 0;
    if (currentRemainTodo === todoCount) {
        clearCompletedBtn.style.display = 'none';
    } else {
        clearCompletedBtn.style.display = '';
    }
    if (todoCount === 0) {
        mainDiv.style.display = 'none';
        footerDiv.style.display = 'none';
    } else {
        mainDiv.style.display = '';
        footerDiv.style.display = '';
    }
}

/**
 * 标记所有为已完成按钮改变事件
 * @param e 事件
 */
function onToggleAllChange(e) {
    const evt = window.event || e;
    const checkStste = evt.target.checked;
    const todoListLiArray = todoListUl.getElementsByTagName('li');
    for (let i = 0; i < todoListLiArray.length; i++) {
        const itemToggle = todoListLiArray[i].getElementsByTagName('div')[0].getElementsByTagName('input')[0];
        if (itemToggle.checked !== checkStste) {
            itemToggle.click();
        }
    }
}

/**
 * 任务条目状态标记按钮改变事件
 * @param e 事件
 */
function onTodoItemToggleChange(e) {
    const idArray = e.target.id.split('-');
    const idNum = idArray[idArray.length - 1];
    if (e.target.checked) {
        document.getElementById('todo-li-' + idNum).className = 'todo completed';
        currentRemainTodo--;
    } else {
        document.getElementById('todo-li-' + idNum).className = 'todo';
        currentRemainTodo++;
    }
    updateRemainTodoState();
    updateFilter(currentFilter);
}

/**
 * 任务条目双击事件
 * @param e 事件
 */
function onTodoItemDoubleClick(e) {
    const idArray = e.target.id.split('-');
    const idNum = idArray[idArray.length - 1];
    document.getElementById('todo-li-' + idNum).className = 'todo editing';
    document.getElementById('todo-edit-' + idNum).value = document.getElementById('todo-label-' + idNum).innerText;
    document.getElementById('todo-edit-' + idNum).focus();
}

/**
 * 任务条目编辑失去焦点事件
 * @param e 事件
 */
function onTodoItemEditBlur(e) {
    const idArray = e.target.id.split('-');
    const idNum = idArray[idArray.length - 1];
    const newTodo = document.getElementById('todo-edit-' + idNum).value;
    if (newTodo && newTodo.trim() !== '') {
        document.getElementById('todo-label-' + idNum).innerText = newTodo.trim();
        document.getElementById('todo-edit-' + idNum).value = '';
        if (document.getElementById('todo-toggle-' + idNum).checked) {
            document.getElementById('todo-li-' + idNum).className = 'todo completed';
        } else {
            document.getElementById('todo-li-' + idNum).className = 'todo';
        }
    } else {
        document.getElementById('todo-destroy-' + idNum).click();
    }
}

/**
 * 任务条目编辑框按键弹起事件
 * @param e 事件
 */
function onTodoItemEditKeyup(e) {
    const evt = window.event || e;
    if (evt.key === 'Enter') {
        const idArray = e.target.id.split('-');
        const idNum = idArray[idArray.length - 1];
        document.getElementById('todo-edit-' + idNum).blur();
    }
}

/**
 * 销毁任务条目按钮点击事件
 * @param e 事件
 */
function onDestroyTodoItemClick(e) {
    const idArray = e.target.id.split('-');
    const idNum = idArray[idArray.length - 1];
    todoCount--;
    if (!document.getElementById('todo-toggle-' + idNum).checked) {
        currentRemainTodo--;
    }
    updateRemainTodoState();
    updateFilter(currentFilter);
    todoListUl.removeChild(document.getElementById('todo-li-' + idNum));
}

/**
 * 清除所有已完成按钮点击事件
 */
function onClearCompletedBtnClick() {
    const todoListLiArray = todoListUl.getElementsByTagName('li');
    for (let i = 0; i < todoListLiArray.length; i++) {
        const itemToggle = todoListLiArray[i].getElementsByTagName('div')[0].getElementsByTagName('input')[0];
        if (itemToggle.checked) {
            todoListLiArray[i].getElementsByTagName('div')[0].getElementsByTagName('button')[0].click();
            i--;
        }
    }
}

/**
 * 更新过滤器
 * @param filter 当前过滤器
 */
function updateFilter(filter) {
    currentFilter = filter;
    const todoListLiArray = todoListUl.getElementsByTagName('li');
    switch (currentFilter) {
        case FILTER_ALL:
            filterAllLink.className = 'selected';
            filterRemainLink.className = '';
            filterCompletedLink.className = '';
            for (let i = 0; i < todoListLiArray.length; i++) {
                todoListLiArray[i].style.display = '';
            }
            break;
        case FILTER_REMAIN:
            filterAllLink.className = '';
            filterRemainLink.className = 'selected';
            filterCompletedLink.className = '';
            for (let i = 0; i < todoListLiArray.length; i++) {
                const itemToggle = todoListLiArray[i].getElementsByTagName('div')[0].getElementsByTagName('input')[0];
                if (itemToggle.checked) {
                    todoListLiArray[i].style.display = 'none';
                } else {
                    todoListLiArray[i].style.display = '';
                }
            }
            break;
        case FILTER_COMPLETED:
            filterAllLink.className = '';
            filterRemainLink.className = '';
            filterCompletedLink.className = 'selected';
            for (let i = 0; i < todoListLiArray.length; i++) {
                const itemToggle = todoListLiArray[i].getElementsByTagName('div')[0].getElementsByTagName('input')[0];
                if (itemToggle.checked) {
                    todoListLiArray[i].style.display = '';
                } else {
                    todoListLiArray[i].style.display = 'none';
                }
            }
            break;
        default:
    }
}

/**
 * 过滤全部任务
 */
function todoFilterAll() {
    updateFilter(FILTER_ALL);
}

/**
 * 过滤进行中的任务
 */
function todoFilterRemain() {
    updateFilter(FILTER_REMAIN);
}

/**
 * 过滤已完成的任务
 */
function todoFilterCompleted() {
    updateFilter(FILTER_COMPLETED);
}
