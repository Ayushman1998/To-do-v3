let skip = 0;
let currentCount = 0;
const addTodoButton = document.getElementById("button-addon2");

addTodoButton.addEventListener("click", async (event) => {
    event.preventDefault();

    const todo = document.getElementById("todoText").value;

    try {
        const submitTodoItem = await addTodoItem(todo);
        if (submitTodoItem) {
            console.log(`Added a new Todo! `, submitTodoItem);
        }
    } catch (errors) {
        console.error(errors);
    }

    document.getElementById("todoText").value = '';
    await getTodosList();
});

async function logout() {
    try {
        response = await axios.post('/logout');
        console.log(response.data);
    } catch (error) {
        console.log(error);
    }
}

async function addTodoItem(todo) {
    try {
        const response = await axios.post('/create-todo', { todo });

        if (response.data.status !== 200) {
            alert(response.data.message);
            return;
        }

        const newTodoItem = response.data.message;
        return newTodoItem;
    } catch (errors) {
        console.error(errors);
        console.log(res);
    }
}

async function editTodo(todoId) {
    let todoText = prompt("Please enter your todo");

    if (typeof (todoText) !== 'string' || !todoText) {
        return alert('Invalid Data');
    }

    try {
        const response = await axios.patch('/edit-todo', { todoId, todoText });
        
        if (response.data.status !== 200) {
            return alert(response.data.message);
        }

        const editedTodoItem = response.data;
        console.log(editedTodoItem);

    } catch (errors) {
        console.error(errors);
    }

    await getTodosList();
}

async function deleteTodo(todoId) {
    console.log(todoId);
    try {
        const response = await axios.delete('/delete-todo', { data: { todoId } });

        if (response.data.status !== 200) {
            return alert(response.data.message);
        }

        const deletedTodoItem = response.data;
        console.log(deletedTodoItem);

    } catch (errors) {
        console.error(errors);
    }
    skip -= 1;

    await getTodosList();
}

function renderList(todos) {
    document.getElementById('items-list').insertAdjacentHTML("beforeend", todos.map(item => {
        return `<li class="list-group-item d-flex align-items-center justify-content-between">
                <span class="item-text">${item.todo}</span>
                <div>
                    <button type="button" class="edit-button btn btn-secondary btn-sm me-1" id="${item._id}"  onclick="editTodo(this.id)">Edit</button>
                    <button type="button" class="delete-button btn btn-danger btn-sm ms-1" id="${item._id}"  onclick="deleteTodo(this.id)">Delete</button>
                </div>
            </li>`
    }).join(''));
    skip += todos.length;
}

async function showMore() {
    try {
        const response = await axios.get(`/read-todo?skip=${skip}`);
        if (response.status !== 200) {
            return alert('Failed to read todos. Please try again');
        }

        if (response.data.status !== 200) {
            return alert(response.data.message);
        }

        const todos = response.data.data;

        if (todos.length == 0) {
            return alert("You don't have more todos");
        }

        renderList(todos);

    } catch (error) {
        console.log(error);
        alert('Something went wrong!');
    }
}

async function getTodosList() {
    skip = 0;
    try {
        const response = await axios.get('/read-todo');

        if (response.status !== 200) {
            return alert('Failed to read todos. Please try again');
        }

        if (response.data.status !== 200) {
            return alert(response.data.message);
        }

        const todos = response.data.data;
        document.getElementById('items-list').innerHTML = '';
        renderList(todos);

    } catch (error) {
        console.log(error);
        alert('Something went wrong!');
    }
}

window.onload = getTodosList;